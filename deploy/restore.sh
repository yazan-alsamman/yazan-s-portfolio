#!/usr/bin/env sh
# Restore a backup set made by deploy/backup.sh (or by the initial content transfer, RUNBOOK §4).
# DESTRUCTIVE: replaces the database contents and the media volume of THIS compose project.
#
#   deploy/restore.sh <path/to/STAMP-db.dump> <path/to/STAMP-media.tar.gz>
#
# The app is stopped during the restore and started again afterwards; pending committed
# migrations are applied by the app on startup (prodMigrations).
set -eu

cd "$(dirname "$0")/.."
# ENV_FILE / COMPOSE_PROJECT_NAME may be overridden for a rehearsal on another host (Phase 9 dry run).
ENV_FILE=${ENV_FILE:-deploy/.env.production}
COMPOSE="docker compose --env-file $ENV_FILE -f deploy/docker-compose.prod.yml"
# shellcheck disable=SC1090
set -a; . "$ENV_FILE"; set +a

DUMP=${1:?usage: restore.sh <db.dump> <media.tar.gz>}
MEDIA=${2:?usage: restore.sh <db.dump> <media.tar.gz>}
[ -f "$DUMP" ] && [ -f "$MEDIA" ] || { echo "backup files not found" >&2; exit 1; }
tar -tzf - < "$MEDIA" > /dev/null

printf 'Restore %s into %s? This replaces the current content. Type "restore": ' "$DUMP" "$POSTGRES_DB"
read -r answer
[ "$answer" = restore ] || { echo "aborted"; exit 1; }

$COMPOSE stop app
$COMPOSE up -d postgres
until $COMPOSE exec -T postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" > /dev/null 2>&1; do sleep 2; done
$COMPOSE exec -T postgres pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --exit-on-error < "$DUMP"

# Media: replace the project's media volume through a throwaway container of the postgres image
# (always present, unlike the app image on a fresh host). Files are handed to uid/gid 1000, the
# `node` user the app runs as. The volume is project-scoped (`<project>_media`, not `media`:
# `compose run -v media:…` would create an unrelated global volume — found in the Phase 9 dry
# run); on a fresh host it is created with compose's labels so `compose up` adopts it.
PROJECT=$($COMPOSE config | sed -n 's/^name: //p')
VOLUME="${PROJECT}_media"
docker volume inspect "$VOLUME" > /dev/null 2>&1 ||
  docker volume create --label com.docker.compose.project="$PROJECT" \
    --label com.docker.compose.volume=media "$VOLUME" > /dev/null
docker run --rm -i -v "$VOLUME:/restore" --entrypoint sh postgres:17-alpine \
  -c 'find /restore -mindepth 1 -delete && tar -C /restore -xzf - && chown -R 1000:1000 /restore' < "$MEDIA"

if docker image inspect "${APP_IMAGE:-yazan-portfolio:current}" > /dev/null 2>&1; then
  $COMPOSE up -d app
  echo "restored — wait for health, then run the post-deploy checks (RUNBOOK §6)"
else
  echo "restored — no app image yet: run deploy/deploy.sh (it builds the pages from the restored content)"
fi
