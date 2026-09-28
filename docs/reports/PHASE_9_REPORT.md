# Phase 9 Report — Production Readiness, Deployment Hardening & Final Validation

**Date:** 2026-09-28/29 · **Branch:** `main` (HEAD `af32158`, uncommitted work tree) · **Scope:** production readiness only. The design, the cinematic scene, the content, the CMS model, routing/i18n and the Arabic gate were not changed.

**Measurement labels** (as in Phase 8):

- **REAL HW**: the Lenovo Legion 5 laptop (Ryzen 7 5800H, Radeon iGPU / RTX 3050 dGPU).
- **SIMULATED**: the same laptop with CDP CPU/network throttling and/or mobile emulation.
- **NOT MEASURED — reason**: no numbers were estimated.

---

## 1. Executive Summary

Phase 9 fixed the two build hazards Phase 8 left open (R-60, R-61) and turned the deployment into tested code: a production compose file, an nginx site, deploy/rollback/backup/restore scripts and a runbook. It then rehearsed the whole path in a **local Docker dry run**: Linux container, PostgreSQL, media volume, nginx with TLS.

**The dry run found two production blockers that no earlier check could see. Both are fixed:**

1. **The Docker image could not be built at all.** It had been broken since Phase 3: `.dockerignore` excluded `portrait.jpg`, which the pages import (R-64).
2. **A redeploy could ship stale or 404 pages.** BuildKit cannot see the database the pages are generated from. The first version of `deploy.sh` would have reused a cached build layer after content changes (now `--no-cache-filter build`).

**Final evidence, on the final code:**

| Area | Result |
|---|---|
| E2E | **164 passed, 0 failed** (final run) |
| Unit / CMS tests | 95/95 unit, 49/49 CMS |
| Content routes (EN 200, `/ar` 404) | 22/22 correct, after every build sequence, in the container and behind TLS |
| Deployment checks | **15/15** through nginx TLS on the Linux container (one new check: security headers) |
| SEO audit | 22 pages, 0 errors |
| axe (WCAG 2.2 AA) | 0 violations |
| CSP | 0 violations, public site with WebGL and signed-in admin |
| Cinematic regression | identical to Phase 8 (max difference 0.07) |
| Critical JS (`/`) | byte-identical |
| Admin code in public chunks | none |
| Restore rehearsal | passed |
| Second deploy and rollback | passed |

**Not measured:** physical phones, desktop PC, lower-power laptop, Lighthouse and field Core Web Vitals. The site is not deployed, and no such hardware or dependency was available.

**Measured, and worse than in Phase 8, in both builds:** today the SIMULATED mobile lab INP proxy is 192–320 ms. An interleaved A/B shows Phase 9 did not cause this: the machine ran in *Balanced* power mode at 1.99 of 3.2 GHz with 6 containers (§13).

**Verdict: BLOCKED — OWNER ACTION REQUIRED** (§24). No code-side production blocker remains. What remains is owner-only:
- the VPS, DNS, TLS certificate, production secrets and deploy authorization;
- the off-host backup target;
- decisions on `/admin` exposure (R-10) and R-59.

## 2. Starting State

- `main` @ `af32158`; 108 status entries (38 modified, 3 deleted, untracked Phase 2–8 work), saved as `scratchpad/p9/git-initial.txt`. Remote `origin` = private GitHub repository.
- The Docker daemon was **not running** (so neither was the project database). I started Docker Desktop. That also auto-started containers with restart policies (`yazan-portfolio-postgres` and the unrelated Tavla stack), as in earlier phases. Nothing else was started, stopped or modified.
- The foreign `next dev` server from Phase 8 was no longer running.
- `portrait.jpg` SHA-256 `1c00fa07…323fca`; `.env` mtime 2026-09-27 21:23.
- **21st.dev MCP unavailable in this session; no workaround or credential exposure was used.** No design work was needed (§24 of the prompt: not a design phase). No UI was redesigned.

Documents read: README, CLAUDE/AGENTS (Next 16 notice), ADRs (002/003/004/005/007/008/009/010/011/012/015/016/018/019 and all amendments), RISK_REGISTER, TECHNICAL_ARCHITECTURE, PERFORMANCE_ACCESSIBILITY, SECURITY, PHASE_8_REPORT in full, and the Phase 2 T14 evidence. The Next 16 bundled docs were read for `distDir`, `cacheHandler`, revalidation, CSP/SRI and `connection()`. The other specification and report documents were consulted for the parts this phase touches.

## 3. R-60 Fix (HIGH → CLOSED)

**Problem.** The E2E build (empty `_e2e` database) wrote one-year `unstable_cache` entries to `.next/cache/fetch-cache`. A later production build reused them and prerendered content routes as 404.

**Fix: two independent layers.** Either one alone prevents the incident.

1. **Build isolation.**
   - E2E builds into its own directory, `.next/e2e`: `NEXT_DIST_DIR` in `next.config.ts`, set only by `playwright.config.ts`.
   - `tests/e2e/prepare-e2e.mjs` refuses to build unless it points at an e2e directory.
   - `next.config.ts` accepts only `.next` or `.next/<name>`, so git, Docker, ESLint, Prettier and Tailwind ignore it automatically.
   - `tsconfig.json` pre-lists `.next/e2e/types`, because Next otherwise rewrites tsconfig.
2. **Cache-key scoping** (`src/content/cache-scope.ts`, used by every repository key).
   - Each key carries a hash of the database location (host, port, name; never credentials), `SITE_URL` and `SITE_ENV`.
   - An entry written against another database cannot be read, even from a shared cache.
   - Covered by 4 unit tests.

**Verification** (production builds with `SITE_ENV=production`, `SITE_URL=https://yazanalsamman.com`; no manual cache cleanup):

| Sequence | Content routes EN | `/ar` routes | Other |
|---|---|---|---|
| prod build → verify | 22/22 × 200 | 22/22 × 404 | — |
| → **E2E** (164 passed; production `BUILD_ID` untouched, production data cache untouched) → **prod build** → verify | 22/22 × 200 | 22/22 × 404 | — |
| → **E2E** → *adversarial:* the 50 E2E cache entries copied **into** `.next/cache/fetch-cache` (138 → 188) → **prod build** → verify | 22/22 × 200 | 22/22 × 404 | the key scoping alone held |
| final: **E2E** (run 4) → **prod build** → verify | 22/22 × 200 | 22/22 × 404 | final state of the tree |

The Docker build never sees a local `.next` (`.dockerignore`), and every image build regenerates the pages (§11).

## 4. R-61 Fix (LOW → CLOSED)

**Fix.** `src/app/globals.css`: `@import 'tailwindcss' source('../')` limits class detection to `src/`. The only files outside `src/` that mention class names are the ESLint config and an offline share-image script; neither ships CSS.

**Before → after** (public stylesheet, identical on every route):

| | Raw | gzip |
|---|---|---|
| Before | 45,414 B | 10,024 B |
| After | **45,186 B** | **9,957 B** |

- The diff removes exactly 7 selectors: `.invisible`, `.contents`, `.grow`, `.truncate`, `.rounded`, `.text-left`, `.text-start`. None is used in `src/`: the grep hits are only `rounded-*` variants and a code comment. Nothing was added.
- **Docs are now inert.** A temporary `docs/p9-tailwind-probe.md` containing `hue-rotate-180 skew-y-12 backdrop-sepia decoration-wavy` produced none of them in any CSS file. It was removed after the build.
- No visual change (§16).

## 5. R-59 Evaluation (kept OPEN — owner decision)

**Method.** A standalone page with the project's own three r186 and the scene's renderer settings (ACES, exposure 1.05, env intensity 0.55, production `checkShaderErrors = false`). The test scene is metal spheres of three roughness values plus a torus knot.

- **Cold** = a fresh Chrome profile per run (empty GPU program cache); **warm** = a reload in the same profile.
- Headed Chrome, REAL HW, iGPU 3 runs and dGPU 2 runs.
- Visual comparison of the rendered frame against the current implementation (A).

| Candidate | Cold env build | Cold max long task | Warm max long task | Visual vs A (mean / max) | Bytes / heap |
|---|---|---|---|---|---|
| **A** current: `fromScene(room, 0.04)`, size 256 | iGPU 622–645 ms · dGPU 615–616 ms | 783–827 / 806–828 ms | 63–70 ms | — | 0 / 7.7 MB heap |
| **B** smaller prefilter (size 128) | 626–634 / 620–707 ms | 754–813 / 815–897 ms | 58–65 ms | 0.40 / 42: changed reflections | 0 |
| **F** no pre-blur (sigma 0) | 569–584 / 561–565 ms | 739–761 / 760–762 ms | 61–71 ms | 0.24 / 61: changed reflections | 0 |
| **E** same work in `requestIdleCallback` (timing) | 662–876 / 614–683 ms | 660–872 / 613–681 ms | 0–53 ms | identical | 0 |
| **D** prebaked PMREM output (half-float CubeUV texture, no PMREM at runtime) | 38–64 / 39–46 ms | **166–339 / 190–196 ms** | 0 ms | **identical (0 / 0)** | **+6.3 MB raw, 1.19 MB gzip, 750 KB brotli**; heap +5.6 MB |

**Findings.**
- The cost is **shader compilation** (compile-bound): halving the prefilter size changes nothing.
- B and F alter the approved metal reflections and gain ≤ 60 ms, so they are rejected.
- E only moves the same task.
- **D is the only option that removes the long task, and it is pixel-identical.** It costs three times the entire scene chunk (250 KB gzip) in extra download on every first 3D visit, including phones on the Low tier, plus heap.
- The Phase 8 private-API warm-up was not revived: there is no new cold evidence for it.

**Decision.** Not applied. It is a byte-budget/product trade-off (a ~0.8 s cold long task after the page is already painted and interactive, versus +750 KB per first visit). A smaller lossless encoding of D is possible but was not built. R-59 stays OPEN with D documented as the ready option (§23).

## 6. Production Build Determinism

- **Clean inputs.** The Docker build starts from `pnpm install --frozen-lockfile` in a clean context:
  - no `.next`, `node_modules`, media, `.env*` at any depth, `backups/` or `photos/`;
  - the build env is mounted as a secret outside `/app`;
  - it succeeded twice (§12).
- **No dependency on the dev server or the E2E cache** (§3).
- **No stale CMS data**: every image build regenerates the pages from the current database (`--no-cache-filter build`). Verified: the second deploy re-ran the build step (106 s total).
- **No fixtures or development content**: `cms:verify-legacy` shows 0 published fixtures, and the sitemap, anonymous API and route matrix contain only real content (§7).
- **No development variables**: env validation rejects an http production URL and `DESIGN_PREVIEW=true` in production; `/design-system` → 404.
- **No accidental 404s**: route matrix after every build (§18).
- **Finding R-62 (LOW).** `generateStaticParams` returns the 14 project slugs (verified with a temporary probe, since reverted), but Next 16 does not emit them at build. Each project page is rendered on its first request and then cached (`x-nextjs-cache: HIT`). Status and content are correct; the runbook adds a post-deploy warm-up crawl.

## 7. CMS / Content Verification

| Check | Result |
|---|---|
| `pnpm cms:verify-legacy` | 0 errors, 0 unreachable, 0 published fixtures; 16 projects (14 published, 2 draft, 0 archived), 13 skills, 28 certificates, 1 education, 1 experience, 27 images |
| Drafts public? | No: sitemap lists 14 projects; anonymous `/api/projects?draft=true` returns 14, all `published`, 0 archived, `sourceNote` not exposed |
| `pnpm test:cms` | 49/49 |
| Admin code in public bundles | None in the 13 chunks public pages load (desktop routes + phone home, scene included; Phase 8 marker list) |
| Production database configuration | Compose composes `DATABASE_URL` from the `POSTGRES_*` values; the database is on a private network + loopback port only; migrations applied at startup (`prodMigrations`) |
| Media URLs | Derivatives served same-origin (`/api/media/file/...webp`, 200, `nosniff`, immutable cache); uploaded originals 404 anonymously (ADR-008, verified in the container) |
| Media persistence | Named volume; survived `docker restart`, `compose down`/`up` and a restore (§12) |

**Cache staleness (R-45, HIGH → mitigated).** Next keeps tag invalidations in memory only. Before this phase, a CMS edit not viewed before a restart or container re-create stayed stale until the next edit of the same source.

- **Now** pages (`[locale]/layout.tsx`), the sitemap and the repository data also revalidate after **1,800 s**, bounding that case to ≤ ~1 h (`Cache-Control: s-maxage=1800, stale-while-revalidate`).
- **Publishing is still immediate.** After a signed revalidation, the first request to the projects index, a project and a 404 is a `MISS`, a fresh blocking render. The E2E publish tests and the deployment "revalidation" check pass.

## 8. Arabic Gate Verification

The gate was not weakened.

- **Production build:** `/ar` and all 21 `/ar/...` content routes → 404; `/ar/does-not-exist` → 404.
- **Sitemap:** 22 URLs, all English. `hreflang` = `en` + `x-default` only (every page in the SEO audit).
- **Home:** `<link rel="alternate">` shows only `en` and `x-default`.
- **Container behind TLS:** `/ar` → 404 (deployment check).
- **Fallback:** no English content under `/ar` (every `/ar` URL is a 404).
- `src/config/copy-review.ts` is unchanged.

## 9. SEO Production Audit

| Check | Result |
|---|---|
| `pnpm seo:audit`, local production build (`PRODUCTION=true`) | **22 pages crawled, 22 sitemap URLs, 28 URLs checked, 0 errors**. Covers robots, sitemap, self-canonicals, hreflang reciprocity, JSON-LD, titles/descriptions, one H1, image alt, og:image reachable, no internal link to a 404/redirect |
| Same audit through nginx TLS on the container | Every check passes except the audit's deliberate rule "no development URL in a production sitemap": the rehearsal origin was `https://localhost:8443`. Expected. |
| robots.txt | `Allow: /`; `Disallow: /admin`, `/api`, `/design-system`, `/ar/design-system`; `Sitemap:` absolute |
| Canonical / og:url | `https://yazanalsamman.com` (no trailing slash) |
| Open Graph / Twitter | `og:image` (brand image or project cover with width/height/alt), `twitter:card=summary_large_image` |
| JSON-LD | Home `WebSite`/`Person`; project pages `BreadcrumbList` + `CreativeWork` |
| Redirects / trailing slash | `/en` → 308 `/`; `/en/about` → 308 `/about`; `/about/` → 308 `/about` |
| 404 | Status 404, `noindex` |

Observation (pre-existing, harmless): 404 pages carry two robots meta tags, both noindex.

**Not claimed:** Google indexing, rankings, Search Console data.

## 10. Security Audit

| Severity | Finding | Evidence | Mitigation | Status |
|---|---|---|---|---|
| HIGH | Docker image could not be built (R-64) | Dry-run build: `Can't resolve '../../../portrait.jpg'` | `portrait.jpg` no longer in `.dockerignore` | FIXED |
| MEDIUM | No security headers except noindex (R-27) | Phase 8 state | `src/lib/security-headers.ts` on every response (below); HSTS at nginx | FIXED — residual accepted |
| MEDIUM | Payload admin loaded the avatar from gravatar.com with a hash of the admin email (third-party request; also blocked by the CSP) | Browser audit: `img-src` violations for `www.gravatar.com` | `admin.avatar: 'default'` | FIXED (0 admin CSP violations) |
| MEDIUM | `deploy/.env.production` would have entered the Docker build context (`.env.*` matched only the root) | `.dockerignore` review | `**/.env`, `**/.env.*`, plus `backups`, `photos` excluded | FIXED |
| MEDIUM | Unknown project slugs create permanent cached 404 files (R-63) | 3 random slugs → 12 files; 61 → 244 in the container | nginx 60 req/min per IP on project paths (100 parallel → 79 × 429); deploy replaces the container | MITIGATED — follow-up |
| MEDIUM | Admin: password + lockout only, no 2FA (R-10) | Payload | nginx 5 req/min on login/reset (429 from the 7th attempt, verified); optional IP allow-list block ready | OPEN — owner decision |
| LOW | CSP keeps `'unsafe-inline'` for scripts | Static pages carry Next's inline RSC payload; nonces force dynamic rendering; SRI covers files only | No eval, no third-party origin, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`; no raw CMS HTML (audited) | ACCEPTED |
| LOW | Password reset has no email adapter (R-35) | Link is written to the app log | Operator-only log access; nginx rate limit | ACCEPTED |
| LOW | esbuild dev-server advisory via drizzle-kit (GHSA-67mh-4wv8-2f99, R-65) | `pnpm audit`: 1 moderate, 0 high/critical | Not reachable in production | ACCEPTED |
| INFO | `/api/access` answers anonymously with an all-false permission map | Payload standard | Reveals collection names only | ACCEPTED |

**Verified controls:**

- **Headers.** Checked on the local production build and through TLS: `Content-Security-Policy` (`default-src 'self'`; no third-party origin; `upgrade-insecure-requests` on https), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, microphone, geolocation, payment, … disabled), `Cross-Origin-Opener-Policy: same-origin`, `Strict-Transport-Security: max-age=31536000; includeSubDomains` (nginx). No `X-Powered-By`; `Server: nginx` without a version.
- **Auth and sessions** (deployment checks):
  - the login cookie is `Secure; HttpOnly; SameSite=Lax`;
  - logout revokes the session;
  - a foreign origin gets 403 (CSRF);
  - anonymous first-register, create and user list → 403 (R-32 guard holds);
  - 5-attempt lockout and 2 h sessions (config).
- **API exposure** (anonymous):
  - `/api/users`, `/api/audit-log` and `/api/payload-preferences` → 403;
  - `/api/users/me` returns `null`;
  - GraphQL is disabled (404).
- **Path traversal:** `/api/media/file/..%2f..%2f.env` → 403; `%2e%2e` → 404; `/_next/static/../../.env` and `/.env` → 404; no response contained secret-like content.
- **Error leakage:** 404/403 bodies are generic. The health endpoint answers `ok`/`unavailable` only and is reachable from localhost only through nginx (403 externally).
- **Source maps and debug:** no production browser source maps; no debug routes; `/design-system` → 404 in production.
- **Uploads:** Phase 5/6 validation unchanged (MIME allowlist, magic bytes, size/pixel limits, SVG rejected). Upload + derivative + anonymous-original-404 verified through TLS.
- **Raw HTML sinks:**
  - the theme script (static);
  - two JSON-LD scripts (`<` escaped);
  - rich text is rendered as React elements with `safeHref`.
- **Secrets:**
  - 287 files git would see: none contains any `.env` secret value;
  - the committed history: none;
  - the built image (243 MB exported): 0 secret values, no `.env` file.
  - The only pattern hit is the `$POSTGRES_PASSWORD` variable template in `deploy.sh`.
  - `.env` was never printed or modified.

**Not tested:** malware scanning of uploads (R-51, owner decision); a real certificate, firewall and SSH hardening (no VPS); penetration testing by a third party.

## 11. Deployment Architecture

**Topology** (the target in the prompt, implemented):

```text
Internet ─443/80─▶ host nginx (TLS, HSTS, HTTP→HTTPS, www→apex, rate limits)   deploy/nginx/yazanalsamman.com.conf
                     ▼ 127.0.0.1:3000
                app container: node server.js (Next standalone + Payload), user node, cap_drop ALL
                     ▼ private network "backend"
                postgres:17-alpine (volume pgdata; loopback 127.0.0.1:5433 for build/backups)
                media volume → /app/media
```

**Runbook coverage** (`docs/deployment/RUNBOOK.md`):

| Item | Where |
|---|---|
| Node 24 (`node:24-alpine`), pnpm **11.10.0** (corepack) | §1, Dockerfile |
| Build command | `sh deploy/deploy.sh` → `docker build` (secret env, `BUILD_ENV_ID`, `--no-cache-filter build`) |
| Standalone output / runtime command | `node server.js` in the standalone output (Dockerfile `CMD`); **not** `next start` |
| Environment variables | §2 table + `deploy/env.production.example` |
| Database / media persistence | named volumes `pgdata`, `media` |
| Reverse proxy / HTTPS | §3 (certbot webroot; renewal hook) |
| Health check | `GET /api/internal/health` (app + DB) → compose healthcheck; `deploy.sh` waits for healthy |
| Restart strategy | `restart: unless-stopped` |
| Logs | json-file, 5 × 10 MB |
| Backups | `sh deploy/backup.sh`, daily cron, off-host required |
| Deployment / rollback | §5: `sh deploy/deploy.sh` / `sh deploy/deploy.sh rollback` |
| First deployment | §4: content transfer order restore → build, then change the admin password |

Nothing in the runbook touches other services on the host: no prune, no `down -v`.

## 12. Docker / PostgreSQL — Local Dry Run

Everything ran in an isolated compose project `yazan-portfolio-dryrun` (its own network and volumes; loopback ports 3300/5440/8088/8443). The inputs were a copy of the real content (a `pg_dump` of the dev database and a media archive) and freshly generated secrets.

| Step | Result |
|---|---|
| `compose config` | valid |
| Postgres up → `restore.sh` (fresh host) | 14/16 projects published, 148 media files in the **project** volume, owner uid 1000. First attempt found a script bug: `compose run -v media:…` created a stray global volume `media`. Fixed by resolving `<project>_media`; the stray volume was removed. |
| `deploy.sh` #1 | **Failed**: R-64 (portrait). Fixed and re-run: build ~3 min, "app healthy". |
| nginx (committed config; only hostnames/upstream substituted) | `nginx -t` OK; HTTPS 200, HTTP→HTTPS 301, www→apex 301, HSTS present |
| `verify-deployment.mjs` via TLS | **15/15**. The Phase 2 media checks fetched the uploaded *original*, which has been private since Phase 6; they now check the WebP derivative (200) and the original (404 anonymously). |
| Route matrix via TLS | 22/22 EN 200, 22/22 `/ar` 404, redirects as expected |
| Browser audit via TLS | 0 axe, 0 CSP (incl. admin), 0 overflow, 0 focus issues |
| Rate limits | login: 6 × 401 then 429; project paths: 79/100 parallel → 429 |
| Health through proxy | 403 (localhost only); inside the container `{"status":"ok"}` |
| Image | 338 MB; 0 secrets; no `.env`; runs as `node`, `NODE_ENV=production`, Linux x86_64 |
| Resources at rest | app 200 MiB / 1 GiB limit, postgres 40 MiB / 512 MiB, nginx 18 MiB; CPU 0 % |
| `compose down` → `up` (volumes kept) | healthy; 14 projects; pages 200 |
| **Backup → damage → restore** | `backup.sh` made a verified dump + media set. Damage: all projects archived via SQL and 27 media files deleted (visible projects 0, files 121). Restored: 14 published projects, 148 files, 480w derivative 200. |
| `deploy.sh` #2 | the build step **re-ran** (not cached), 106 s; new image; healthy |
| `deploy.sh rollback` | switched back to the previous image; healthy |
| Cleanup | removed the dry-run containers, network, volumes and my images (`current`/`previous`/`af32158`, `alpine`), plus the dump, media archive, secrets and cert in the scratchpad. Pre-existing images (`t14`, base images), Tavla and the dev database were not touched. |

## 13. Performance Measurements

### REAL HW — laptop (1440 × 900, final build, 2 runs, ABBA)

| Route | TTFB | FCP | LCP | CLS | TBT | INP~ |
|---|---|---|---|---|---|---|
| `/` | 21 | 386 | 386 (H1) | 0 | 1,283 | 40 |
| `/projects` | 18 | 156 | 156 | 0 | 0 | 40 |
| project-hub-application | 19 | 158 | 158 | 0 | 0 | 56 |
| breast-tumor-diagnosis-system | 19 | 154 | 154 | 0 | 0 | 32 |
| `/about` | 20 | 286 | 300 | 0 | 0 | 32 |
| experience / certificates / cv / contact | 16–18 | 132–154 | 132–154 | 0 | 0 | 32 |

### SIMULATED — mobile-sim (390 × 844 @3, touch, CPU 4×, 150 ms RTT / 1.6 Mbps)

| Metric | Range |
|---|---|
| LCP | 1,344–1,736 ms (home 1,662) |
| CLS | 0 |
| INP~ | **192–272 ms** |
| TBT | 430–651 ms (home 2,416) |

### Interleaved ABBA against the same code without the Phase 9 client-visible changes

A = no security headers and the old Tailwind scan, built into `.next/p9a` and since removed. The differences are within noise on every route:

| Profile | A: LCP / INP~ | B (final): LCP / INP~ | CLS |
|---|---|---|---|
| Laptop | 120–868 / 32–48 ms | 128–400 / 32–56 ms | 0 / 0 |
| Mobile-sim | 1,284–1,728 / 192–320 ms | 1,344–1,736 / 192–272 ms | 0 / 0 |

**Phase 9 introduced no performance regression.**

**Why today's numbers are worse than Phase 8's in both builds.** Phase 8 measured laptop home TBT 677 ms and mobile-sim INP~ ≤ 136 ms. At measurement time this machine ran:

- the Windows *Balanced* power plan;
- a CPU clock of **1,990 of 3,201 MHz**;
- Docker Desktop with 6 containers, plus Cursor and NordVPN.

The Phase 8 session's state is unknown. Lab numbers on this laptop are therefore not stable across sessions. **Today's SIMULATED mobile INP proxy (192–320 ms) exceeds the 200 ms budget for both builds.** It is a throttled simulation of a slowed CPU, not a device measurement, and the heaviest contributor on home is the R-59 cold long task. The REAL HW laptop INP proxy is ≤ 56 ms.

### Budgets

| Budget | Result |
|---|---|
| Critical JS (≤ 170 KB gzip) | `/` **164,430 B** under this phase's harness: script tags of the server HTML, noModule excluded, gzip default. It is byte-identical before/after the phase on every route: `/projects` 163,937, `/about` 162,660, `/skills` 157,049. Phase 8's harness reported 167,430 B for the same code: ~3 KB of methodology difference, not a change. |
| Scene chunk (≤ 400 KB gzip) | 943,103 B raw (Phase 8: 943 KB) = 250,593 B gzip / 204,976 B br |
| Portrait (≤ 150 KB) | 71,666 B (texture); `next/image` 11.4 KB AVIF / 15.9 KB WebP |
| High ≥ 60 fps / Medium ≥ 45 fps | NOT MEASURED in Phase 9. No scene code changed; Phase 8 measured ~164 fps on this laptop. Medium is not measured on a real medium-class device. |
| Idle / offscreen rendering | **0 draw calls** (§14) |

**NOT MEASURED:**
- **Physical Android/iPhone, desktop PC, lower-power laptop:** hardware unavailable.
- **Lighthouse:** no Lighthouse dependency may be added.
- **Field CWV (CrUX/RUM):** not deployed.
- **Real TTFB over the internet:** local only.

## 14. 3D Verification

Final production build, headed Chrome, REAL HW GPU. Draw calls are counted by wrapping WebGL `draw*`.

| Case | Tier | Canvas | Scene chunk | Draw calls at rest (3 s) | Errors |
|---|---|---|---|---|---|
| Default desktop | high | 1 | 943,103 B | 0 | 0 |
| Reduced motion | **static** | 0 | **not downloaded** | 0 | 0 |
| Save-Data | **static** | 0 | **not downloaded** | 0 | 0 |
| deviceMemory 2 GB | **static** | 0 | **not downloaded** | 0 | 0 |
| No WebGL2 | **static** | 0 | **not downloaded** | 0 | 0 |
| 4 cores / 4 GB | medium | 1 | downloaded | 0 | 0 |
| Phone (390, touch) | low | 1 | downloaded | 0 | 0 |

**Lifecycle (high tier):**

| Check | Result |
|---|---|
| Scroll | 1,212 draw calls while scrolling; **0 in the 3 s after settling**; progress settles on the target |
| Offscreen | **0** draw calls |
| Client navigation (3 cycles home ↔ `/projects`) | never a canvas on `/projects`, exactly one on home; resources 27/7 after the first cycle (page restored mid-scroll), then **21/6** stable. No leak. |
| `webglcontextlost` | canvas removed, static portrait shown |

The tier policy was not changed.

## 15. Accessibility

| Check | Result |
|---|---|
| axe-core, WCAG 2.0/2.1/2.2 A + AA | 11 routes (incl. two project pages and the 404) × 3 modes (1440 dark, 1440 light, 390 mobile): **0 violations**, on the local production build and again through TLS on the container |
| Horizontal overflow | 0 at 1440 and 390 |
| Reflow (WCAG 1.4.10) | 0 overflow at **320 px** and at **640 px** (1280 px at 200 % zoom), all 11 routes |
| Keyboard | first 12 tab stops on every route show a visible focus indicator |
| Reduced motion | static tier, no canvas, portrait shown (§14; E2E) |
| RTL | Arabic is gated in production. RTL layout is covered by the E2E suite (Arabic fixtures) and the `/ar` cinematic frame in the preview build (§16). |
| Semantic structure | one H1 per page, alt text, crawlable navigation (SEO audit) |
| Screen readers | **NOT TESTED** with assistive technology. Only semantic/axe inspection. |

**Finding R-67 (LOW, pre-existing).** The localized 404 page has no server-rendered content: its body is filled from the RSC payload after hydration. Without JavaScript a visitor sees a blank 404 page. This also caused an e2e race (R-66, §19).

## 16. Visual Regression

**Method.** Phase 8's harness (`p6/regress.mjs`, same capture method as the Phase 3 approval): 19 frames × runs A/B on a preview build (needed for the `/ar` frame), compared with the approved Phase 3 frames and with Phase 8's final run.

- **Every frame is within run-to-run noise of Phase 8's final run** (max |Δ| = 0.07).
- **Act frames** (P3 ↔ run A):

  | Frame | Mean abs. difference |
  |---|---|
  | 01 | 0 |
  | 02 | 0.04 |
  | 03 | 0.05 |
  | 04 | 0.06 |
  | 05 | 0.43 (0.01 % of pixels > 40) |
  | 06 | 0.05 |
  | 07 | 0.05 |
  | 09–13 | ≤ 0.03 |
  | 16 | 0.05 |
  | 18 (`/ar`) | 0.01 |
  | 19 | 0.01 |

- **Transitions 08/14/17 and the light-theme header frame 15** (1.04 / 1.95 / 0.87 / 0.36) are **bit-identical to Phase 8's frames** (Δ 0.00). They are the known content/header differences disclosed in Phase 8.
- A↔B ≤ 0.12; no console errors.
- The CSS change removed only unused selectors; no scene code changed. **No visual change in Phase 9.**

## 17. Image / Portrait Verification

| Check | Result |
|---|---|
| Source file | `portrait.jpg` SHA-256 `1c00fa075b97e2ef8a3460b3d62155052533729994041bd7f562ed5177323fca`, 71,666 B, mtime 2026-09-14: **unchanged**, not upscaled, no replacement requested |
| Home scene texture | the build-hashed copy of the original, 71,666 B (≤ 150 KB) |
| HTML portrait (home static composition, `/about`) | `next/image`, `sizes="(min-width: 48rem) 22rem, 80vw"`, `width=538 height=661`, alt "Portrait of Yazan Al Samman" |
| Derivatives | Every srcset width (640…3840) returns **538 × 661** (never enlarged): AVIF 11,411 B, WebP 15,890 B, JPEG 23,685 B |
| Loading | `loading="lazy"`. On `/about` the portrait is the LCP element: 300 ms laptop, ~1.5 s mobile-sim, within budget. `priority` would be a small improvement; not changed (not a blocker). |
| Docker | `portrait.jpg` now enters the build context (R-64); the image does not contain the original outside the hashed asset |

## 18. Route Matrix

Final production build (`SITE_ENV=production`), built right after E2E run 4; identical through nginx TLS on the Linux container.

| Route | EN | AR (`/ar…`) | Expected | Actual | Status |
|---|---|---|---|---|---|
| `/` | 200 | 404 | EN 200, AR gated | as expected | ✅ |
| `/about` | 200 | 404 | same | as expected | ✅ |
| `/projects` | 200 | 404 | same | as expected | ✅ |
| `/projects/ai-intelligence-project-management-system` | 200 | 404 | same | as expected | ✅ |
| `/projects/breast-tumor-diagnosis-system` | 200 | 404 | same | as expected | ✅ |
| `/projects/robot-obstacles-avoidance-system` | 200 | 404 | same | as expected | ✅ |
| `/projects/project-hub-application` | 200 | 404 | same | as expected | ✅ |
| `/projects/car-renting-application` | 200 | 404 | same | as expected | ✅ |
| `/projects/student-management-distributed-system` | 200 | 404 | same | as expected | ✅ |
| `/projects/services-provider-application` | 200 | 404 | same | as expected | ✅ |
| `/projects/taxi-elite-application` | 200 | 404 | same | as expected | ✅ |
| `/projects/fitness-mobile-application` | 200 | 404 | same | as expected | ✅ |
| `/projects/smarthome-mobile-application` | 200 | 404 | same | as expected | ✅ |
| `/projects/system-management` | 200 | 404 | same | as expected | ✅ |
| `/projects/basic-online-e-commerce-platform` | 200 | 404 | same | as expected | ✅ |
| `/projects/basic-university-management-system` | 200 | 404 | same | as expected | ✅ |
| `/projects/basic-python-compiler` | 200 | 404 | same | as expected | ✅ |
| `/experience` | 200 | 404 | same | as expected | ✅ |
| `/skills` | 200 | 404 | same | as expected | ✅ |
| `/certificates` | 200 | 404 | same | as expected | ✅ |
| `/cv` | 200 | 404 | same | as expected | ✅ |
| `/contact` | 200 | 404 | same | as expected | ✅ |
| 404: `/does-not-exist`, `/projects/does-not-exist`, `/ar/does-not-exist` | 404 | 404 | 404, noindex | as expected | ✅ |
| `/en`, `/en/about` | 308 → `/`, `/about` | — | permanent redirect | as expected | ✅ |
| `/about/` | 308 → `/about` | — | no trailing slash | as expected | ✅ |
| `/design-system` | 404 | — | 404 in production | as expected | ✅ |
| `/robots.txt`, `/sitemap.xml` | 200 | — | 200 | as expected | ✅ |
| `/admin` | 200 (login) | — | reachable, noindex | as expected | ✅ |
| `/api/users` | 403 | — | protected | as expected | ✅ |

## 19. Test Results

| Command | Result |
|---|---|
| `pnpm install --frozen-lockfile` | ✅ inside both Docker builds (clean context) |
| `pnpm format:check` | ✅ all files formatted |
| `pnpm lint` | ✅ 0 problems |
| `pnpm typecheck` | ✅ 0 errors |
| `pnpm test` | ✅ **95/95** (87 + 4 cache-scope + 4 security-headers) |
| `pnpm test:cms` | ✅ **49/49** |
| `pnpm build` (production) | ✅ ×8 in this phase; every one verified with the route matrix |
| `pnpm test:e2e` | run 1 ✅ 164 passed; runs 2 and 3 ❌ 158 passed / **1 failed** / 5 did not run (the same test); run 4 (final) ✅ **164 passed, 33 skipped, 0 failed** |
| `pnpm cms:verify-legacy` | ✅ 0 errors, 0 unreachable, 0 published fixtures |
| `pnpm seo:audit` (production) | ✅ 22 pages, 0 errors |
| `tests/deployment/verify-deployment.mjs` (container, TLS) | ✅ **15/15** |
| Production build after E2E (R-60) | ✅ both orders + adversarial (§3) |

**The E2E failure in runs 2 and 3.** The failing test is `seo.cms.spec.ts` › "home ↔ home; unknown routes map to an existing page": no language-switcher links on `/projects/does-not-exist`. Phase 9 did not cause it:

- I reproduced it deterministically: the 404 is requested first with an empty database, then the spec runs on the reused server.
- **Root cause:** the localized 404's content is rendered only after hydration (R-67), and the test read the links immediately after navigation, a race that machine load decides.
- **Control:** a build without the new layout `revalidate` produced the same client-only 404 HTML.
- **Fix:** the helper now waits for the switcher before reading it. It passed 9/9 twice in the reproducing scenario, then the full run 4 passed.

## 20. Files Changed

**New:**

| Path | Purpose |
|---|---|
| `src/content/cache-scope.ts` | R-60 cache-key scope |
| `src/lib/security-headers.ts` | CSP and security headers |
| `src/app/(payload)/api/internal/health/route.ts` | health endpoint |
| `tests/unit/cache-scope.test.ts`, `tests/unit/security-headers.test.ts` | unit tests |
| `deploy/docker-compose.prod.yml`, `deploy/env.production.example` | production compose + env template |
| `deploy/deploy.sh`, `deploy/backup.sh`, `deploy/restore.sh` | deploy/rollback, backup, restore |
| `deploy/nginx/yazanalsamman.com.conf` | nginx site |
| `docs/deployment/RUNBOOK.md` | runbook |
| `docs/reports/PHASE_9_REPORT.md` | this report |

**Modified:**

| Path | Change |
|---|---|
| `next.config.ts` | `distDir` guard, security headers |
| `playwright.config.ts` | `NEXT_DIST_DIR=.next/e2e` |
| `tests/e2e/prepare-e2e.mjs` | e2e dist-dir guard |
| `tsconfig.json` | +2 include lines for `.next/e2e` |
| `src/content/repository.ts` | scoped keys, revalidation window |
| `src/app/[locale]/layout.tsx`, `src/app/sitemap.ts` | `revalidate = 1800` |
| `src/app/globals.css` | Tailwind `source('../')` |
| `src/payload.config.ts` | `admin.avatar: 'default'` |
| `.dockerignore` | env files at any depth, backups, photos; `portrait.jpg` no longer excluded |
| `tests/deployment/verify-deployment.mjs` | security-header check; media checks follow ADR-008 |
| `tests/deployment/seo-audit.mjs` | opt-in `IGNORE_HTTPS_ERRORS=1` for self-signed rehearsals |
| `tests/e2e/seo.cms.spec.ts` | wait for the switcher |
| `docs/architecture/ARCHITECTURE_DECISIONS.md` | Phase 9 amendments |
| `docs/architecture/RISK_REGISTER.md` | 13 rows updated; R-62…R-67 added |

**Temporarily changed and restored byte-exact:**
- `src/app/[locale]/projects/[slug]/page.tsx`: the generateStaticParams probe, and a `connection()` attempt that Next 16 refuses for routes with `generateStaticParams`;
- the control build of `layout.tsx`;
- the ABBA A-variant of `next.config.ts` and `globals.css`;
- `tsconfig.json` and `next-env.d.ts`: Next rewrote them for the temporary `.next/p9a` build; tsconfig was restored to the same blob hash `d14f21f`.

**Not touched:** `.env`, `portrait.jpg`, `photos/`, the database content (the dev database was only read and dumped), other repositories and containers.

**`photos/`** (untracked, 16 JPEGs, 2.9 MB, dated 2026-09-28 17:14): owner photos. Two samples show the owner presenting what looks like an AI/expert-system project to an audience. They are candidate owner assets but contain third parties (audience members). Nothing references them; they were left untouched, are now excluded from the Docker build context, and were not committed.

## 21. Risks Updated

| ID | Change |
|---|---|
| R-60 | HIGH → **CLOSED** |
| R-61 | LOW → **CLOSED** |
| R-64 (new) | Docker build broken since Phase 3 → **CLOSED** |
| R-66 (new) | e2e race → **CLOSED** |
| R-45 | HIGH → **MITIGATED**: bounded staleness ≤ ~1 h |
| R-27 | **MITIGATED**: CSP shipped; `'unsafe-inline'` residual accepted |
| R-33 | **MITIGATED**: deploy order enforced, pages always rebuilt |
| R-19 / R-52 | **MITIGATED**: backup/restore scripts, restore rehearsed; off-host copy pending (owner) |
| R-35, R-39 | **ACCEPTED** with rationale |
| R-65 (new) | esbuild advisory → **ACCEPTED** |
| R-10 | OPEN: rate limits verified; `/admin` allow-list or accept (owner) |
| R-23 | OPEN: runbook ready; VPS not provisioned (owner) |
| R-59 | OPEN: evaluated; prebaked environment is the ready option (owner) |
| R-28 | OPEN — monitoring |
| R-62 (new, LOW) | project pages not prerendered at build (warm-up in runbook) |
| R-63 (new, MEDIUM) | cached 404 disk growth (nginx limit; follow-up cache handler) |
| R-67 (new, LOW) | client-only 404 content |
| R-06, R-43 | unchanged: real devices NOT MEASURED |

## 22. Deferred Work

- Physical-device measurements: Android, iPhone, desktop PC, low-power laptop (R-43, R-06).
- Lighthouse and field CWV after deployment.
- R-59 decision (prebaked environment or accept), and a smaller lossless encoding if chosen.
- R-63 durable fix: a cache handler that does not persist 404 entries.
- R-67: a server-rendered localized 404.
- R-62: investigate build-time emission of project pages on a Next upgrade.
- Optional: `priority` on the `/about` portrait; AVIF for CMS derivatives (Phase 8 deferral).
- R-31 / R-54 remain blocked by the Arabic gate.

## 23. Owner Actions Required

1. **Authorize deployment** and provide the VPS: provider, OS, SSH access. Apply the host hardening in RUNBOOK §3 (firewall 22/80/443, key-only SSH, unattended upgrades).
2. **DNS:** `yazanalsamman.com` and `www` → the VPS. **TLS:** certbot (RUNBOOK §3).
3. **Production secrets:** create `deploy/.env.production` from the template (hex secrets, mode 600).
4. **Off-host backups:** choose a target (object storage / provider snapshots) and schedule `sh deploy/backup.sh` (R-19). Without it, production runs with same-disk backups only.
5. **Admin exposure (R-10):** enable the nginx IP allow-list for `/admin`, or accept password + lockout + rate limit. After the first deployment, **change the admin password** (the dump carries the local one).
6. **R-59:** decide between the prebaked environment (+750 KB per first 3D visit, removes the ~0.8 s cold long task, pixel-identical) and keeping the current behaviour.
7. **Commit:** when committing, keep `deploy/*.sh` executable (`git add --chmod=+x deploy/*.sh`) or run them with `sh` as the runbook does. Keep `photos/` out of the repository unless intended.
8. **Existing items:** Arabic reviewer (R-29/R-44), third-party client names (R-14), history rewrite before any public repository visibility (R-24).

## 24. Production Readiness Decision

**Against the §34 checklist, on local evidence:**

| Criterion | Result |
|---|---|
| R-60 fixed and verified | ✅ |
| Deterministic production build | ✅ |
| All public routes correct | ✅ |
| CMS content safe | ✅ |
| No fixtures | ✅ |
| SEO audit passes | ✅ |
| Accessibility passes (automated) | ✅ |
| Security review passes | ✅ (residual risks listed and accepted, except the R-10 owner decision) |
| Critical JS within budget | ✅ |
| No admin code in public bundles | ✅ |
| Cinematic regression passes | ✅ |
| Deployment architecture documented | ✅, and rehearsed |

No critical code-side blocker remains. The two real blockers found in this phase (the unbuildable image and stale-page redeploys) are fixed and re-verified.

**Why the verdict is not "ready":**

1. The site cannot reach production without owner-only actions (§23 items 1–4): the VPS, DNS/TLS, secrets and deploy authorization. Production would also start without off-host backups.
2. The admin-exposure decision (R-10) is open.
3. Performance on real phones, desktops and slower laptops is still **NOT MEASURED**. Today's SIMULATED mobile INP proxy exceeds its budget in this machine state, in both builds.

## BLOCKED — OWNER ACTION REQUIRED

The application and its deployment artifacts are prepared and verified for a first production deployment. The next step belongs to the owner: §23 items 1–5, then an authorized deployment. After that deployment, run the post-deploy checks and the first Lighthouse/field measurements.

---

**Git state at the end of the phase** (no commit, push, reset, rebase, stash or history change):

```text
$ git log -1 --oneline
af32158 feat: add the bilingual Next.js portfolio shell

$ git status --short   (114 entries: the 108 at the start, plus)
?? deploy/
?? docs/deployment/
?? docs/reports/PHASE_9_REPORT.md
?? src/lib/security-headers.ts
?? tests/unit/cache-scope.test.ts
?? tests/unit/security-headers.test.ts
```

The other Phase 9 files are inside paths that were already modified or untracked at the start of the phase: `src/content/`, `src/app/(payload)/`, `tests/e2e/`, `tests/deployment/`.
