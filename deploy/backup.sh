#!/usr/bin/env sh
# Consistent backup of the database AND the media volume (R-19, R-52): a database restore without
# the matching media leaves broken images. Runbook: docs/deployment/RUNBOOK.md §8.
#
#   deploy/backup.sh [target-dir]      default: ./backups (git-ignored)
#
# Produces <stamp>-db.dump (pg_dump custom format) and <stamp>-media.tar.gz, then applies the
# ADR-004 retention locally (7 daily). Copying the set OFF the VPS is required and host-specific
# (e.g. rclone/restic to object storage) — a backup on the same disk is not a backup.
set -eu

cd "$(dirname "$0")/.."
# ENV_FILE / COMPOSE_PROJECT_NAME may be overridden for a rehearsal on another host (Phase 9 dry run).
ENV_FILE=${ENV_FILE:-deploy/.env.production}
COMPOSE="docker compose --env-file $ENV_FILE -f deploy/docker-compose.prod.yml"
# shellcheck disable=SC1090
set -a; . "$ENV_FILE"; set +a

TARGET=${1:-backups}
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p "$TARGET"
chmod 700 "$TARGET"

$COMPOSE exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > "$TARGET/$STAMP-db.dump"
# Media: read through the app container's mount (read-only use; the volume name is compose-scoped).
$COMPOSE exec -T app tar -C /app/media -czf - . > "$TARGET/$STAMP-media.tar.gz"

# Integrity: the dump must be readable and the archive listable.
$COMPOSE exec -T postgres pg_restore --list < "$TARGET/$STAMP-db.dump" > /dev/null
tar -tzf - < "$TARGET/$STAMP-media.tar.gz" > /dev/null
chmod 600 "$TARGET/$STAMP-db.dump" "$TARGET/$STAMP-media.tar.gz"

# Local retention: keep the 7 newest sets (weekly/monthly retention lives off-host, ADR-004).
ls -1 "$TARGET"/*-db.dump | sort -r | tail -n +8 | while read -r old; do
  rm -f "$old" "${old%-db.dump}-media.tar.gz"
done
echo "backup $STAMP written to $TARGET"
