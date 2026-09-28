# syntax=docker/dockerfile:1.7
# Production image for the VPS (ADR-012 / T14). Build:
#   docker build --secret id=buildenv,src=<env file> -t yazan-portfolio:local .
# Secrets are mounted only for the build step (never stored in a layer). The build needs
# DATABASE_URL because public pages are statically generated from the CMS.

FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@11.10.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir /pnpm/store --network-concurrency 4 --fetch-timeout 600000 --fetch-retries 6

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# BuildKit does NOT include secret contents in the cache key: without this, changing SITE_URL /
# SITE_ENV / secrets would silently reuse a stale build. Pass a hash of the env file (not a secret):
#   --build-arg BUILD_ENV_ID=$(sha256sum <env file> | cut -c1-16)
ARG BUILD_ENV_ID=unset
# The secret is mounted OUTSIDE /app and exported into the build process only. Never mount it as
# /app/.env: Next's standalone output copies any .env it finds into the bundle (found in T14 —
# the image shipped the database password and Payload secret). The assertion fails the build if
# an env file ever reaches the standalone output again.
RUN --mount=type=secret,id=buildenv,target=/run/secrets/buildenv \
    echo "build env ${BUILD_ENV_ID}" \
    && set -a && . /run/secrets/buildenv && set +a \
    && pnpm build \
    && if ls -a .next/standalone | grep -qE '^\.env'; then echo 'FATAL: .env in standalone output' >&2; exit 1; fi

FROM node:24-alpine AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 MEDIA_DIR=/app/media
WORKDIR /app
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
RUN mkdir -p /app/media && chown node:node /app/media
USER node
VOLUME ["/app/media"]
EXPOSE 3000
# Pending committed migrations are applied on startup (payload prodMigrations).
CMD ["node", "server.js"]
