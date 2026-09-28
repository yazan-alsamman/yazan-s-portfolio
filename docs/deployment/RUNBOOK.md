# Production Runbook — yazanalsamman.com

**Status:** prepared and dry-run in Phase 9 (local Docker, self-signed TLS). **Not yet executed on the VPS**: the first real deployment requires the owner's authorization (Phase 9 report §23).
**Topology (ADR-012):**

```text
Internet ──443/80──▶ host nginx (TLS, HSTS, HTTP→HTTPS, www→apex, rate limits)
                        │  deploy/nginx/yazanalsamman.com.conf
                        ▼  127.0.0.1:3000 (loopback only)
                  app container — node server.js (Next.js standalone + Payload), user `node`
                        │  private network `backend`
                        ▼
                  postgres:17-alpine — volume `pgdata` (loopback 127.0.0.1:5433 for builds/backups)
                  media volume `media` → /app/media (uploads + derivatives)
```

Everything is one compose project (`yazan-portfolio-prod`) with its own network and volumes. **The VPS may already run other services: nothing in this runbook stops, removes, prunes or reconfigures anything outside this project.** Never run `docker system prune`, `docker volume prune` or `docker compose down -v` on the VPS.

## 1. Requirements

| Item | Value |
|---|---|
| OS | Any current Linux with Docker Engine ≥ 24 + Compose v2 (provider not yet selected, ADR-012) |
| RAM | ≥ 2 GB (app limit 1 GB, Postgres 512 MB; the image build needs ~1.5 GB transiently) |
| Disk | ≥ 10 GB free (images, database, media, local backups) |
| Node / pnpm | **Not needed on the host.** Inside the image: `node:24-alpine`, pnpm **11.10.0** via corepack (`packageManager` in package.json) |
| Git | To check out the repository (private; deploy key or HTTPS token with read access) |
| nginx + certbot | On the host (or an existing reverse proxy that can forward to 127.0.0.1:3000) |
| Ports open | 22 (SSH, key-only), 80, 443. Nothing else: Postgres and the app bind to 127.0.0.1 only |

## 2. Configuration

1. `cp deploy/env.production.example deploy/.env.production && chmod 600 deploy/.env.production`
2. Fill every value. Secrets: `openssl rand -hex 32` (hex, because the Postgres password is embedded in a URL).
3. `SITE_URL=https://yazanalsamman.com` (no trailing slash), `SITE_ENV=production`. The app refuses to start with an http production URL or with `DESIGN_PREVIEW=true` (ADR-016/019).

| Variable | Used by | Notes |
|---|---|---|
| `SITE_URL`, `SITE_ENV` | build + runtime | canonicals, sitemap, CSRF/CORS allow-list, Secure cookies, indexability |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | postgres, app (URL is composed in the compose file) | never logged |
| `POSTGRES_HOST_PORT` | loopback port for the build and backups | default 5433 |
| `PAYLOAD_SECRET` | build + runtime | rotating it signs everyone out |
| `REVALIDATE_SECRET` | runtime | signs `POST /api/internal/revalidate` |
| `APP_PORT` | loopback port nginx forwards to | default 3000 |
| `BUILD_DB_HOST`, `BUILD_NETWORK` | image build | `127.0.0.1` + `host` on Linux |

The image contains **no** `.env` (the Dockerfile fails the build if one reaches the standalone output, R-40). Runtime configuration is injected by compose.

## 3. One-time host setup (owner / operator)

1. OS hardening (R-23): SSH key-only + no root login; firewall allowing 22/80/443 only; unattended security updates; fail2ban (optional).
2. DNS: `yazanalsamman.com` A/AAAA → VPS; `www` → same.
3. nginx + certificate:
   ```sh
   sudo mkdir -p /var/www/certbot
   sudo certbot certonly --webroot -w /var/www/certbot -d yazanalsamman.com -d www.yazanalsamman.com
   sudo cp deploy/nginx/yazanalsamman.com.conf /etc/nginx/sites-available/
   sudo ln -s /etc/nginx/sites-available/yazanalsamman.com.conf /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
   (For the very first certificate, serve only the port-80 block until `certbot` succeeds.) Renewal: the certbot timer; add `--deploy-hook "systemctl reload nginx"`.
4. If the host already has a reverse proxy (Caddy, Traefik, another nginx), reproduce the same rules there instead: TLS, HSTS, HTTP→HTTPS, www→apex, `client_max_body_size 25m`, the two rate limits, `X-Forwarded-*`.

## 4. First deployment (initial content transfer)

The real content (projects, certificates, profile, media) lives today in the owner's local database. It is moved once, as a backup set:

```sh
# on the owner's machine (project folder)
docker exec yazan-portfolio-postgres pg_dump -U yazan_portfolio -d yazan_portfolio -Fc > portfolio-db.dump
tar -C media -czf portfolio-media.tar.gz .
scp portfolio-db.dump portfolio-media.tar.gz <vps>:~/transfer/

# on the VPS
docker compose --env-file deploy/.env.production -f deploy/docker-compose.prod.yml up -d postgres
sh deploy/restore.sh ~/transfer/portfolio-db.dump ~/transfer/portfolio-media.tar.gz   # asks for confirmation
sh deploy/deploy.sh      # builds the static pages from the restored content, then starts the app
```

Order matters: the image build reads the CMS (R-33), so the content must be in the database **before** the first build. `restore.sh` needs only the postgres image (media are written through it).

The dump includes the local admin account. **After the first sign-in, change its password** in `/admin` (the local password has been on a development machine). A fresh install without a dump gets its first admin only from a CLI seed (anonymous registration is blocked, R-32): `docker build --target build -t yazan-portfolio:tools . ` then run `pnpm cms:seed` in that image with `CMS_ADMIN_EMAIL`/`CMS_ADMIN_PASSWORD` set.

## 5. Routine deployment and rollback

```sh
git pull --ff-only
sh deploy/deploy.sh            # DB up → build (reads the CMS) → tag <sha> → start → wait for health
sh deploy/deploy.sh rollback   # start the previous image again (no build)
```

- The runtime command is **`node server.js`** in the standalone output (`CMD` in the Dockerfile) — never `next start` (ADR-002 Phase 1 amendment).
- Pending committed migrations run on startup (`prodMigrations`). A rollback does **not** undo a migration: before deploying a release with a migration, take a backup (§8); roll back data with `restore.sh` if needed.
- Every build is a clean image build (no local `.next`, no e2e cache — R-60; `.dockerignore` excludes `.next`). The BuildKit cache key includes a hash of the build env (R-38).
- Downtime: the app container is replaced in place (a few seconds of 502 from nginx). Acceptable for a portfolio; no rolling deployment.

## 6. Post-deploy checks (every deployment)

```sh
curl -fsS http://127.0.0.1:3000/api/internal/health         # {"status":"ok"}
# Warm the project pages (they are rendered on first request, then cached — Phase 9 finding R-62):
curl -s https://yazanalsamman.com/sitemap.xml | grep -o '<loc>[^<]*' | cut -c6- | xargs -n1 curl -s -o /dev/null -w '%{http_code} %{url_effective}\n'
```

From a workstation with the repository and Chrome:

```sh
BASE_URL=https://yazanalsamman.com HTTP_URL=http://yazanalsamman.com CMS_ADMIN_EMAIL=… CMS_ADMIN_PASSWORD=… \
  node tests/deployment/verify-deployment.mjs   # 15 checks; creates and removes a labelled fixture
BASE_URL=https://yazanalsamman.com PRODUCTION=true pnpm seo:audit
```

Expected: every EN route 200, every `/ar` route 404 (Arabic review gate), `/en/*` 308, unknown 404, `robots.txt` allows and lists the sitemap, security headers present (CSP, HSTS, nosniff, X-Frame-Options DENY).

## 7. Operations

| Topic | Procedure |
|---|---|
| Health | Docker healthcheck on `/api/internal/health` (app + DB). nginx only allows it from localhost. External uptime monitoring of `https://yazanalsamman.com/` is recommended (owner choice). |
| Restart | `restart: unless-stopped` on both services; they come back after a reboot. Manual: `docker compose … restart app`. After a restart, CMS edits made but not viewed before the restart are refreshed within ≤ ~1 h (R-45 bounded window); publishing again refreshes immediately. |
| Logs | `docker compose --env-file deploy/.env.production -f deploy/docker-compose.prod.yml logs -f app` — json-file driver, 5 × 10 MB per container. Expected noise: `ERROR: You are not allowed…` for anonymous 403 probes (R-39). |
| Password reset | No email adapter (R-35): the reset email is written to the app log. The operator can read the reset link there (`logs app`); nobody else can. Rate-limited at nginx. |
| Resource limits | app 1 GB, postgres 512 MB (compose `deploy.resources`). Measured in the dry run: see Phase 9 report §12. |
| Updates | Base images (`node:24-alpine`, `postgres:17-alpine`) are pulled on every build/`up`; rebuild monthly for security patches. Postgres major upgrades need a dump/restore. |

## 8. Backups and restore (R-19, R-52)

```sh
sh deploy/backup.sh            # → backups/<UTC stamp>-db.dump + -media.tar.gz, verified, 7 kept locally
sh deploy/restore.sh <db.dump> <media.tar.gz>   # destructive; asks for confirmation
```

- Schedule: daily via cron, e.g. `15 3 * * * cd /srv/yazan-portfolio && sh deploy/backup.sh >> backups/backup.log 2>&1`.
- **Off-host copy is required** (ADR-004: 7 daily / 4 weekly / 6 monthly off-host). The tool (rclone, restic, provider snapshots) is the owner's choice; it is not configured yet.
- Database and media are always backed up and restored **together** (a DB without its media shows "Failed" media in the dashboard).
- Restore was rehearsed in the Phase 9 dry run (report §12).

## 9. Security notes

- `/admin` has password auth with lockout (5 attempts / 15 min), 2-hour server-side sessions, `Secure; HttpOnly; SameSite=Lax` cookies, CSRF allow-list = `SITE_URL`. There is no 2FA (R-10): the nginx site has an optional IP allow-list block for `/admin`.
- Only the app and nginx are reachable; Postgres is loopback + private network only.
- The build secret file is created with mode 600 in `/tmp` and deleted by `deploy.sh`; `deploy/.env.production` must stay mode 600 and is git-ignored.
