# Architecture Decision Records

**Phase:** 0 — Architecture Freeze · **Revised:** Phase 0.1 (2026-09-27) — owner decisions applied (identity, VPS hosting, Payload downgraded to candidate, portrait audited)
**Date:** 2026-09-27
**Status legend:** `ACCEPTED` = frozen for implementation · `CANDIDATE` = preferred option pending a real implementation trial · `ACCEPTED — VALIDATE IN PHASE N` = frozen, with a spike and exit criteria · `PENDING OWNER` = the technical design is fixed but it needs an owner choice.

Versions below were read from the npm registry on 2026-09-27. Pin exact versions when scaffolding in Phase 1.

| Package | Latest | Note |
|---|---|---|
| next | 16.3.6 | engines node ≥ 20.9 |
| payload / @payloadcms/next / @payloadcms/db-postgres | 3.90.2 | `@payloadcms/next` peer: `next >=16.3.3 <17` ✔ compatible |
| next-intl | 4.14.7 | peer next ^16 ✔ |
| three / @react-three/fiber / @react-three/drei | 0.186.1 / 9.8.1 / 10.7.9 | |
| postprocessing / @react-three/postprocessing | 6.39.5 / 3.1.3 | |
| react / react-dom | 19.3.0 | |
| sharp | 0.35.5 | |
| vitest / @playwright/test | 5.0.2 / 1.63.0 | vitest requires node 22.12+ or 24 |

Local toolchain found: Node **v24.11.1**, npm 11.6.2, pnpm 11.10.0, git 2.50.1 (Windows 11).

---

## ADR-001 — Repository & toolchain

**Status:** ACCEPTED — **repository boundary implemented in Phase 0.1** (independent repo at the project root, branch `main`, local baseline commit, no remote). The parent `C:/Users/Lenovo/.git` was left untouched, as instructed.

**Context.** The spec folder is **not its own git repository**. `git rev-parse --show-toplevel` resolves to `C:/Users/Lenovo`, a repository covering the **entire user home directory**. It has no commits, and its untracked files include `.ssh/`, `.git-credentials`, `.claude.json`, `NTUSER.DAT` and more. Any `git add -A` from the project would stage secrets.

**Decision.**
- Initialize a **dedicated git repository at the project root** (`yazan-alsamman-portfolio-spec/`, or a renamed `yazan-alsamman-portfolio/`) before any code is written. Add a `.gitignore` covering `.env*`, `node_modules`, `.next`, `media/`, `*.local`.
- Package manager: **pnpm** (installed, strict dependency graph, fast CI). Lock with `packageManager` in `package.json`.
- Runtime: **Node 24 LTS** (`.nvmrc` / `engines`).
- TypeScript `strict: true`, plus `noUncheckedIndexedAccess`.

**Alternatives.** Keep using the home-directory repo (rejected: catastrophic secret-leak risk). npm (acceptable; pnpm preferred for strictness).

**Consequences.** Owner/operator action: see O-02 in the Phase 0 report. The stray home-directory repo (`C:/Users/Lenovo/.git`) should also be reviewed by the owner. It is outside this project's scope and was **not** modified.

---

## ADR-002 — Application framework & rendering

**Status:** ACCEPTED

**Decision.** **Next.js 16 (App Router, React Server Components) + TypeScript**, one application serving the public site and the dashboard.
- Public pages: **static generation with on-demand revalidation** (`revalidateTag` / `revalidatePath` triggered by CMS publish hooks). HTML is complete at request time, so crawlers and no-JS users get full content.
- `output: 'standalone'` for container deployment (keeps the host portable, see ADR-012).
- Client JavaScript is limited to the scene island, navigation disclosure, language switcher and small interactions.

**Alternatives.**
- *Astro + islands:* smallest JS for content pages and excellent for SEO. But it has no first-class embedded CMS/auth story, and the dashboard would be a second app. Rejected for a two-app operational burden.
- *Vite SPA (React):* rejected — client-side rendering conflicts with SEO-MASTER §5/§31.
- *Remix/React Router 7:* viable, but it lacks the embedded-CMS option of ADR-003.

**Consequences.** The React runtime (~69 KB gzip, measured — see ADR-007) is on every page. It is acceptable because content pages are RSC-heavy with small client islands. Budgets are in ADR-015.

---

## ADR-003 — CMS / dashboard

**Status:** **ACCEPTED — Payload CMS 3.90.2 is the approved CMS foundation (Phase 2 trial: T1–T14 all PASS; decision rule not triggered).** Evidence: `docs/reports/PHASE_2_REPORT.md`. The custom-dashboard fallback is not needed. Conditions attached to the approval are listed in "Phase 2 amendments" below (first-user guard, REST locale rule, build-time DB access, email adapter before production).

**Candidate.** **Payload CMS 3**, embedded in the same Next.js app and mounted at `/admin`. The public site reads content through Payload's **Local API** (in-process, no HTTP hop) inside a thin repository/service layer (`src/content/*`), so no page component ever talks to Payload directly.

**Why.** The dashboard spec needs, out of the box or nearly so:

| Requirement (DASHBOARD_SPEC / SECURITY) | Payload 3 | Custom (Drizzle + auth lib) |
|---|---|---|
| Authenticated admin, lockout after failed logins, secure cookies | built-in (`auth`, `maxLoginAttempts`, `lockTime`) | build and audit ourselves |
| Per-field EN/AR localization | built-in (`localization`, `localized: true`) | build |
| Drafts, versions, change history (auditability) | built-in (`versions.drafts`) | build |
| Media library with image resizing (sharp), alt text, MIME/size limits | built-in upload collections | build |
| Access control per collection/field | built-in | build |
| Admin UI that is fast and functional, not competing with the public site | built-in, customizable | build every screen |
| Same deploy unit as the site | yes (runs inside Next) | yes |

Building all of this by hand is the largest security surface of the project. Payload removes most of it while keeping data in our own Postgres (no vendor lock of content).

**Alternatives.**
- *Custom dashboard (Next + Drizzle + better-auth):* maximum control, but it roughly triples Phase 5 effort and the security review surface. **Designated fallback** if the Phase 2 spike fails.
- *Sanity / Contentful (hosted):* excellent editing, but content lives with a third party, costs scale, and admin access control is external. Rejected for data-ownership reasons (not a hard blocker).
- *Strapi:* a separate Node service to host and patch. Rejected (two deploy units).
- *Git-based (Keystatic, TinaCMS):* no database, but media library, usage tracking, audit log and non-developer publishing are weak, and publishing requires a rebuild. Rejected.

**Phase 2 implementation trial — evaluation matrix.** Each row gets PASS / FAIL / PARTIAL with evidence in the Phase 2 report.

| # | Area | Pass criterion |
|---|---|---|
| T1 | Bilingual content | Localized EN/AR fields; `fallback: false` respected; Arabic RTL editing works in the admin |
| T2 | Projects | Full DASHBOARD_SPEC project field set, incl. case-study sections, featured flag, sort order |
| T3 | Certificates | Fields + image/PDF attachment; issuer and verification URL |
| T4 | Media | Upload with MIME/magic-byte/size validation, sharp derivatives, alt text EN/AR, usage tracking |
| T5 | CV | Per-locale PDF, version, updated date, download visibility |
| T6 | Publishing | `DRAFT → PUBLISHED → ARCHIVED`; drafts never reach public pages or the sitemap; on-demand revalidation |
| T7 | Authentication | Login, logout, lockout, secure cookies, no public sign-up, env-seeded first admin |
| T8 | Authorization | Collection/field access control; public queries restricted to published content |
| T9 | SEO metadata | Localized title/description fields, slug + redirect-on-change, validation |
| T10 | Relationships | Project ↔ skills ↔ media ↔ experience; no orphan references on archive |
| T11 | Validation | Required fields per status; Zod at service boundaries; useful admin errors |
| T12 | PostgreSQL | db-postgres adapter, committed migrations, clean `migrate` on an empty DB |
| T13 | Maintainability | Generated types pass `tsc`; the admin bundle does not leak into public chunks; version pinning workable |
| T14 | VPS deployment | Runs in the standalone Docker image behind a reverse proxy with persistent media volume + Postgres (ADR-012) |

**Decision rule:** any FAIL on T1, T6, T7, T8 or T12, or three or more FAIL/PARTIAL overall, → switch to the fallback (custom dashboard: Next.js + Drizzle + an audited auth library), and record a superseding ADR.

**Consequences.** Coupling to Payload's release cadence (mitigated by exact pinning and Renovate-style update PRs). The admin look is Payload's, which matches "operational product, not cinematic".

---

## ADR-004 — Database, migrations & backups

**Status:** ACCEPTED

**Decision.** **PostgreSQL** (≥ 16) via `@payloadcms/db-postgres` (Drizzle underneath).
- Schema changes via **committed Payload migrations** (`payload migrate:create`); `push` mode only in local dev.
- Dev: Postgres in Docker (`docker compose`). Docker config exists on the machine; the daemon was not verified in Phase 0.
- Backups: daily `pg_dump` (compressed) + media sync, retained 7 daily / 4 weekly / 6 monthly, stored off-host; restore procedure rehearsed in Phase 9.
- Validation: Payload field validation plus **Zod** schemas in the content service layer for anything crossing a boundary (env, route params, revalidation webhooks).
- Caching: Next data cache tagged per entity (`project:{id}`, `projects`, `profile`), invalidated by Payload `afterChange` hooks.

**Alternatives.** SQLite (`@payloadcms/db-sqlite`): simpler for a single admin, but awkward on serverless hosts and with concurrent backups. MongoDB: no advantage here. Rejected.

---

## ADR-005 — Publishing model

**Status:** ACCEPTED

**Decision.** Single-admin installation → **`DRAFT → PUBLISHED → ARCHIVED`** (no REVIEW state; DASHBOARD_SPEC allows this simplification).
- DRAFT/PUBLISHED = Payload drafts (`_status`). ARCHIVED = a boolean `archived` + `archivedAt` that removes an item from all public queries while keeping its versions (soft delete).
- Hard delete only from ARCHIVED, behind a confirmation dialog.
- Public queries **always** filter `_status = published AND archived = false`. This is enforced in the repository layer and covered by tests. Drafts can never reach a public page, the sitemap or JSON-LD.
- Slug change on a published document automatically creates a `redirects` entry (301 old → new).
- Audit: Payload versions + an `audit-log` collection written by hooks (who, what, when, action).

**Alternatives.** A 4-state model with REVIEW: pointless for one editor. Can be added later without migration pain (it becomes a select field).

---

## ADR-006 — Localization

**Status:** ACCEPTED — URL scheme English `/` + Arabic `/ar` confirmed by the owner's Phase 0.1 instructions (O-07 resolved)

**Decision.**
- **URL option B:** English at `/`, Arabic at `/ar/...` (I18N spec Option B). Implemented with **next-intl** (`localePrefix: 'as-needed'`) for UI strings and routing helpers. UI strings live in `messages/{en,ar}.json`, split into the namespaces from I18N_AND_LOCALIZATION.md.
- **No automatic locale redirect** by `Accept-Language` or IP. The root must be stable for crawlers.
- `<html lang dir>` is set in the root layout per locale (`dir="rtl"` for `ar`). Styling uses **CSS logical properties only** (`margin-inline-start`, etc.); physical left/right is lint-banned except where intentional (e.g. media timelines).
- Content localization: Payload `localization: { locales: ['en','ar'], defaultLocale: 'en', fallback: false }`.
  **An Arabic page for an entity is generated only when its required Arabic fields are complete.** Otherwise `/ar/projects/{slug}` returns 404 and the English page omits the `ar` hreflang. No silent English fallback on Arabic pages, and no machine-translated professional copy without review.
- Proper names, technology names and certificate titles are **non-localized fields** unless the owner supplies an official Arabic form.
- Dates: `Intl.DateTimeFormat` per locale. Numerals: Western Arabic digits (0–9) in both locales by default, for consistency with technical content — reviewable in Phase 7.

**Alternatives.** Option A (`/en` + `/ar`): symmetric, but it needs a root redirect and changes the canonical home URL. Rejected: B gives the cleanest canonical for the primary domain.

---

## ADR-007 — 3D stack & dependency cost

**Status:** ACCEPTED — VALIDATE IN PHASE 3/8 · **unchanged in Phase 0.1** (owner instruction: preserve). Loading order: HTML / typography / identity → core page content → 3D enhancement. Phones (Low tier) and reduced-motion users do not download the full scene.

**Measurement (Phase 0).** Minimal entry points were bundled with esbuild 0.28 (`--minify`, production define) and gzipped (level 9). The numbers are indicative: Next/Turbopack chunking will differ, and Phase 8 remeasures the real build.

| Bundle | min | gzip |
|---|---|---|
| react + react-dom/client | 223 KB | **69 KB** |
| three — typical tree-shaken imports (renderer, instancing, shaders, points, lights) | 546 KB | **137 KB** |
| three — full namespace | 746 KB | 191 KB |
| react + @react-three/fiber (+ three; R3F imports the full three namespace) | 1,152 KB | **319 KB** |
| + drei (useGLTF, Environment, Instances, AdaptiveDpr, PerformanceMonitor, useTexture) | +133 KB | **+43 KB** |
| + @react-three/postprocessing (EffectComposer, Bloom, Vignette) | +99 KB | **+27 KB** |
| gsap + ScrollTrigger | 117 KB | 46 KB |
| lenis | 19 KB | 6 KB |

Derived: R3F costs **~113 KB gzip more** than vanilla three with a React wrapper (319 vs 206), because it defeats three's tree-shaking. The full R3F + drei + postprocessing scene payload is ~**320 KB gzip** beyond the React the page already ships.

**Decision.**
- **three + @react-three/fiber + selective drei** for the scene. Reasons: a multi-chapter scene that will be iterated visually for months benefits from declarative composition, automatic disposal on unmount, `useFrame` scheduling and drei's `PerformanceMonitor`/`AdaptiveDpr` for tiering. The cost is paid **only by tiers that render WebGL**, and **off the critical path**.
- **Postprocessing loaded only in the High tier** (a separate dynamic chunk).
- **No GSAP and no Lenis initially.** Scroll → timeline is a small in-house module: normalized progress from native scroll, damped in `useFrame` (critically damped spring / exponential smoothing), with chapter ranges as data. Native scroll keeps keyboard, touch, find-in-page and assistive tech intact. GSAP (46 KB) is re-evaluated only if timeline authoring becomes the bottleneck.
- **Loading strategy:** the scene is a client island loaded via dynamic `import()` after first paint/idle, **never blocking LCP**. The LCP element is HTML (the H1 or a static portrait image), never the canvas.
- **Tiering** (LANDING_CINEMATIC_SPEC): capability detection (WebGL2 availability, `deviceMemory`, `hardwareConcurrency`, `navigator.connection.saveData`, coarse pointer + viewport) plus runtime `PerformanceMonitor` downgrade.
  - High: full scene + postprocessing.
  - Medium: no postprocessing, reduced particles/shadows, DPR cap 1.5.
  - **Low / mobile: no three.js download at all** — a composed 2.5D HTML/CSS/image treatment of the portrait and chapters.
  - Reduced motion (`prefers-reduced-motion: reduce`): a static composition, no camera travel, no three download unless the owner later wants a still render.
- **Isolation:** `src/scene/**` receives only a plain serializable `SceneConfig` (chapter data, tier, reduced-motion flag) via props. No CMS calls, no router, no i18n inside the render loop. The loop pauses when the canvas is offscreen (`IntersectionObserver`) or the tab is hidden.
- 3D assets: glTF with **Meshopt** (preferred over Draco for decode speed) + KTX2 textures where used. Procedural geometry is preferred (smaller, on-brand).

**Alternatives.** Vanilla three (−113 KB, more boilerplate, manual disposal) is the **fallback** if Phase 8 shows the R3F chunk harms medium-tier INP/TBT. Babylon.js (much larger). Spline runtime (heavy, limited control) — rejected.

**Phase 3 amendments (implementation, 2026-09-28).** Evidence: `docs/reports/PHASE_3_REPORT.md`.
- **Stack as built:** `three` 0.186.1 + `@react-three/fiber` 9.8.1 only. **No drei, no postprocessing, no GSAP, no Lenis.** What drei would have provided (environment, adaptive DPR, instancing) is a few lines of in-house code; the scene is procedural with custom GLSL, so no glTF/Meshopt/KTX2 pipeline was needed. Lazy scene chunk measured: **250,527 B** transferred (gzip), requested after idle time, never on the critical path.
- **Tiers as built (`src/scene/quality.ts`):** `static` (reduced motion, no WebGL2, Save-Data, `deviceMemory ≤ 2`) → HTML/CSS composition, **no three.js download**; `low` (coarse pointer or width < 768) → the same narrative with a lighter scene (1,400 points, fewer nodes/paths, no antialias, no shadows, DPR ≤ 1.5); `medium`; `high` (5,200 points, shadows, DPR ≤ 2). **Deviation from the Phase 0 text above:** "Low / mobile: no three.js download at all" becomes "Low renders a reduced scene; *static* is the no-download tier". Reason: the Phase 3 specification asks for a dedicated mobile composition of the 3D narrative; constrained phones (Save-Data, ≤ 2 GB) still get the static tier. Reverting is a one-line change in `detectTier` (map `low` → `static`).
- **Runtime downgrade:** adaptive DPR (average frame > 25 ms over 120 frames → DPR −0.25, floor 1) instead of drei's `PerformanceMonitor`. The frameloop stops when the section is offscreen (`IntersectionObserver`); requestAnimationFrame already stops in hidden tabs.
- **Failure handling:** error boundary + `webglcontextlost` + chunk-load failure → the static composition stays; the canvas is revealed only after its first frame.
- **Lint scope:** the React Compiler rules `react-hooks/immutability` and `react-hooks/refs` are disabled for `src/scene/**` only (R3F mutates GPU objects inside `useFrame` by design); they stay on everywhere else.

---

## ADR-008 — Portrait treatment pipeline

**Status:** ACCEPTED — asset supplied (Phase 0.1). **D-5 (Phase 2): the owner decided `portrait.jpg` (538 × 661) is the authoritative portrait; no higher-resolution replacement is required.** The "higher-resolution original" recommendations below are superseded; Phase 3 designs around the source resolution.

**Asset facts (Phase 0.1 audit).** `portrait.jpg` at the project root: baseline JPEG, **538 × 661 px**, 71,666 bytes, RGB 8-bit, JFIF 72 dpi, no ICC profile, EXIF: Windows Photo Editor + timestamp only, **no GPS**. SHA-256 `1c00fa07…3fca`. Content: candid three-quarter profile facing left, black leather jacket, warm beige wood-panel background, clasped hands at bottom-left, **and a second person's hand holding a blue pen at the bottom-right edge**.

**Implications.** At this resolution the image covers at most ~540 CSS px at 1× (~270 CSS px on 2× screens). That is fine for mobile, an About portrait or a mid-sized card, but **insufficient for a full-bleed desktop hero or a large 2.5D scene layer** without visible softness. The warm background must be matted/separated for the dark identity. The third-party hand must be cropped out of every derivative. Upscaling with generative/"AI enhance" tools is **not allowed** (identity-distortion rule). Only conventional resampling is permitted, and a new higher-resolution original is the preferred fix (owner request in the Phase 0.1 report).

**Decision.** The owner-supplied original is stored privately (never served). Derivatives are generated with sharp: AVIF + WebP + JPEG fallback at responsive widths, EXIF/GPS stripped. For the scene: a **2.5D approach** — a subject matte (alpha) and optional depth map produced offline in Phase 3, used for layered parallax and rim lighting. **No fake 3D face reconstruction** (LANDING spec). The same image is the static LCP/fallback in Low/reduced-motion tiers. The legacy `yazan.jpg` is **not** used (CONTENT_MIGRATION).

**Phase 3 amendment (as built).** No offline matte or depth map was produced: at 538 × 661 a hand-made matte adds little and risks altering the subject. The scene uses the build-hashed copy of `portrait.jpg` as a texture with a UV crop (u 0–0.94, v 0.12–1, which removes the third party's hand), a restrained duotone grade that keeps 18 % of the original colour, a soft vignette mask, a blurred atmosphere plane behind it (two-plane 2.5D depth) and a scroll-driven scan reveal. Every frame, the projected height is **capped at the cropped source height (582 CSS px)**, so the portrait is never displayed larger than its source. The HTML fallback uses the same crop in CSS with `next/image` (optimized derivatives) at a fixed maximum width of 20 rem. The source file is untouched (SHA-256 unchanged).

---

## ADR-009 — Media storage & upload safety

**Status:** ACCEPTED (storage backend follows ADR-012)

**Decision.** Payload upload collections (`media`, `documents`), sharp resizing, and a storage adapter chosen by the host: local persistent volume on a VPS, or S3-compatible object storage (e.g. Cloudflare R2) on serverless. Upload rules:
- Allowlist: `image/jpeg`, `image/png`, `image/webp`, `image/avif`, `application/pdf`. **SVG uploads disabled** (script vector). Magic-byte sniffing, not just extension/MIME header.
- Size caps: images 15 MB, PDFs 20 MB; maximum pixel dimensions enforced.
- Filenames are regenerated (slug + hash); the original name is stored only as metadata.
- Served with `Content-Disposition` appropriate to the type and `X-Content-Type-Options: nosniff`. Certificate/CV PDFs get `X-Robots-Tag: noindex` by default.
- Alt text EN/AR is required for non-decorative images before publish (validation).

---

## ADR-010 — Authentication & authorization

**Status:** ACCEPTED — hardening in Phase 5/9

**Decision.** Payload built-in auth on a `users` collection, used for dashboard access only.
- No public sign-up. The first admin is created by a CLI seed script that reads credentials from environment/prompt; nothing hard-coded.
- HttpOnly, `Secure`, `SameSite=Lax` cookies; short session lifetime (e.g. 2 h) with explicit logout; `maxLoginAttempts` + `lockTime`; Payload `csrf` allowlist set to `SITE_URL`.
- Additional rate limiting on `/api/users/login` at the reverse proxy/edge.
- **Gap:** Payload has no native TOTP 2FA. Mitigation options (decided in Phase 9): (a) put `/admin` behind an identity-aware proxy (e.g. Cloudflare Access) or IP allowlist; (b) add a TOTP plugin/custom strategy. Recorded as R-10.
- Roles: `admin` only for now; access-control functions are still written per collection so a second role can be added safely.

---

## ADR-011 — SEO architecture

**Status:** ACCEPTED

**Decision.**
- `SITE_URL` env (validated with Zod at boot) is the single source for canonical/OG URLs. No hard-coded domain.
- Next Metadata API per route (`generateMetadata`) with title/description fields in the CMS (localized, required for published entities); site-level defaults in SiteSettings.
- `app/sitemap.ts` and `app/robots.ts` are generated from **published, non-archived** content only, with locale alternates (`xhtml:link` hreflang) only where both locales exist.
- JSON-LD: `WebSite`, `Person` (built exclusively from verified Profile fields; `sameAs` only for owner-confirmed profiles), `BreadcrumbList` on project pages, and `CreativeWork` for projects. `SoftwareSourceCode` only when a public repo is linked and the page is about the code.
- OG images: static default plus per-project images via `next/og`. The Arabic font must be embedded for Arabic OG text (verify shaping in Phase 7).
- `noindex` via `X-Robots-Tag` on `/admin`, `/api`, preview, and error pages. The production build fails if any public route emits `noindex` (a test in ADR-015).
- A repeatable SEO checker (Playwright crawl of the built site) covers SEO-MASTER §38.

---

**Phase 4 amendment (as built, 2026-09-28).**
- **Route availability** is computed from the CMS per locale (`fetchRouteAvailability`); it drives the header, footer, sitemap and the route gate. A content route without published content returns 404 in production and does not appear anywhere. In development it renders a visible notice and is `noindex`.
- **hreflang** pairs only locales in which the *same page* exists: `buildPageMetadata({ availableIn })`, and the sitemap's per-URL alternates.
- **Project pages** emit `BreadcrumbList` + `CreativeWork` (author = the site's `Person`). They are not `SoftwareSourceCode`. Certificates get no schema (SEO_MASTER §25).
- **Retired slugs** resolve through the `redirects` collection on the project route (308/307).
- **Share images:** project covers become the Open Graph/Twitter image (`summary_large_image`). The site-wide default share image remains Phase 7.

## ADR-012 — Hosting & deployment

**Status:** ACCEPTED — **production target: VPS** (owner decision, Phase 0.1). VPS provider and OS are **not selected**. The domain currently parks at Hostinger, but that does not imply the VPS provider. The final topology may be refined after implementation research (Phases 2, 9, 10). No infrastructure is provisioned before Phase 9/10.

**Expected production topology (VPS):**

```text
Internet
   ↓  (DNS: yazanalsamman.com → VPS IP; www → apex redirect)
Reverse proxy / TLS  — e.g. Caddy or Nginx (auto-TLS, HSTS, security headers, rate limit on /api/users/login, optional access control for /admin)
   ↓
Next.js application (standalone Node server, Docker container)
   ↳ Payload CMS (candidate, ADR-003) — runs in-process inside the Next.js app, serving /admin and /api
   ↓
PostgreSQL (container or host service; not exposed publicly)

Media storage
   ↓
Persistent volume on the VPS (default), mounted into the app container
   — or S3-compatible object storage if disk/backup needs grow (same storage-adapter seam, ADR-009)

Backups: nightly pg_dump + media sync → off-host location (ADR-004)
```

**Consequences.** Operations are on us/the owner: OS patching, firewall (only 80/443/SSH open, SSH key-only), unattended security updates, monitoring/uptime checks, log rotation, backup verification. These go into the Phase 9 hardening scope and the Phase 10 runbook. The Vercel-specific option is dropped, and the code remains host-portable (standalone output, env-selected storage adapter).

**Options considered in Phase 0 (historical).**

| | A. VPS + Docker Compose (e.g. Hostinger VPS or any VPS) | B. Vercel + managed Postgres (e.g. Neon) + R2/S3 media |
|---|---|---|
| Components | Next/Payload container, Postgres, Caddy (auto-TLS, headers, rate limit) | Managed everything |
| Cost | one fixed VPS fee | free/low tiers, can grow; multiple vendors |
| Ops burden | OS patching, backups, monitoring **on us** | minimal |
| Media | local volume (simple) | object storage (required) |
| Fit with Payload | excellent | good (documented), watch cold starts and function limits |

**Outcome.** The owner selected **A (VPS)**.

---

## ADR-013 — Contact

**Status:** ACCEPTED (v1)

**Decision.** v1 ships **no server-side contact form**: owner-approved email link(s) and social links only. A form needs an email provider, spam protection (Turnstile/hCaptcha), rate limiting and a privacy notice, so it is deferred until the owner requests it (O-08). The legacy PHP form never worked on GitHub Pages anyway.

---

## ADR-014 — Analytics & observability

**Status:** ACCEPTED

**Decision.** **No analytics at launch** (TECHNICAL_ARCHITECTURE: no tracking without documented purpose). Errors: structured server logs (pino via Payload's logger) + optional error reporting (e.g. Sentry) behind an env flag, documented in Phase 9. If the owner later wants traffic stats, prefer a cookieless, privacy-friendly tool and document it.

---

## ADR-015 — Styling, quality gates & budgets

**Status:** ACCEPTED (Phase 1 may refine styling with a documented reason)

**Styling.** Design tokens as **CSS custom properties** (from BRAND_IDENTITY) consumed through **Tailwind CSS v4** utilities, which have logical-property utilities and `rtl:`/`ltr:` variants. Fonts are self-hosted via `next/font`: Space Grotesk (display, Latin only), Inter (body), IBM Plex Sans Arabic (Arabic body and display). Space Grotesk has **no Arabic glyphs**, so Arabic headings use IBM Plex Sans Arabic, and the type scale must be tuned per script in Phase 1. UI motion: CSS transitions/`@starting-style` first; a motion library only with a documented need.

**Quality gates (CI on every PR):** `tsc --noEmit`, ESLint (incl. jsx-a11y, a physical-direction ban), Vitest (unit/integration), Playwright (e2e EN/AR, axe-core a11y), SEO crawler checks, `next build`. Lighthouse CI on `/`, `/projects`, one project page — mobile + desktop.

**Initial budgets (targets to validate — not measurements):**
- Critical-path JS for `/`, **excluding** the lazy scene chunk: ≤ 170 KB gzip.
- Scene chunk (High tier, incl. three/R3F/drei/postprocessing): ≤ 400 KB gzip; Low tier: 0 KB of three.
- LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms (mobile, Lighthouse lab + field when available).
- Hero/portrait LCP image ≤ 150 KB (AVIF, mobile width).
- Scene: 60 fps target on High, ≥ 45 fps sustained on Medium; render loop idle when offscreen.

---

## ADR-016 — Environment & secrets

**Status:** ACCEPTED

`.env.example` committed; real `.env*` git-ignored. Required: `SITE_URL`, `DATABASE_URL`, `PAYLOAD_SECRET`, storage credentials (per ADR-012), optional `SENTRY_DSN`. The env is validated with Zod at startup; the build fails fast on a missing or invalid env. `NEXT_PUBLIC_*` is reserved for non-secret values only.

---

## ADR-017 — Canonical identity source

**Status:** ACCEPTED (Phase 0.1)

**Decision.** `docs/content/OWNER_PROFILE.md` is the only source for identity. In the product, identity values (name EN "Yazan Al Samman", name AR "يزن السمان", title "Artificial Intelligence Engineer") live once in the CMS `Profile`/SiteSettings, seeded from that file. Metadata, JSON-LD `Person`, the wordmark, OG images and footers read from that single record. Components never hard-code the name or title, except the static HTML fallback required for no-JS rendering, which is generated from the same record at build time. Changing the title requires explicit owner approval (recorded in OWNER_PROFILE).

**Consequences.** The domain handle `yazanalsamman` differs from the display spelling "Al Samman". `Person.alternateName: "Yazan Alsamman"` is a pending owner decision (SEO benefit: matches the domain and the legacy/GitHub spelling).

---

## ADR-018 — Theme modes

**Status:** ACCEPTED (Phase 1)

**Decision.** Dark is the default and primary brand expression (`<html data-theme="dark">` is server-rendered). Light is an opt-in readability mode chosen with a toggle. The choice persists in `localStorage` and is applied by a ~150-byte inline script in `<head>` before first paint, so there is no flash. We deliberately do **not** follow `prefers-color-scheme` automatically: the brand is dark-first, and an OS light setting should not silently change the flagship identity. Both modes share one design language: same type, geometry, spacing and motion; only semantic color roles change.

**Alternatives.** A cookie read on the server (rejected: it makes every page dynamic, which loses static generation). Following the system preference (rejected, as above; reconsider only on owner request).

**Consequences.** Two inline scripts exist (theme init + JSON-LD). The Phase 9 CSP must allow them by hash or nonce (R-27).

---

## ADR-019 — Development preview surfaces

**Status:** ACCEPTED (Phase 1)

**Decision.** Owner-pending content is shown **only outside production** as explicit `TODO: OWNER INPUT REQUIRED` markers (`DevPlaceholder`) and a "pending sections" panel on the home page. An internal `/design-system` route (both locales) exists for visual QA of tokens and primitives. It is gated by `DESIGN_PREVIEW` (default on outside production; env validation **fails the build** if it is enabled in production), is always `noindex` (metadata + `X-Robots-Tag`), is disallowed in `robots.txt` and is absent from the sitemap. Planned navigation routes are likewise listed only outside production (`getPrimaryNav`).

**Consequences.** Production renders only verified content. Pending sections are simply absent, never "coming soon".

---

## Phase 1 implementation amendments

Changes and refinements made while implementing Phase 1. Each is binding from now on.

| ADR | Amendment | Reason |
|---|---|---|
| 001 | **TypeScript pinned to 6.0.3** (not 7.0.2) and **ESLint to 9.39.5** (not 10.x). | `typescript-eslint` (used by `eslint-config-next` 16.3.6) supports `typescript <6.1`, and `eslint-plugin-react`/`import`/`jsx-a11y` declare ESLint ≤ 9. Upgrade when the tooling supports them. |
| 001 | `pnpm-workspace.yaml` → `allowBuilds` explicitly **denies** install scripts for `@swc/core`, `@parcel/watcher` (next-intl's optional, unused message extractor) and `unrs-resolver` (its binary ships via optional deps). | pnpm 11 blocks lifecycle scripts by default. Keeping them denied is the safer supply-chain default, and all tooling works without them (verified). |
| 002 | The Next 16 middleware file is **`src/proxy.ts`** (renamed convention). `output: 'standalone'` builds successfully on Windows. `next start` warns under standalone; **production must run `node .next/standalone/server.js`** with `.next/static` copied alongside (Phase 9/10 runbook). | Next 16 conventions; verified locally. |
| 006 | Implemented with next-intl 4.14 (`localePrefix: 'as-needed'`, `localeDetection: false`, `localeCookie: false`). **`/en` and `/en/*` → 308** to the unprefixed URL (via `next.config` redirects; next-intl alone issues 307). **In production an unpublishable locale is not served (404)** and is hidden from the switcher, hreflang and the sitemap. Publishability = no owner-input placeholders + identity complete. The Arabic catalog is type-checked against the English shape (a missing key is a compile error). | ADR-006 "no silent fallback"; SEO_MASTER §33. |
| 007 | Unchanged. The one 21st.dev component that used GSAP was re-implemented without it, so GSAP remains excluded. | Dependency policy. |
| 011 | Implemented: `buildPageMetadata` (title, description, canonical, hreflang, OG, Twitter, robots), `robots.ts` (environment-gated), `sitemap.ts` (live routes × publishable locales), `Person` + `WebSite` JSON-LD from confirmed fields only. Non-production responses also send `X-Robots-Tag: noindex, nofollow`. | SEO foundation. |
| 015 | **Fonts are self-hosted from Fontsource 5.3.0 files committed in `src/fonts/`** (OFL; Latin subsets for Inter/Space Grotesk, Arabic subset for IBM Plex Sans Arabic), loaded via `next/font/local`. There is no network dependency at build or run time. UI motion is **CSS-only** (no motion library). Tailwind's default palette, fonts, shadows and breakpoints are **removed** so only tokens can be used. A lint rule bans physical-direction utilities. | Deterministic builds; token discipline; RTL safety. |
| 015 | **Token refinements** (documented in the Phase 1 report): light-mode `--accent-text`/`--link` `#007992` (brand `#007F9A` is 4.35:1 on the light background, below AA for body text; kept for fills and rings); new `--line-strong` (dark `#636B75`, light `#858D97`) for component boundaries that need 3:1; derived light `--line`, `--success`, `--warning`. **No brand hex value was changed.** | WCAG 1.4.3 / 1.4.11. |

---

## Pre-Phase 2 decision reconciliation (2026-09-27)

Owner decisions applied; see `docs/reports/PRE_PHASE_2_DECISION_RECONCILIATION.md`.

| ADR | Change | Evidence |
|---|---|---|
| 017 | **Arabic professional title confirmed: "مهندس ذكاء صنعي"** (D-6). Stored once in `src/config/profile.ts` (mirrors OWNER_PROFILE). The Arabic H1, `<title>`, meta description, OG/Twitter and JSON-LD `jobTitle` all derive from it. `Person.name` stays the single canonical entity name "Yazan Al Samman" in every locale. | Owner instruction |
| 017 | **`alternateName`: NOT CONFIRMED / DEFERRED** (D-7). No owner confirmation that "Yazan Alsamman" is a public name; domain spelling is not evidence. Remains unset. | Repository audit |
| 018 | **Dark-by-default confirmed by the owner** (D-10). The implementation was verified to still match: `data-theme="dark"` server-rendered, light opt-in, no `prefers-color-scheme` override, persisted and applied before paint. | Owner instruction; code + e2e |
| 006 | **Locale publication gate extended with copy review.** A locale is publishable only when there are (1) no owner-input placeholders, (2) confirmed identity, and (3) where required, an approved human copy review (`src/config/copy-review.ts`). Arabic requires review per I18N_AND_LOCALIZATION and SEO_MASTER §20. **Result: Arabic is technically complete but NOT publishable** until an owner-appointed reviewer approves `messages/ar.json` (D-9). In production `/ar` returns 404 and is excluded from hreflang, sitemap and the switcher; this lifts automatically when the review is recorded. | Spec requirement; tests |
| — | **YA monogram: deferred until explicit owner approval** (D-8). Not rendered; no asset; the favicon stays neutral and provisional. No new mark is created. | BRAND_IDENTITY, audit |

---

## Phase 2 amendments (2026-09-27) — CMS trial outcome

| ADR | Amendment | Evidence |
|---|---|---|
| 003 | **Payload 3.90.2 approved** (`payload`, `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`, `@payloadcms/ui` pinned exactly; `graphql` pinned to 16.14.2 because Payload's peer range is `^16.8.1`). Embedded at `/admin`; REST at `/api`; **GraphQL disabled**. | Phase 2 report §6 |
| 003 | **Architecture as built:** Payload → `src/content/payload-adapter.ts` (the only module that knows Payload document shapes) → `src/content/types.ts` (Zod-validated domain contract) → `src/content/repository.ts` (`unstable_cache` + tags, server-only) → pages/components. The Phase 1 seams `src/config/profile.ts` and `src/config/home.ts` are removed. | Code; tests |
| 003 / 010 | **Mandatory guard:** Payload's first-user registration creates an admin for anonymous callers when `users` is empty. A `beforeOperation` hook on `users` rejects every HTTP user creation unless it comes from an authenticated admin; the first admin is created only by `pnpm cms:seed` from env vars. Must be re-verified on every Payload upgrade (e2e + deployment check). | Reproduced, fixed, tested (host and Linux container, empty DB) |
| 003 | **REST usage rule:** partial updates must pass `?locale=`, and publishing sends the full document (as the admin UI does). Prefer the Local API in-process. | e2e |
| 004 | **Migrations:** committed Payload migrations only (`push: false`); `prodMigrations` applies pending migrations when the standalone server starts (NODE_ENV=production). Proven on Linux against an empty database (0 → 64 tables). | T12, T14 |
| 005 | Lifecycle implemented: drafts/versions (Payload) + `archived`/`archivedAt` (soft) + delete only when archived + per-locale `translationStatus` (`draft`/`in_review`/`approved`) + audit-log collection. | T6 tests |
| 006 | CMS localization: `en` + `ar` (`rtl: true`), `fallback: false`. The public repository shows a locale only when its content is `approved`; the site-level Arabic copy-review gate (`src/config/copy-review.ts`) is unchanged, so `/ar` remains 404 in production. | T1 tests; T14 |
| 009 | Uploads: magic-byte sniffing + per-collection size limits + regenerated filenames (our hook) on top of Payload's MIME allowlist and PDF structure validation; derivatives `withoutEnlargement`; SVG rejected; local filesystem under `MEDIA_DIR` (persistent volume), S3-compatible adapter seam unchanged. | T4 tests; T14 persistence |
| 011 | Revalidation: CMS hooks call `revalidateTag(tag, { expire: 0 })` in-process (next request is fresh); signed `POST /api/internal/revalidate` (HMAC-SHA256 over timestamp + body, ±5 min, constant-time) for out-of-process triggers. Public pages stay statically generated. | e2e; T14 |
| 012 | **Container:** multi-stage `Dockerfile` (node:24-alpine, pnpm 11.10.0), non-root `node` user, `node server.js`, `/app/media` volume. Build-time env is passed as a BuildKit **secret mounted at `/run/secrets/buildenv` and exported into the build process only** — never as `/app/.env`, because Next's standalone output copies any `.env` into the image (T14 finding: the first image shipped the DB password and Payload secret; the build now fails if an `.env` reaches the standalone output, and the final image was scanned: 0 files contain a secret value) — **plus a non-secret `BUILD_ENV_ID` hash**, because BuildKit does not include secret contents in the cache key (without it a changed `SITE_URL` silently reused a stale build — found in T14). The build must reach PostgreSQL (static pages read the CMS). | T14 |
| 012 | **Verified topology:** nginx (TLS, HTTP→HTTPS) → app container (no published port) → PostgreSQL on a private Docker network. `tests/deployment/verify-deployment.mjs` is the repeatable post-deploy check (14 checks). | T14 |
| — | Package is ESM (`"type": "module"`), required for the Payload CLI to load the config. | Build/CLI |

---

## Phase 6 amendments (2026-09-28) — content & media pipeline

| ADR | Amendment | Evidence |
|---|---|---|
| 008 | **Approved portrait in the CMS (optional).** `pnpm cms:import-portrait` imports `portrait.jpg` byte-for-byte after verifying its SHA-256 (`1c00fa07…3fca`), with EN/AR alt text and a focal point (55 %, 38 %) so the 512 × 512 `square` crop keeps the face and removes the third party's hand. It is idempotent and never assigns the Profile portrait (the owner chooses in the dashboard). The repository copy remains the default and the Phase 3 scene is unchanged (it does not read the CMS portrait). No AI upscaling or enhancement; derivatives are conventional sharp resampling and never enlarged (`full` stays 538 px). | `tests/cms/media.test.ts`; hash re-verified |
| 008 / 009 | **Formats as built: WebP only** (`thumbnail` 480, `card` 960, `large` 1600, `full` 2560, `square` 512 × 512), metadata stripped (sharp default). AVIF and a JPEG fallback from ADR-008 are **not** produced: every supported browser decodes WebP, and AVIF encoding is several times slower per upload. Revisit if image weight becomes a measured problem. | `src/cms/media-policy.ts` |
| 009 | **The original upload is private.** An `upload.handlers` guard returns 404 to anyone who is not a signed-in admin requesting the original filename; derivatives are public. The public content layer (`publicImage`) only ever emits derivative URLs, prefers `full → large → card → thumbnail`, and omits archived images and meaningful images without alt text **in that locale** (no cross-locale alt fallback). | e2e `media.cms.spec.ts`; unit + CMS tests |
| 009 | **Upload limits added:** ≤ 12,000 px per side and ≤ 60 MP (decompression-bomb protection, checked from the header before processing). **PDFs with active content are refused** (`/JavaScript`, `/JS`, `/Launch`, `/EmbeddedFile`, `/RichMedia`, `/SubmitForm`, exact-name tokens). This is a static best-effort check, not malware scanning (R-51). | tests |
| 009 | **Serving headers:** images `nosniff` + `Cache-Control: public, max-age=31536000, immutable` (filenames are unique per upload, so a replaced image gets a new URL); PDFs `Content-Disposition: inline`, `nosniff`, `max-age=86400`; both keep `X-Robots-Tag: noindex`. | e2e |
| 009 | **Optimization status** is computed on read (virtual fields, no DB column): *Ready* when every derivative is recorded and its file exists, *Failed* with the missing sizes otherwise, *Not applicable* for non-images. Processing is synchronous inside the upload request, so *pending/processing* are never observable and are not modelled. The dashboard warns per locale when a cover/gallery image is failed or lacks alt text. | CMS + e2e tests |
| 004 | Migration `20260928_073607_phase6_image_derivatives` adds the `full` and `square` size columns (reversible). | `payload_migrations` |

---

## Phase 7 amendments (2026-09-28) — bilingual, SEO & accessibility

| ADR | Amendment | Evidence |
|---|---|---|
| 006 | **Page-aware language switcher (closes R-47).** The server computes, per offered locale, the pages that exist there (home, live content routes — every content route outside production — published projects of that locale, the design preview where enabled; `src/lib/i18n/switch-paths.ts`). The client switcher links to the same page if it exists, else its nearest existing parent (`/projects/x` → `/projects`), else home (`src/lib/i18n/switch-target.ts`). Links are the final canonical URL (`/about`, `/ar/about`) — not next-intl's `<Link locale>`, which forces `/en/…` (a 308 hop for a locale cookie this site disables) — and are not prefetched. | unit + e2e `seo.cms.spec.ts` |
| 006 | **Arabic publication gate kept; review workflow formalised.** `src/config/copy-review.ts` lists what the reviewer checks; an "approved" review now also requires a named `reviewer` and a `reviewedOn` date (`isCopyReviewComplete`), otherwise Arabic stays unpublishable. No Arabic copy was added or approved by the agent. | unit |
| 006 | Numerals: Western Arabic digits (0–9) in both locales are **kept** (technical content, dates, versions); the Arabic reviewer may request Arabic-Indic digits as part of the copy review. | — |
| 011 | **hreflang only inside the publishable cluster:** a noindex page or a page of an unpublishable locale emits no `hreflang` and no `og:locale:alternate` (they could never be reciprocal). Found by the new SEO audit on gated Arabic pages. | `seo-audit.mjs`, e2e |
| 011 | **Default share images:** one 1200 × 630 PNG per locale (`src/assets/share/`), rendered by `pnpm seo:share-images` in Chrome with the self-hosted fonts — Arabic is shaped correctly, which `next/og`/satori does not do — from the confirmed identity and the approved portrait (read-only, SHA-verified, Phase 3 crop, ≤ 1:1). Served build-hashed from `/_next/static/media` (no `public/` directory, no Dockerfile change). Precedence: page image (project cover) → "SEO & sharing" image (derivative with alt in that locale) → built-in image of the locale. Every page: `summary_large_image`. The `next/og` per-request approach is not used. | e2e, unit, production audit |
| 011 / 003 | **Site Settings becomes "SEO & sharing" (closes R-48).** Visible in the dashboard (group Site). Holds the site-level defaults ADR-011 assigned to it: the home page SEO title/description (localized, used only where the global's Translation status is Approved; empty = code defaults from the confirmed identity; the description also feeds `WebSite.description`) and the default share image. The unused `featuredProjects` list is removed (migration `20260928_105901_phase7_site_settings_seo`, reversible; its tables were verified empty). Featured work remains the project "Featured" flag. | e2e, migration |
| 011 | **Repeatable SEO audit** (`pnpm seo:audit`, `tests/deployment/seo-audit.mjs`, SEO_MASTER §38): robots, sitemap, and a no-JavaScript crawl checking titles/descriptions (present, unique), one H1, self-canonical on the canonical origin, lang/dir, alt, reciprocal hreflang, JSON-LD validity/placeholders, og:image reachability, internal links, sitemap ↔ indexability. Run in production mode for Phase 7 (0 errors); to be re-run against the deployed site in Phase 10. | Phase 7 report §15 |

---

## Real-content migration amendments (2026-09-28) — legacy website → CMS

| ADR | Amendment | Evidence |
|---|---|---|
| 003 | **Legacy content enters the CMS through an idempotent import, never through components.** `src/cms/legacy/legacy-content.ts` is the migration record (legacy text, source page, every normalisation); `pnpm cms:import-legacy` upserts it by natural key (skill name, degree, certificate name + issuer, project slug, image SHA-256); `pnpm cms:verify-legacy` is the read-only completeness check. After import the CMS is the only runtime source; edits happen in the dashboard. | REAL_CONTENT_MIGRATION_REPORT |
| 009 | **Legacy images go through the Phase 6 pipeline** (downloaded from the legacy site, refused unless their SHA-256 matches the reviewed file, private original + WebP derivatives, descriptive alt). Only genuine screenshots of the owner's software are migrated; AI-generated renders, third-party UI-kit/Dribbble designs, stock-photo device mockups, logos and images containing personal data are not. | report §Media |
| 003 | **Education `datePrecision`** (`month` default / `year`): when a source gives years only, the month is never displayed (`formatPeriod(…, 'year')` → "2021 – 2025"). Additive, reversible migration `20260928_115541_education_date_precision`. | unit + visual |
| 015 | **Orientation-aware media fitting:** portrait images (phone screenshots) are contained, not cropped, in fixed-ratio frames (project cover, project cards), and portrait gallery images are height-capped and centred (`src/lib/image-fit.ts`). Landscape rendering is unchanged. | visual QA |
| 015 | **E2E isolation:** Playwright now resets and uses `<database>_e2e` and a temp media directory (`tests/e2e/prepare-e2e.mjs` → `src/cms/scripts/e2e-reset.ts`: empty schema → migrations → confirmed identity + admin → production build → start). The development database holds the real content and is never touched by tests. Server reuse is opt-in (`E2E_REUSE_SERVER=1`). The `_e2e` database was created once in the portfolio container (as `_test` was in Phase 2). | 164/164 ×2 |
| 011 | `buildPageMetadata` returns no metadata for an unknown `[locale]` segment (the layout renders the 404). This fixes a server error from Phase 7 (`defaultShareImage` for an invalid locale). | e2e server logs: 0 errors |


**Owner decisions layer (2026-09-28):**

| ADR | Amendment | Evidence |
|---|---|---|
| 003 | **Two migration layers, kept apart.** Legacy-site data (`src/cms/legacy/legacy-content.ts`, `pnpm cms:import-legacy`) is now **create-only**: existing records are never overwritten, so owner decisions and later dashboard edits survive a re-run. Owner-confirmed decisions (`src/cms/owner/owner-content.ts`, `pnpm cms:apply-owner`) are applied on top and win: email, social links, experience, education correction, certificate and web-CV publication. Source notes state which layer a value came from. | snapshot diff: 16 projects, links, relations and biography byte-identical |
| 003 | **Experience start date is optional.** When the owner states no dates, none are stored or shown (the period column stays empty). No database change was needed: the column was already nullable. | e2e, visual |
| 003 / 011 | **Web CV:** the CV global gains “Publish the web CV” (per locale). `/cv` is live when a PDF is visible **or** the web CV is published; the download link appears only when a PDF exists. The page is composed from existing CMS entities: summary, experience, education, skills, certificates and contact. | audit: `/cv` indexable; 0 download links |
| 003 | **Instagram** is a named social network (`instagram`). Additive enum value. `Person.sameAs` lists every published profile. `Person.email` is not emitted: not part of the SEO architecture (SEO_MASTER §22). | JSON-LD check |
| 003 | Certificates may be published without a file (owner decision). The dashboard help text was updated; there is no schema change. | 28 public |
| 004 | Migration `20260928_125526_owner_content_decisions` (additive, reversible): the `instagram` enum value and `cv_locales.web_cv`. | `payload_migrations` |

## Phase 8 amendments (2026-09-28) — performance & 3D hardening

Only changes with measured evidence (interleaved ABBA runs on real hardware) were kept; the scene's art, narrative, camera, lighting and materials are unchanged (cinematic regression vs the Phase 3 frames: acts ≤ 0.43 mean abs diff, 0 pixels > 40).

| ADR | Amendment | Evidence |
|---|---|---|
| 007 | **The scene renders on demand** (`frameloop="demand"`). Every frame is a pure function of scroll progress (no wall-clock animation), so a frame is requested only when the progress changes (`progress.onChange` → `invalidate`), while the damping settles, on resize and when the portrait texture arrives. The settling frame lands exactly on the target (the resting image equals the converged image of continuous rendering). After an idle gap the damping uses the typical frame interval, and adaptive DPR counts only consecutive frames. | Idle at rest: 161–165 frames/s → 0; main thread 17–22 % → ~0 %; GPU process 33–48 % → ~0 % (iGPU and dGPU) |
| 007 | **Scene programs compile before the first frame** (`renderer.compileAsync`, `KHR_parallel_shader_compile`), after the synchronous PMREM environment build. Rendering starts only when the compile resolves (`frameloop` stays `never` until then). This removes the mid-scroll stalls when hidden parts first become visible. The `performance.mark('cinematic:*')` marks are kept for QA. | Slow scroll: max frame 515–552 ms → 30 ms; p99 12.2 → 6.2 ms |
| 015 | **The header's scroll-driven solidify animates only opacity** of a `::before` layer that carries the blur and tint, plus the border colour. Animating the backdrop blur filter itself kept Chrome repainting every frame after the range ended. The end states are identical. During the first 6rem of scroll the intermediate look is a crossfade of the full blur instead of a growing blur radius. | ~330 paints/s at rest → 0; top-of-page and scrolled captures pixel-identical |
| 007 | **Rejected (no evidence of benefit):** a parallel PMREM warm-up (it helped only with a warm GPU program cache; cold, ANGLE finalises the program at draw time); a direct `aria-expanded` update in the mobile menu. **Deferred:** the Arabic font preload (R-31, until Arabic is published); AVIF derivatives (not evaluated, so WebP is kept). | PHASE_8_REPORT |

## Phase 9 amendments (2026-09-28) — production readiness

Every change below was verified on a production build and in a local Docker dry run (Linux container behind nginx TLS). No design, scene, content, routing or i18n change.

| ADR | Amendment | Evidence |
|---|---|---|
| 004 / 011 | **Data-cache keys are scoped to the data source (R-60).** Every repository key carries a hash of the database location (host, port, name — never credentials), `SITE_URL` and `SITE_ENV` (`src/content/cache-scope.ts`). An entry written against another database can never be read. | Adversarial test: E2E cache entries copied into the production cache → every content route still 200 |
| 015 | **The e2e build has its own build directory** `.next/e2e` (`NEXT_DIST_DIR`, set only by `playwright.config.ts`; `prepare-e2e.mjs` refuses to build elsewhere). Production builds in `.next` never see e2e pages or cache. `next.config.ts` accepts only `.next` or `.next/<name>`. | E2E → prod build and prod build → E2E → prod build: 22/22 content routes 200, `/ar` 404 |
| 015 | **Tailwind scans `src/` only** (`@import 'tailwindcss' source('../')`, R-61). Documentation can no longer add CSS. | Public CSS 45,414 → 45,186 B (7 unused utilities gone); a planted docs probe produced no CSS |
| 004 / 005 | **Bounded staleness (R-45, option c).** Pages (`[locale]/layout.tsx`), the sitemap and repository data revalidate after 1,800 s in addition to on-demand tag revalidation. A tag invalidation lost in a restart can keep content stale for at most ~1 h instead of indefinitely. A durable cache handler (option a) remains possible. | `Cache-Control: s-maxage=1800`; publish-without-rebuild E2E and deployment checks pass |
| 010 / 016 | **Security headers from the app** (`src/lib/security-headers.ts`): CSP (`default-src 'self'`, no third-party origin, no eval, `frame-ancestors 'none'`, `object-src 'none'`; `script-src`/`style-src` need `'unsafe-inline'` — static pages carry Next's inline RSC payload, nonces would make every page dynamic), X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, COOP. HSTS is set by the TLS proxy. Payload's gravatar avatar is off (`admin.avatar: 'default'`: it sent a hash of the admin email to a third party). | 0 CSP violations on 11 routes × 3 modes with the WebGL scene and on the signed-in admin (TLS dry run) |
| 012 | **Production topology as code:** `deploy/docker-compose.prod.yml` (own project, private network, postgres + app, loopback-only ports, healthchecks, restart, memory limits, log rotation, `cap_drop: ALL` for the app), `deploy/nginx/yazanalsamman.com.conf` (TLS, HSTS, HTTP→HTTPS, www→apex, rate limits on auth, API and project paths), `deploy/deploy.sh` (DB up → build → tag → start → health; `rollback`), `deploy/backup.sh` / `restore.sh`, `docs/deployment/RUNBOOK.md`. Runtime stays `node server.js` (standalone). | Dry run: 15/15 deployment checks, restore rehearsal, second deploy + rollback |
| 012 | **Every image build regenerates the pages** (`--no-cache-filter build`): BuildKit cannot see the database, so a cached build layer would ship old or 404 pages after content changes. `portrait.jpg` is no longer excluded from the Docker context (the pages import it since Phase 3; the image build was broken). | Second deploy re-ran the build step (106 s); image builds again |
| 012 | **Health endpoint** `GET /api/internal/health` (app + database, `ok`/`unavailable` only), used by the container healthcheck; nginx allows it from localhost only. | healthy in the dry run; 403 through the proxy |
| 007 | **R-59 not changed.** Measured (cold/warm, iGPU/dGPU): smaller prefilter and no pre-blur change the reflections and save ≤ 60 ms; deferring moves the same task; a prebaked environment removes it pixel-identically but costs ~750 KB (brotli) per first 3D visit. Owner decision. | Phase 9 report §5 |

---

## Target source layout (for Phase 1+)

```text
src/
  app/
    (site)/[locale]/...        public routes (en default, ar prefixed)
    (payload)/admin/...        Payload admin (generated)
    api/...                    Payload REST/GraphQL (+ revalidate hook)
    sitemap.ts  robots.ts
  content/                     repository/service layer (only place that queries Payload)
  collections/                 Payload collection configs
  scene/                       3D island — no CMS/i18n imports (lint-enforced boundary)
  components/  styles/  i18n/  lib/seo/  lib/env.ts
messages/en.json  messages/ar.json
tests/unit  tests/e2e
```
