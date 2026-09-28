# Phase 2 Report

## 1. Phase

**Phase 2 — CMS Architecture & Payload CMS 3 Trial**
**Date:** 2026-09-27
**Status:** COMPLETE
**Payload decision:** **PASS**
**Verdict:** **READY FOR PHASE 3**

## 2. Objective

Answer one architectural question with evidence: *is Payload CMS 3 genuinely suitable as the production CMS foundation for Yazan Al Samman's bilingual, SEO-first, VPS-hosted portfolio, without compromising the Phase 0–1 architecture?*

The authoritative framework is ADR-003 criteria **T1–T14**, with this decision rule: any FAIL on T1, T6, T7, T8 or T12, or three or more FAIL/PARTIAL overall, means the custom-dashboard fallback.

## 3. Starting State

- Repository `C:/Users/Lenovo/Downloads/yazan-alsamman-portfolio-project-spec/yazan-alsamman-portfolio-spec`, branch `main`, remote `origin` → `github.com/yazan-alsamman/yazan-s-portfolio.git` (private). Last commit: `af32158` (owner).
- The Pre-Phase 2 reconciliation diff was still uncommitted; Phase 2 builds on top of it.
- There was no CMS, no database and no Docker setup.
- Phase 1 public bundle baseline, re-measured before integration: `/` **158,721 B JS (9 files), 8,997 B CSS**.
- Owner decision D-5 arrived with this phase: `portrait.jpg` (538 × 661) is the authoritative portrait. It is recorded in OWNER_PROFILE, ADR-008 and R-04.

## 4. Environment

| Item | Value |
|---|---|
| Host | Windows 11, 13.9 GB RAM, Node 24.11.1, pnpm 11.10.0 |
| Docker | Docker Desktop, Engine **29.6.1**, Compose **v5.3.0**, BuildKit v0.31.1; VM 7.2 GB, 16 CPUs |
| PostgreSQL | **17.10** (`postgres:17-alpine`, already cached locally) |
| Container | `yazan-portfolio-postgres` (Compose project `yazan-portfolio`, `docker-compose.yml`) |
| Databases | `yazan_portfolio` (development; owner-confirmed identity only) · `yazan_portfolio_test` (integration tests; wiped and re-migrated every run) |
| Port | `127.0.0.1:5439 → 5432` (loopback only; 5432/5433 were already in use and left alone) |
| Persistence | named volume `yazan-portfolio_pgdata` |
| Isolation | Own Compose project, container, volume and port. The unrelated containers (Tavla: backend, postgres, redis, minio, nginx; trading-ai: stopped) were **not stopped, modified or connected to** at any point |
| Credentials | Randomly generated into git-ignored `.env` and never printed. `.env.example` holds placeholders only |

## 5. Payload Version

| Package | Version | Note |
|---|---|---|
| `payload` | **3.90.2** | exact pin; engines node `^18.20.2 \|\| >=20.9.0` ✔ |
| `@payloadcms/next` | 3.90.2 | peer `next >=16.3.3 <17` ✔ (project: Next **16.3.6**, no downgrade) |
| `@payloadcms/db-postgres` | 3.90.2 | Drizzle 0.45.2, drizzle-kit 0.31.7, `pg` 8.20.0 |
| `@payloadcms/richtext-lexical` / `@payloadcms/ui` | 3.90.2 | |
| `graphql` | **16.14.2** | pinned: Payload peer `^16.8.1` (npm latest 17.x is incompatible). GraphQL API disabled |
| `sharp` | 0.35.4 | same version Next already uses |

Source: npm registry. Required project changes: `"type": "module"` in `package.json` (the Payload CLI can't load the ESM Lexical editor otherwise) and a `@payload-config` path alias. `esbuild` install scripts are denied in `pnpm-workspace.yaml`; all three versions were verified to work without them.

## 6. ADR-003 T1–T14

| # | Criterion | Requirement | Implementation / Test | Result | Evidence | Architectural impact |
|---|---|---|---|---|---|---|
| T1 | Bilingual content | Localized EN/AR; `fallback:false`; Arabic RTL editing | `localization` en/ar (`rtl:true`), `fallback:false`; per-locale `translationStatus`; repository shows a locale only when `approved` | **PASS** | Integration: EN/AR stored independently, AR empty ≠ EN; AR "in review" hidden, "approved" shown. Admin screenshot: AR fields `direction: rtl`, labelled "— العربية" | None. Site-level copy-review gate unchanged (`/ar` 404 in prod) |
| T2 | Projects | Full DASHBOARD_SPEC field set | Title/slug/summary; case-study rich text (description, problem, solution, architecture, results); role, category, timeline, technologies, experience, links, cover, gallery, video, SEO, featured, sortOrder | **PASS** | Integration: full-field project round-trips through repository; incomplete drafts allowed, incomplete publish rejected | None |
| T3 | Certificates | Fields + image/PDF, issuer, verification URL | `attachment` polymorphic upload (`media` \| `documents`); URL validator | **PASS** | Integration: PDF attachment accepted; `javascript:` URL rejected with field message | None |
| T4 | Media | MIME/magic-byte/size validation, derivatives, alt EN/AR, usage tracking | Payload MIME allowlist + our magic-byte/size/filename hook; `withoutEnlargement` sizes; alt required unless decorative; `join` usage fields | **PASS** | Integration: spoofed text-as-PNG, SVG, >15 MB rejected; filename regenerated (`../../evil name.png` kept only as metadata); no upscaling; usage join lists the project. Payload also validates PDF structure | Our hook is part of the approved design (Payload's check alone trusts the declared type less strictly) |
| T5 | CV | Per-locale PDF, version, visibility, updated date | `cv` global: localized upload, `downloadVisible` (localized), `version`, auto `updatedAt` | **PASS** | Integration: hidden until visible + approved; no Arabic CV ⇒ `null` (no fallback) | None |
| T6 | Publishing | DRAFT→PUBLISHED→ARCHIVED; no draft leakage; revalidation | Payload drafts/versions + `archived`/`archivedAt` + delete-only-when-archived + audit log; tag revalidation (`expire: 0`) | **PASS** | Integration (6 tests) + e2e over REST + T14 in container: draft invisible (0) → publish (1) → archive (0) → restore; unpublished edit never leaks; versions + audit rows; CMS publish updates the static homepage without rebuild | None |
| T7 | Authentication | Login, logout, lockout, secure cookies, no public sign-up, env-seeded admin | Payload auth: 5 attempts / 15 min lock, 2 h tokens, server sessions, `SameSite=Lax`, `Secure` in production; seed from env | **PASS (with mandatory guard)** | **Found:** anonymous `first-register` created an **admin** on an empty DB. **Fixed** with a `beforeOperation` guard; verified 403 on host, in e2e, and in the Linux container against an **empty** DB (0 users created). Lockout after 5 failures; logout revokes the session; cookie `Secure; HttpOnly; SameSite=Lax` in production | Guard is mandatory and must be re-verified on each Payload upgrade (R-32) |
| T8 | Authorization | Collection/field access; public = published only | `publishedOrAdmin`, `notArchivedOrAdmin`, admin-only writes, admin-only `sourceNote`, private users/audit-log | **PASS** | Integration: anonymous cannot read users/audit-log/versions or write; `sourceNote` hidden from public, visible to admin. e2e/T14: `/api/users` 403; anonymous `?draft=true` returns only published | None |
| T9 | SEO metadata | Localized title/description, slug + redirect-on-change, validation | `seo` group (10–70 / 50–170 chars, localized); slug regex + unique; 308 redirect on published slug change with chain flattening | **PASS** | Integration: bad slug, duplicate slug, short SEO title rejected with specific messages; redirects `/projects/a→c`, `/projects/b→c` | App still owns URL policy; editors cannot create arbitrary routes |
| T10 | Relationships | Project ↔ skills ↔ media ↔ experience; no orphans on archive | relationship + `join` fields; adapter drops unpublished/archived/unapproved relations | **PASS** | Integration: archived and draft skills dropped from public project; experience→projects and skill→evidence joins resolve | None |
| T11 | Validation | Required per status; Zod at boundaries; useful admin errors | Payload field validators (field-level messages) + Zod domain schemas in the adapter | **PASS** | Integration: messages "Use lowercase letters…", "SEO title must be 10–70…", "Numeric proficiency scores are not allowed", "Alt text is required…"; a published project missing localized SEO is valid in the CMS but never rendered | None |
| T12 | PostgreSQL | db-postgres, committed migrations, clean migrate on empty DB | `push:false`; committed migration `20260927_181450_initial`; `prodMigrations` | **PASS** | Dev: 0 → 64 tables (700 ms). Test DB rebuilt every run. **Linux container on an empty DB: 0 → 64 tables at startup (513–515 ms)** | None |
| T13 | Maintainability | Types pass `tsc`; admin bundle isolated; pinning workable | Generated `payload-types.ts`; exact pins; bundle audit | **PASS** | `tsc --noEmit` clean. Public `/`: 158,721 → **159,595 B** (+874 B, +0.55%), same 9 chunks, **0 chunks with Payload/Lexical/drizzle/admin code**; admin `/admin/login` 856,411 B loads only there | Heavy dependency tree and fast release cadence (R-36) |
| T14 | VPS deployment | Standalone Docker image, reverse proxy, persistent media, Postgres | Multi-stage `Dockerfile`; nginx TLS proxy; private Docker network; media volume | **PASS** | **Linux container, production mode, behind nginx HTTPS: 14/14 checks, twice on the final image** (§ T14 evidence). Startup migrations on an empty DB proven. Two build defects found and fixed during the trial (stale cache with secrets, `.env` copied into the image) | Build needs DB access (R-33); secret handling rules in ADR-012 amendments (R-38, R-40) |

**Result: 14 PASS, 0 PARTIAL, 0 FAIL, 0 BLOCKED.** The decision rule is not triggered.

## 7. CMS Architecture (as implemented)

```text
Payload CMS 3 (embedded; /admin UI, /api REST; GraphQL off)        src/payload.config.ts, src/cms/*
        │  Local API (in-process), anonymous context
        ▼
CMS adapter — the only module that knows Payload shapes            src/content/payload-adapter.ts
  publication filter: published ∧ ¬archived ∧ locale approved ∧ Zod-valid; no fallback; drops orphan relations
        ▼
Application content contract (Zod-validated domain types)          src/content/types.ts
        ▼
Repository — server-only, unstable_cache + CMS tags               src/content/repository.ts
        ▼
Server pages / metadata / sitemap / JSON-LD                        src/app/[locale]/*, src/lib/seo/*
        ▼
Presentation components (no Payload knowledge)                     src/components/*
```

- Phase 1 seams replaced: `src/config/profile.ts` and `src/config/home.ts` are **deleted**. Identity and homepage section availability now come from the CMS through the repository. The seed input lives in `src/cms/seed-data.ts` (owner-confirmed values only).
- Admin isolation: route group `src/app/(payload)` with its own `<html>` and Payload's precompiled CSS. Public Tailwind CSS is imported only by public layouts. The proxy excludes `/admin` and `/api`.

## 8. Content Model

| Collection / Global | Purpose (CONTENT_MODEL / DASHBOARD_SPEC) | Key relations |
|---|---|---|
| `projects` | case studies | → `skills` (technologies), → `experience`, → `media` (cover, gallery) |
| `experience` | roles | → `skills`; join ← `projects` |
| `education` | degrees | → `documents` |
| `certificates` | credentials | → `media` \| `documents` (attachment) |
| `skills` | technologies (no numeric proficiency) | join ← `projects` (evidence) |
| `media` | images | join ← `projects` (usage) |
| `documents` | PDFs (CV, certificates, education) | — |
| `redirects` | slug-change redirects | — |
| `users` | admin accounts | — |
| `audit-log` | append-only change log | — |
| global `profile` | canonical identity (ADR-017) | → `media` (portrait) |
| global `site-settings` | SEO defaults, featured projects | → `projects` |
| global `cv` | per-locale CV | → `documents` |

Every editorial item has `translationStatus` (per locale), `archived`/`archivedAt` and an admin-only `sourceNote` (provenance, R-02). **No public entities were invented** and **no portfolio content was created.** The development database holds only the owner-confirmed identity. Test data exists only as labelled fixtures in the test database or is deleted after each e2e and deployment run (verified: 0 projects, 0 media left).

## 9. Localization

- EN and AR are stored independently. `fallback: false` holds at the CMS, the adapter and the rendering layer.
- A locale's content appears publicly only when its `translationStatus` is `approved` in that locale. Arabic can be drafted, in review, approved and published independently of English.
- Missing translations are detectable: an unapproved or incomplete locale yields `null` and the section doesn't render.
- The **site-level Arabic copy-review gate** (`src/config/copy-review.ts`) is untouched. In production `/ar` is still **404** (verified in the T14 container), and hreflang, sitemap and the language switcher exclude Arabic.
- next-intl routing stays authoritative (`/` EN, `/ar` AR). Payload creates no public routes.

## 10. Publishing Lifecycle

`DRAFT → PUBLISHED → ARCHIVED` (soft, reversible) `→ delete` (only when archived). Verified:
- draft creation and editing
- publish, and published updates
- an unpublished edit of a published item never leaks
- archive hides and restore brings it back (`archivedAt` stamped and cleared)
- delete is refused before archive (400)
- version history exists, with audit entries for create, publish, archive and delete
- locale-specific publication via `translationStatus`

**Draft leakage: none** across the Local API, REST (`?draft=true` as anonymous), the repository and the deployed container.

## 11. Data Access Layer

- **CMS model:** `src/payload-types.ts` (generated).
- **Repository model:** `Profile`, `ProjectSummary`, `Project`, `Skill`, `Cv`, `ContentImage` in `src/content/types.ts`, with Zod schemas.
- **Mapping:** `payload-adapter.ts` resolves locale, filters publication, drops orphans and validates. Invalid documents are skipped and logged, never rendered.
- **Caching:** `unstable_cache` with tags `cms:<collection>` + `cms`; hooks revalidate exactly those.
- **Publication filtering** happens in two independent layers: collection access (published and not archived for anonymous readers) plus the adapter (locale approval and Zod).

## 12. Authentication & Authorization

- Login, logout (server sessions revoked) and lockout (5 attempts, 15 min) verified. Tokens last 2 h. Cookies are `HttpOnly; SameSite=Lax`, plus `Secure` in production (verified in the container).
- **No public registration.** Payload's first-user flow bypassed `access.create`, and a guard now rejects every HTTP user creation that isn't from an authenticated admin. The first admin comes only from `pnpm cms:seed` via `CMS_ADMIN_EMAIL`/`CMS_ADMIN_PASSWORD` (≥ 14 characters). There are no default or demo credentials; local dev credentials exist only in the git-ignored `.env`.
- **CSRF:** Payload honours the auth cookie only from `SITE_URL`. A foreign `Origin` gets 403 (e2e and container).
- **Authorization:** admin-only writes; private users, audit log and versions; admin-only `sourceNote`.
- **Production configuration:** the admin is `noindex` via header and meta, `/admin` redirects to login, and the robots file disallows `/admin` and `/api`.

## 13. Media Architecture

- Local filesystem under `MEDIA_DIR` (`images/`, `documents/`), which is a **persistent volume** on the VPS. Upload persistence across a container restart was verified.
- The S3-compatible storage-adapter seam is unchanged (no schema change needed).
- Media URLs are `/api/media/file/<regenerated-name>`; the original filename is kept only as metadata.
- Validation: MIME allowlist, magic bytes, size (images 15 MB, PDFs 20 MB, global 20 MB), PDF structure (Payload), SVG rejected, regenerated names (path traversal neutralised).
- Derivatives `thumbnail/card/large` are WebP with **no enlargement**, which is what the D-5 portrait needs. **`portrait.jpg` was not uploaded or modified** (SHA-256 unchanged).
- Alt text is localized and required unless the image is decorative.
- Backups: `media` volume plus `pg_dump` (ADR-004, Phase 9). Cache headers for media are left to the Phase 9 proxy config.

## 14. Revalidation

```text
CMS change → publish (hook) → revalidateTag(cms:<source>, { expire: 0 }) → next request re-renders → updated static page
```

- **In-process:** verified by e2e on the host and in the Linux container (probe title visible after publish, then restored). Pages stay statically generated; no route was made dynamic.
- **Out-of-process:** `POST /api/internal/revalidate`, signed with HMAC-SHA256 over `timestamp.body`, a ±300 s replay window, constant-time comparison, and an allow-list of sources. Unit tests plus e2e: unsigned 401, forged 401, valid 200.
- **Failure behaviour:** outside a Next runtime (scripts, tests), revalidation is reported as skipped and never fails the write. The route returns 500 if revalidation throws.
- **Retries** are caller-side (idempotent).
- **Local development and the VPS** use the same mechanism, because Payload runs in the same process.

## 15. SEO Audit

- **Indexability: PASS.** Production homepage `index, follow`; non-production `noindex`. `/admin`, `/api/*` and `/design-system` are noindex and disallowed in robots.
- **Metadata: PASS.** Title and description are built from the CMS profile (identical output to Phase 1).
- **Canonicals: PASS.** Absolute, from `SITE_URL` (container: `https://localhost:8443`; production `https://yazanalsamman.com`).
- **Internal Linking: PASS** (unchanged; header nav renders no empty landmark in production).
- **Structured Data: PASS.** Person and WebSite from confirmed CMS fields only; `jobTitle` localized (EN "Artificial Intelligence Engineer" / AR "مهندس ذكاء صنعي"); **no** `alternateName`, `sameAs`, employer, education, location or image.
- **International SEO: PASS.** hreflang `en` + `x-default` only while Arabic is unpublishable; `/ar` 404 in production.
- **Performance: PASS (lab).** See §17.
- **Accessibility: PASS (automated scope).** See §16.
- **SEO Issues:** none introduced. The CMS owns content; the application owns URL, rendering and SEO policy, and editors cannot create public routes.
- **SEO Risks:** R-33 (build needs the DB, so a failed DB means a failed deploy, not a broken site).
- **Required Follow-up:** Phase 4 must add project routes via the repository, with slug redirects applied through `getRedirect`.

## 16. Accessibility

- **Public:** the full Phase 1 axe suite still passes (16 page states, 0 violations), plus production homepage axe in dark, light and 390 px (0 violations).
- **Admin:** `/admin/login` passes axe WCAG 2 A/AA with 0 violations. The admin edit screens were checked visually only, for RTL.
- Keyboard, focus, RTL, reduced motion and heading hierarchy all pass the unchanged e2e checks.

## 17. Performance (vs Phase 1)

| Measurement (localhost production build, unthrottled lab) | Phase 1 / pre-Payload | Phase 2 final |
|---|---|---|
| `/` JS transferred | 158,721 B (9 files) | **159,595 B (9 files)**, +874 B (+0.55%) |
| `/` CSS | 8,997 B | 8,630 B |
| `/ar` JS | 158,721 B | 159,595 B |
| Fonts `/` · `/ar` | 114,292 · 205,876 B | unchanged |
| LCP element / CLS | H1 text / 0 | H1 text / 0 (AR 0.0002) |
| Admin (`/admin/login`) | — | 856,411 B JS (15 files), 97,534 B CSS (admin only) |
| App container RAM (idle, after checks) | — | ~82 MiB |

The Phase 1 budget (≤ 170 KB gzip critical-path JS) still holds. **No Core Web Vitals or Lighthouse claims:** none were measured.

## 18. Security

| Area | Result |
|---|---|
| Env vars | Validated (`src/lib/env.ts`, `src/cms/env.ts`); secrets ≥ 32 characters; placeholders only in `.env.example` |
| Auth / sessions / cookies / CSRF | See §12. **Critical finding fixed:** anonymous first-admin registration (R-32) |
| Admin routes / public APIs | Admin protected + noindex; REST access-controlled; GraphQL disabled; users and audit log private |
| Uploads | Magic bytes, size, SVG block, regenerated names, PDF validation |
| Draft leakage | None (Local API, REST, repository, container) |
| Debug endpoints / error leakage | None added; Payload errors return generic messages. Access denials are logged at ERROR level (R-39) |
| Revalidation endpoint | HMAC, replay window, allow-list |
| **Docker image** | **Finding fixed (R-40):** mounting the build secret as `/app/.env` made Next's standalone output copy it into the image. The secret is now mounted at `/run/secrets/buildenv`, the build fails if an `.env` reaches the standalone output, and the final image scan found **0 files containing a secret value** and 0 history lines exposing secrets. **Finding fixed (R-38):** BuildKit ignores secret contents in the cache key, so a `BUILD_ENV_ID` hash was added |
| Repository secret scan | **Clean.** Placeholders only in `.env.example`; 0 real local secret values in any tracked or untracked file |
| Email | No adapter: reset emails go to the console (R-35, before production) |

## 19. Tests

All commands were run in this phase. Final results:

| Command | Result |
|---|---|
| `pnpm install --frozen-lockfile` | exit 0 (offline, lockfile up to date) |
| `pnpm format:check` | "All matched files use Prettier code style!" |
| `pnpm lint` | exit 0, 0 problems (generated migrations/types/import map excluded) |
| `pnpm typecheck` | exit 0 (includes generated Payload types and tests) |
| `pnpm test` | **4 files, 29 tests passed** (unit; includes the new revalidation-signature tests) |
| `pnpm test:cms` | **1 file, 29 tests passed**: real PostgreSQL 17 test DB, rebuilt from the committed migrations each run (T1–T12) |
| `pnpm build` | exit 0; public pages still SSG (●); `/admin`, `/api` dynamic |
| `pnpm test:e2e` | **75 passed, 0 failed, 32 skipped by design**, **3 consecutive runs** (66 shell + 9 CMS) |
| Docker build (`docker build --secret … --build-arg BUILD_ENV_ID=…`) | exit 0; final production image `yazan-portfolio:t14-prod` (330 MB) |
| `node tests/deployment/verify-deployment.mjs` (Linux container via nginx HTTPS) | **14/14**, run twice on the final image (and twice on the earlier image) |

Test incidents (honest record):
- One e2e failure during Phase 2 was a **test-isolation bug**: the CMS suite mutated the profile while the parallel shell suite read it. It was fixed with a dependent Playwright project (`cms` runs after `desktop` and `mobile`). R-28 has not recurred since.
- The first CMS integration run had 6 failures: 4 assertions against the wrong error field (the specific messages are in `error.data.errors`) and 2 from an invalid PDF fixture. The tests were fixed; the application wasn't changed.

## T14 — Docker / Linux / Nginx deployment evidence

**Topology (isolated; Tavla untouched):**

```text
client → 127.0.0.1:8088 (HTTP → 301) / 127.0.0.1:8443 (TLS)  nginx:1.27-alpine  [yazan-portfolio-t14-nginx]
      → http://yazan-portfolio-t14-app:3000   (NO host port)   node server.js, NODE_ENV=production, user node, Linux x86_64
      → yazan-portfolio-postgres:5432 on private network yazan-portfolio-t14
      media → named volume yazan-portfolio-t14-media:/app/media
```

**Key commands:**

```text
docker build --secret id=buildenv,src=<build env> --build-arg BUILD_ENV_ID=<sha256 prefix> -t yazan-portfolio:t14-prod .
docker network create yazan-portfolio-t14 ; docker network connect yazan-portfolio-t14 yazan-portfolio-postgres
docker run -d --name yazan-portfolio-t14-app --network yazan-portfolio-t14 --env-file <runtime env> \
  -v yazan-portfolio-t14-media:/app/media --memory 1g yazan-portfolio:t14-prod
docker run -d --name yazan-portfolio-t14-nginx --network yazan-portfolio-t14 -p 127.0.0.1:8088:80 -p 127.0.0.1:8443:443 \
  -v <nginx.conf>:/etc/nginx/conf.d/default.conf:ro -v <certs>:/etc/nginx/certs:ro nginx:1.27-alpine
BASE_URL=https://localhost:8443 HTTP_URL=http://localhost:8088 APP_CONTAINER=yazan-portfolio-t14-app node tests/deployment/verify-deployment.mjs
```

The image runs with `SITE_ENV=production` and `SITE_URL=https://localhost:8443`, using a self-signed certificate for local TLS. All runtime configuration comes from `--env-file`; the image contains no `.env`.

**Results on the final image (`sha256:4d192726adce…`):**

| Check | Result |
|---|---|
| Linux + intended production command | PASS: `Linux x86_64`, `["node","server.js"]`, `user=node`, `NODE_ENV=production`, node v24.21.0 |
| Nginx HTTP → HTTPS | PASS: 301 → `https://localhost:8443/` |
| Public homepage via HTTPS proxy, CMS-backed H1 | PASS: 200, H1 "Yazan Al Samman — Artificial Intelligence Engineer", `index, follow`, canonical `https://localhost:8443` |
| Status codes | PASS: `/ar` 404 (copy-review gate), `/en` 308, unknown 404, robots 200, sitemap 200, `/design-system` 404 |
| Admin reachable and protected | PASS: `/admin` → `/admin/login`, `X-Robots-Tag: noindex, nofollow` |
| First-user signup fix | PASS: first-register 403, create 403, list 403 |
| Authentication | PASS: login cookie `Secure; HttpOnly; SameSite=Lax` |
| Draft isolation + publishing | PASS: anonymous sees draft 0 → after publish 1 |
| CSRF | PASS: foreign origin 403 |
| Revalidation | PASS: probe title visible after publish without rebuild or restart; original restored |
| Media via proxy | PASS: upload 201, file 200 `image/png` |
| Media persistence | PASS: 200 after `docker restart` (volume) |
| Lifecycle + cleanup | PASS: delete before archive 400; project delete 200; media delete 200 |
| Logout | PASS: session valid before, `null` after |
| **Fresh-VPS startup** (same image, empty DB) | PASS: `Migrating: 20260927_181450_initial` → 64 tables (515 ms); anonymous first-register on the **empty** DB → **403**, 0 users |
| Logs | Only expected entries: 4 × "not allowed" (the deliberate 403 probes), 1 × "Archive before delete" (deliberate 400), 1 × 502 during the deliberate restart, email-adapter warning. No unexpected errors |
| Resources | app ~82 MiB, nginx ~18 MiB |

After the run, the T14 containers, network and volume were removed. The development database was left clean (0 projects, 0 media, profile identity intact).

**Test-environment incident, not a T14 failure:** the first Docker build ran as a background job, and Claude Code's memory-pressure reaper stopped it while the host had about 2.7 GB of 13.9 GB free (Docker VM ~3.6 GB, with Tavla running). The image build itself had already completed. On retry, with the owner's approval and no other projects touched, the build reused the cached pnpm store ("Lockfile is up to date, resolution step is skipped") and finished in 202 s. No application fault was involved.

## 20. Files Created

```text
Dockerfile
.dockerignore
docker-compose.yml
src/payload.config.ts
src/payload-types.ts                                (generated)
src/migrations/20260927_181450_initial.ts|.json      (generated, committed migration)
src/migrations/index.ts                             (generated)
src/cms/access.ts
src/cms/fields.ts
src/cms/hooks.ts
src/cms/uploads.ts
src/cms/env.ts
src/cms/seed-data.ts
src/cms/globals.ts
src/cms/collections/Users.ts
src/cms/collections/AuditLog.ts
src/cms/collections/Media.ts
src/cms/collections/content.ts
src/cms/scripts/seed.ts
src/content/types.ts
src/content/payload-adapter.ts
src/content/repository.ts
src/content/cache-tags.ts
src/lib/i18n/publication.ts
src/lib/revalidate-signature.ts
src/app/(payload)/layout.tsx
src/app/(payload)/admin/[[...segments]]/page.tsx
src/app/(payload)/admin/[[...segments]]/not-found.tsx
src/app/(payload)/admin/importMap.js                (generated)
src/app/(payload)/admin/importMap.d.ts
src/app/(payload)/api/[...slug]/route.ts
src/app/(payload)/api/internal/revalidate/route.ts
vitest.cms.config.mts
tests/cms/setup-env.ts
tests/cms/harness.ts
tests/cms/trial.test.ts
tests/e2e/cms.spec.ts
tests/unit/revalidate.test.ts
tests/deployment/verify-deployment.mjs
docs/reports/PHASE_2_REPORT.md
```

## 21. Files Modified

```text
package.json, pnpm-lock.yaml, pnpm-workspace.yaml, tsconfig.json, next.config.ts, eslint.config.mjs,
.prettierignore, .env.example, playwright.config.ts
src/proxy.ts, src/app/layout.tsx, src/app/not-found.tsx, src/app/sitemap.ts,
src/app/[locale]/layout.tsx, src/app/[locale]/page.tsx,
src/components/shell/{SiteHeader,SiteFooter,Wordmark,HeaderNav}.tsx,
src/lib/i18n/publishability.ts, src/lib/seo/{metadata,structured-data}.ts
tests/unit/{i18n,seo}.test.ts, tests/e2e/shell.spec.ts
docs/architecture/{ARCHITECTURE_DECISIONS,RISK_REGISTER,INFORMATION_ARCHITECTURE}.md
docs/content/OWNER_PROFILE.md (D-5)
Deleted (unstaged): src/config/profile.ts, src/config/home.ts, src/lib/i18n/available.ts
```

The Pre-Phase 2 reconciliation changes (still uncommitted from before this phase) remain in the working tree: `docs/BRAND_IDENTITY.md`, `docs/content/LEGACY_CONTENT_INVENTORY.md`, `src/config/copy-review.ts`, `docs/reports/PRE_PHASE_2_DECISION_RECONCILIATION.md`. `AGENTS.md` and `CLAUDE.md` are Next-generated and untouched.

## 22. Architecture Decisions

Recorded in `ARCHITECTURE_DECISIONS.md` → "Phase 2 amendments":
- **ADR-003 ACCEPTED:** Payload 3.90.2 approved, with conditions: the mandatory first-user guard, the REST locale rule, build-time DB access, and an email adapter before production.
- ADR-004: committed migrations + `prodMigrations`.
- ADR-005: the lifecycle as implemented.
- ADR-006: CMS localization plus the unchanged copy-review gate.
- ADR-009: upload rules.
- ADR-011: revalidation design.
- ADR-012: the container build rules (secret mount path, `.env` assertion, `BUILD_ENV_ID`) and the verified topology.
- ESM package type.
- ADR-008: D-5 recorded.

No new ADRs were created.

## 23. Risk Register Changes

| Risk | Change |
|---|---|
| R-11 Payload spike fails | **CLOSED** (T1–T14 PASS) |
| R-04 Portrait | Re-scoped by D-5: design constraint, no replacement expected (MEDIUM) |
| R-28 Intermittent e2e | Root cause of the Phase 2 occurrence found (test isolation) and fixed; monitoring |
| R-32 Payload first-user window | **New**, mitigated, regression-tested |
| R-33 Build needs DB | New, runbook item |
| R-34 REST locale / full-document publish | New, documented |
| R-35 No email adapter | New, Phase 9 |
| R-36 Payload weight / cadence | New |
| R-37 Standalone not runnable on Windows with pnpm | New, accepted (production is Linux) |
| R-38 BuildKit secret cache | New, mitigated |
| R-39 Access denials logged as ERROR | New, Phase 9 |
| R-40 Secrets copied into image via standalone `.env` | New, mitigated and scanned |

## 24. Known Limitations

1. **Build-time DB dependency.** `next build` and `docker build` must reach PostgreSQL (static pages read the CMS). In T14 the build reached it via the host gateway, and the runtime via the private network.
2. **REST scripts** must pass `?locale=` and full documents for publish (the admin UI already does).
3. **No email adapter** yet (Phase 9).
4. **Payload logs expected 403s at ERROR level** (Phase 9 logging policy).
5. **The TLS certificate in T14 was self-signed and local.** The real certificate (Caddy/Let's Encrypt or equivalent), firewall, backups and monitoring are Phase 9/10; no VPS was provisioned.
6. **The admin UI chrome is English only.** Arabic content editing is RTL; an Arabic admin interface wasn't needed.
7. **Two superseded local images** (`yazan-portfolio:t14` and the untagged earlier `t14-prod`) and their local build cache contain the old `.env` with the local development secrets. They were never pushed, and they hold the same values as the local `.env`. Optional owner cleanup: `docker image rm yazan-portfolio:t14` plus a scoped build-cache prune. Per instruction, the agent didn't delete images or caches.
8. **No Core Web Vitals, Lighthouse or real screen-reader testing** (planned for later phases).
9. **The Arabic copy review is still pending** (D-9), so `/ar` stays 404 in production by design.

## 25. Payload Decision

**PASS**

Payload CMS 3.90.2 meets all 14 ADR-003 criteria with evidence, including the critical T1, T6, T7, T8 and T12. That includes the PostgreSQL runtime, bilingual no-fallback content, the lifecycle, auth and authorization, media, revalidation, SEO compatibility, public-bundle isolation (+874 B) and a proven Linux/Docker/nginx deployment.

The one serious Payload defect found (anonymous first-admin registration) is closed by a small, documented, regression-tested guard. It doesn't compromise the architecture. The custom-dashboard fallback is **not** required.

## 26. Next Phase Readiness

**READY FOR PHASE 3**

- The CMS foundation is approved and tested. Public data flows through the repository. `portrait.jpg` is the authoritative portrait (D-5), with derivatives possible without enlargement.
- The Phase 3 (cinematic landing) prerequisites are met: identity from the CMS, the HTML identity layer, and performance headroom.
- **Owner actions (not blocking Phase 3):**
  - review and commit this diff (nothing committed or pushed)
  - Arabic reviewer (D-9)
  - optional cleanup of superseded local images
  - keep the GitHub repository private until R-24 history cleanup
  - restart Claude Code so the 21st.dev MCP loads natively for the design phases

**Git state at the end of Phase 2:** no commit created, no push, remote unchanged, no history rewrite, **nothing staged**, parent repository `C:/Users/Lenovo` untouched. `git status --short` shows the working-tree changes listed in §20–21.

STOP — Phase 3 has not been started.
