#!/usr/bin/env sh
# Build and (re)deploy the app on the VPS. Runbook: docs/deployment/RUNBOOK.md §5.
#
#   deploy/deploy.sh            build the checked-out commit, then start it
#   deploy/deploy.sh rollback   start the previously deployed image again (no build)
#
# Order (R-33): database up → build (reads the CMS) → start → health check. The build secret is a
# temporary file outside the build context, mounted only for the build step (never in a layer).
set -eu

cd "$(dirname "$0")/.."

# Pull the latest code first, then re-run the (possibly updated) script so the rest of it is the new version.
if [ "${1:-}" != rollback ] && [ -z "${DEPLOY_PULLED:-}" ]; then
  git pull --ff-only
  DEPLOY_PULLED=1 exec sh deploy/deploy.sh "$@"
fi

# ENV_FILE / COMPOSE_PROJECT_NAME may be overridden for a rehearsal on another host (Phase 9 dry run).
ENV_FILE=${ENV_FILE:-deploy/.env.production}
COMPOSE="docker compose --env-file $ENV_FILE -f deploy/docker-compose.prod.yml"
[ -f "$ENV_FILE" ] || { echo "missing $ENV_FILE (template: deploy/env.production.example)" >&2; exit 1; }

# shellcheck disable=SC1090
set -a; . "$ENV_FILE"; set +a

wait_healthy() {
  i=0
  while [ $i -lt 30 ]; do
    status=$(docker inspect -f '{{.State.Health.Status}}' "$($COMPOSE ps -q app)" 2>/dev/null || echo starting)
    [ "$status" = healthy ] && { echo "app healthy"; return 0; }
    i=$((i + 1)); sleep 5
  done
  echo "app did not become healthy — check: $COMPOSE logs app" >&2
  return 1
}

if [ "${1:-}" = rollback ]; then
  docker image inspect yazan-portfolio:previous > /dev/null
  docker tag yazan-portfolio:previous yazan-portfolio:current
  $COMPOSE up -d app
  wait_healthy
  exit 0
fi

[ -z "$(git status --porcelain)" ] || [ "${ALLOW_DIRTY:-}" = 1 ] || { echo "work tree not clean: deploy only committed code" >&2; exit 1; }
REV=$(git rev-parse --short HEAD)

$COMPOSE up -d postgres
until $COMPOSE exec -T postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" > /dev/null 2>&1; do sleep 2; done

BUILD_ENV=$(mktemp)
trap 'rm -f "$BUILD_ENV"' EXIT
chmod 600 "$BUILD_ENV"
cat > "$BUILD_ENV" <<EOF
SITE_URL=$SITE_URL
SITE_ENV=$SITE_ENV
DATABASE_URL=postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@${BUILD_DB_HOST:-127.0.0.1}:${POSTGRES_HOST_PORT:-5433}/$POSTGRES_DB
PAYLOAD_SECRET=$PAYLOAD_SECRET
REVALIDATE_SECRET=$REVALIDATE_SECRET
EOF
# R-38: BuildKit ignores secret contents in its cache key; this non-secret hash invalidates the build step.
BUILD_ENV_ID=$( (sha256sum "$BUILD_ENV" 2>/dev/null || shasum -a 256 "$BUILD_ENV") | cut -c1-16)

DOCKER_BUILDKIT=1 docker build \
  --network "${BUILD_NETWORK:-host}" \
  --secret id=buildenv,src="$BUILD_ENV" \
  --build-arg BUILD_ENV_ID="$BUILD_ENV_ID" \
  -t "yazan-portfolio:$REV" .

# Keep the running image for `deploy.sh rollback`.
if docker image inspect yazan-portfolio:current > /dev/null 2>&1; then
  docker tag yazan-portfolio:current yazan-portfolio:previous
fi
docker tag "yazan-portfolio:$REV" yazan-portfolio:current
$COMPOSE up -d app
wait_healthy
echo "deployed $REV — run the post-deploy checks (RUNBOOK §6)"
