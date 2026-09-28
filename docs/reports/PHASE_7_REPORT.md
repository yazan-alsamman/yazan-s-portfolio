# Phase 7 Report — Bilingual, SEO & Accessibility

**Date:** 2026-09-28 · **Branch:** `main` (HEAD `af32158`, nothing committed) · **Author:** Claude (agent)

Status labels: **Implemented** · **Verified** (automated test or recorded evidence) · **Deferred** (to a named phase) · **Owner action** · **N/A**.

---

## 1. Objective

Make the bilingual public site technically complete for production SEO and localization, without changing the approved design (Phases 3–6 frozen):

- SEO defaults and share metadata;
- canonical URLs and hreflang;
- page-aware language switching;
- the Arabic publication gate;
- sitemap and robots;
- structured data;
- the Site Settings issue (R-48);
- an accessibility audit.

## 2. Authoritative sources

Read and reconciled before implementation:

- **Roadmap and prompt:**
  - `docs/ROADMAP.md` §Phase 7: Arabic, RTL, localized metadata, structured data, sitemap, robots, accessibility audit.
  - `prompts/07_BILINGUAL_SEO_ACCESSIBILITY.md`: translations, RTL, localized metadata, canonical, sitemap, robots, hreflang, Open Graph, structured data, semantic HTML, a11y audit, keyboard, reduced motion, contrast, alt text; "never add unsupported claims"; report with route-by-locale coverage, SEO validation, a11y findings and unresolved issues.
- **SEO documents:**
  - `docs/SEO_PHASE_GATE.md` Phase 7 (International SEO): EN, AR, `lang`, `dir`, canonical, hreflang, localized title/description/OG, sitemap locale strategy.
  - `docs/SEO_MASTER_REQUIREMENTS.md`: §19–23 (international and Arabic SEO, Person/WebSite), §34 (error pages), §35 (social SEO, default social image), §36 (Search Console readiness), §38 (SEO testing).
  - `docs/SEO_AND_DISCOVERABILITY.md` ("Social Preview: a professional default share image using the brand identity and portrait if appropriate").
  - `docs/I18N_AND_LOCALIZATION.md`: no unreviewed machine Arabic for professional copy.
- **Architecture:**
  - ADR-006 and ADR-011 (with their Phase 4 amendment: "the site-wide default share image remains Phase 7"; "site-level defaults in SiteSettings"; "verify Arabic shaping in Phase 7").
  - RISK_REGISTER: R-47 and R-48 (Phase 7), R-31 (Phase 7/8).
- **Other:**
  - DASHBOARD_SPEC ("Site Settings: SEO defaults").
  - Reports for Phases 4, 5 and 6 (Phase 7 items: page-aware switcher, default share image, SEO defaults / Site Settings decision, Arabic copy review).
  - `docs/content/OWNER_PROFILE.md` (confirmed identity; D-9 Arabic reviewer pending).

## 3. Starting state

Already in place from Phases 1 and 4 (and verified again here):

- **URL scheme:** English at `/` and Arabic at `/ar`.
- **Document level:** `lang`/`dir` set per locale.
- **Canonicals:** self-referencing, from `SITE_URL`.
- **hreflang:** only for locales where the same page exists (plus `x-default`).
- **Sitemap:** published, publishable content only.
- **Robots:** environment-gated.
- **Structured data:** Person/WebSite from confirmed CMS fields; BreadcrumbList and CreativeWork on projects.
- **Arabic copy-review gate:** Arabic 404s in production while the review is pending.
- **Accessibility:** axe tests on the shell.

Gaps at the start of Phase 7:

1. **R-47:** the language switcher linked to the same path in the other language even when that page did not exist there (localized 404).
2. **Share image:** there was no default; pages without a cover had no `og:image` (`summary` card).
3. **R-48:** "Site Settings" was hidden and unused (dead featured list and SEO defaults).
4. **hreflang on gated Arabic:** Arabic pages (gated) emitted hreflang to English pages that never reciprocate (found by the new audit, §11).
5. **Copy review:** "approved" in the copy-review config did not require a named reviewer or a date.
6. **Audit tooling:** there was no repeatable SEO crawler (SEO_MASTER §38).
7. **Switcher URLs:** links to English used `/en/…` (a 308 hop).

## 4. Phase 7 requirements

| # | Requirement (source) | Status |
|---|---|---|
| 1 | Arabic / RTL (roadmap, prompt) | Verified: `lang="ar" dir="rtl"`, RTL layout, Arabic shaping (§16). Arabic **publication** = Owner action (D-9, §10) |
| 2 | Complete all translations (prompt) | UI catalogs complete and at parity (unit test: same keys, no placeholders, no silent English). Arabic **content** = Owner action (R-46); Arabic **copy approval** = Owner action (D-9) |
| 3 | Localized metadata: title, description, OG locale (SEO_PHASE_GATE) | Verified (e2e: `og:locale` en_US/ar_AR, Arabic title and alt) |
| 4 | Canonical URLs | Verified (e2e; production audit: self-canonical HTTPS on the canonical origin, 9/9 pages) |
| 5 | hreflang / x-default where appropriate | Implemented and verified: publishable cluster only, page-aware, reciprocal (audit) |
| 6 | Sitemap and locale strategy | Verified (unit, e2e, production audit) |
| 7 | robots.txt | Verified (unit production/preview; production run) |
| 8 | Open Graph / Twitter, default social image (SEO_MASTER §35) | Implemented and verified (§7) |
| 9 | Structured data, no unsupported claims | Verified (unit; audit JSON-LD validity and placeholder scan) |
| 10 | Page-aware language switcher (R-47) | Implemented and verified (§9) |
| 11 | SEO defaults / Site Settings decision (R-48, ADR-011) | Implemented and verified (§13) |
| 12 | Semantic HTML, keyboard, reduced motion, contrast, alt text, accessibility audit | Verified (§16; public axe 0 violations; existing keyboard/reduced-motion e2e) |
| 13 | Repeatable SEO testing (SEO_MASTER §38) | Implemented and verified (`pnpm seo:audit`) |
| 14 | Search Console readiness (SEO_MASTER §36) | Documented (§11); verification = Phase 10 (deployment) |
| 15 | Useful 500 page (SEO_MASTER §34) | Deferred → Phase 9 (§19) |
| 16 | Arabic font preload (R-31) | Deferred → Phase 8 (§19) |

## 5. Architecture decisions

All are recorded in `ARCHITECTURE_DECISIONS.md` → "Phase 7 amendments".

- **Page-aware switcher:** the server lists the pages that exist in each offered locale, and a pure resolver picks the same page, then its parent, then home. Links are final canonical URLs (no `/en` hop) and are not prefetched.
- **Arabic gate:** kept. Approval now requires a named reviewer and a date. Numerals stay Western digits (the reviewer may change this).
- **hreflang only inside the publishable cluster:** noindex or gated pages declare no alternates.
- **Share images:** static, build-hashed PNGs per locale, rendered in Chrome (not `next/og`, because of Arabic shaping). Precedence: page image → Site Settings image → built-in image.
- **Site Settings → "SEO & sharing":** home SEO defaults and the default share image. The dead featured-projects list was removed with a reviewed migration.
- **SEO audit:** a repeatable, no-JavaScript crawler, re-runnable against the deployed site (Phase 10).

## 6. SEO implementation

Metadata layers (one entry point: `buildPageMetadata`):

1. **Global/default:**
   - layout title template "`<page> — <name>`";
   - `metadataBase = SITE_URL`;
   - robots by environment and locale publishability;
   - default share image.
2. **Page-specific:**
   - route titles and descriptions from the reviewed message catalogs, built from the confirmed identity;
   - `noindex` when a route has no content (development only; production 404s).
3. **CMS-authored:**
   - project `seo.title`/`seo.description`/cover (Phase 4);
   - "SEO & sharing" home title/description/share image (Phase 7).
4. **Locale-specific:**
   - every value is resolved per locale with no cross-locale fallback;
   - `og:locale` is `en_US`/`ar_AR`;
   - Arabic values apply only when that locale is approved.

- **CMS precedence:** the home page uses the owner's "SEO & sharing" text only in locales where the global is Approved; otherwise the code default applies. The H1 is page content and is not affected.
- **Twitter/X:** `summary_large_image` on every page, with the image and alt.
- **Duplication:** nothing is duplicated. Defaults come from the confirmed identity (CMS Profile) and the reviewed catalog.

## 7. Share-image implementation

- **Assets:** `src/assets/share/share-en.png` and `share-ar.png`, 1200 × 630 PNG, 350 KB and 325 KB, no EXIF.
- **Generation:** `pnpm seo:share-images` (`scripts/generate-share-images.mjs`), rendered in Chrome.
- **Inputs, with nothing invented:**
  - the confirmed identity (`confirmedIdentity`: "Yazan Al Samman / Artificial Intelligence Engineer", "يزن السمان / مهندس ذكاء صنعي");
  - the domain `yazanalsamman.com`;
  - brand tokens and the self-hosted fonts;
  - `portrait.jpg`, whose SHA-256 is verified before rendering (the script refuses to run if it changed).
- **Portrait handling:**
  - the approved Phase 3 crop is used (the third party's hand is removed);
  - it is shown at ≤ 1:1 (0.97), never enlarged;
  - no colour grade and no mirroring (the Arabic layout moves the portrait to the left without flipping the face).
- **Arabic:** the Arabic image is shaped correctly (visually checked). This is why Chrome was used rather than `next/og`/satori.
- **Serving:** build-hashed from `/_next/static/media/…` with immutable caching. It uses no CMS or private file and needs no `public/` directory or Dockerfile change.
- **Precedence:**
  1. the page's own image (project cover: a public derivative);
  2. otherwise the "SEO & sharing" image (the `large` derivative, only with alt text in that locale);
  3. otherwise the built-in image of the locale.
- **Alt:** "`<name> — <title>`" in the page language.

**Verification:**
- e2e: EN/AR/project pages report the right image, 1200 × 630, alt, `summary_large_image`; the image returns 200 `image/png`.
- The override is used only where approved and with alt; the image is a derivative, never the original.
- The production run showed an absolute `https://yazanalsamman.com/_next/static/media/share-en.…png`.

## 8. Canonical/hreflang implementation

- **Canonical:** `SITE_URL` + localized path, lowercase, no trailing slash, no query. Production: `https://yazanalsamman.com/...`, with no localhost URLs (production audit).
- **hreflang:**
  - `en`/`ar` only for locales where the same page exists and the locale is publishable;
  - `x-default` points to English;
  - pages that are noindex or in an unpublishable locale emit **no** alternates (new in Phase 7).
- **Today (Arabic gated):** English pages emit `en` + `x-default` (self). Arabic pages are 404 in production (noindex in development) and emit none.
- **After the Arabic review:** alternates pair only pages existing in both languages. An English-only project never advertises an Arabic twin (unit and sitemap tests).

## 9. Page-aware language switching

**Resolution rule:** the same page if it exists in the target locale, else its nearest existing parent, else home. "Exists" means exactly what the target locale would serve instead of a 404:
- home;
- live content routes (outside production, every content route, since they render there);
- published projects of that locale;
- the design preview where enabled.

The visual design, markup and classes are unchanged. `lang`/`hrefLang` attributes and `aria-current` are kept.

| Case | Result | Evidence |
|---|---|---|
| EN static → AR static, AR → EN | `/about` ↔ `/ar/about` | unit + e2e |
| EN project ↔ AR project | `/projects/x` ↔ `/ar/projects/x` (slug preserved), click navigates, Arabic H1 | e2e |
| Project missing in Arabic | → `/ar/projects` (the Arabic URL is 404; the target is 200) | e2e |
| Unpublished / gated content | parent or home, never the missing page | unit |
| Gated Arabic locale (production) | switcher not rendered (only publishable locales are offered) | production run: no `hreflang="ar"` links |
| Unknown route (404 page) | → the existing section or home | unit + e2e |
| Home | `/` ↔ `/ar` | e2e |
| Header, mobile menu and footer switchers agree | the same href in all three | e2e + visual QA |

**Implementation notes:**
- **Final URLs:** links are the final canonical URLs. next-intl's `<Link locale>` produced `/en/about`, a 308 hop meant for a locale cookie this site disables.
- **No prefetch:** switcher links are not prefetched (R-54).

## 10. Arabic publication gate

- **Status: kept, pending.** `copyReview.ar = pending` (D-9: no owner-appointed reviewer yet). In production, `/ar/*` is 404 and absent from hreflang, sitemap and switcher (verified in the production run).
- **Workflow formalized** in `src/config/copy-review.ts`. The reviewer checks:
  - `messages/ar.json`;
  - the Arabic descriptions;
  - the Arabic share image;
  - RTL rendering on desktop and mobile.

  Approval now **requires** `reviewer` and `reviewedOn` (YYYY-MM-DD). An "approved" without them is ignored (`isCopyReviewComplete`, unit-tested). CMS content keeps its per-document Translation status.
- **No fabrication:** no Arabic copy was written, translated or approved by the agent in this phase. The Arabic QA text in §16 was temporary labelled fixtures, since deleted.
- **When the owner approves:** set the record and deploy. Arabic then goes live automatically (routes, hreflang, sitemap, switcher, indexing).

## 11. Sitemap/robots

- **Sitemap:**
  - canonical HTTPS URLs of live routes and published projects;
  - publishable locales only;
  - per-URL alternates for pages existing in several languages;
  - `lastmod` for projects;
  - no admin/API/design-system/draft/empty routes.
- **Robots:**
  - production: `Allow: /`, `Disallow: /admin, /api, /design-system, /ar/design-system`, `Host`, and `Sitemap: https://yazanalsamman.com/sitemap.xml`;
  - every non-production deployment: `Disallow: /`.
  - `/admin` also sends `X-Robots-Tag: noindex, nofollow`.
  - Private media originals are 404 publicly (Phase 6); files are `noindex`.

**Production-mode verification:**
- Build and serve with `SITE_ENV=production` and `SITE_URL=https://yazanalsamman.com`.
- Labelled fixtures:
  - a project in EN + AR with a cover;
  - an English-only project;
  - a skill, an experience entry and a certificate;
  - a profile biography.
- Run `pnpm seo:audit` → **0 errors**, 9 pages crawled, 9 sitemap URLs.

**Route-by-locale coverage** (production mode, with fixtures):

| Route | EN | AR (gated) |
|---|---|---|
| `/` | 200, index, in sitemap, hreflang en + x-default | 404 |
| `/projects`, `/projects/qa-audit-shared` | 200, index, sitemap | 404 |
| `/projects/qa-audit-english` (EN-only) | 200, index, sitemap, no `ar` alternate | 404 |
| `/about`, `/experience`, `/skills`, `/certificates`, `/contact` | 200, index, sitemap | 404 |
| `/cv` (no CV file in the fixtures) | not live: absent from the sitemap, navigation and crawl (route gate → 404 in production, Phase 4 behaviour) | 404 |
| `/projects/nope` | 404, `noindex` | 404 |
| `/admin` | 200, `X-Robots-Tag: noindex, nofollow`, disallowed | — |

In development/preview, all Arabic routes render (for review) with `noindex`, and robots disallows everything.

**404 robots tags:** 404 responses carry two robots tags ("noindex", added automatically by Next for 404s, and ours, "noindex, follow"). Both say noindex, so this is harmless framework behaviour.

**Search Console readiness (SEO_MASTER §36):**
- Canonical domain `https://yazanalsamman.com`.
- Sitemap `https://yazanalsamman.com/sitemap.xml`.
- Verification: a DNS TXT record (domain property) at deployment.
- International strategy: `/` EN and `/ar` AR, with hreflang once Arabic is approved.
- Indexing expectation: EN pages with published content only.
- Indexing is **not** claimed; external verification is Phase 10.

## 12. Structured data

- **Home:**
  - `Person`: name = English entity name; `jobTitle` = the locale's approved title; `sameAs` = owner-entered profiles only.
  - `WebSite`: name, url, `inLanguage`, publisher, and **new** `description` = the home description in effect (reviewed catalog text or the owner's approved "SEO & sharing" description).
- **Projects:** `BreadcrumbList` + `CreativeWork` (author = Person) are unchanged.
- **Not emitted:** `alternateName`, `image`, `worksFor`, `alumniOf`, `address`, awards and `potentialAction` (unit test).
- **Audit:** the JSON-LD on every crawled page parses and contains no placeholder or example values.

## 13. Site Settings / R-48

**Decision** (per ADR-011 and DASHBOARD_SPEC): re-activate the global as the owner of the site-level SEO defaults, and **remove** the dead part.

- **Dashboard:** the global is now visible as **"SEO & sharing"** (group Site), with help text. Fields:
  - home SEO title (10–70 characters) and description (50–170), localized, used only where Translation status = Approved;
  - default share image (upload, optional);
  - translation status.
- **Removed:** `featuredProjects`, which the public site never read (featured work = the project "Featured" flag). Migration `20260928_105901_phase7_site_settings_seo`:
  - drops `site_settings_rels` and `_site_settings_v_rels` (both verified to contain 0 rows beforehand);
  - adds `share_image_id` + FK + indexes;
  - reversible `down`;
  - applied to the dev DB by the build (`payload_migrations`: initial, phase6, phase7).
- **Public read path:** repository → `fetchSiteSettings` → Zod contract. Text only when approved; image only as a derivative with alt in that locale. Cached with the `site-settings` + `media` tags, which CMS publishes already revalidate.
- **Verified:** e2e override (title, description, image, WebSite description) in EN only; Arabic falls back to its defaults; the admin screen is visible and the field is removed.
- **Result:** R-48 is **closed**.

## 14. Security

- **Crawling:** no admin, API, draft or private-media routes are crawlable. Robots and `X-Robots-Tag` were verified, and share-image candidates are derivatives only.
- **Metadata:** metadata and JSON-LD carry only confirmed or owner-entered facts; there are no secrets in the HTML (the audit crawled every public page).
- **Credentials:** `.env` was not printed or modified, 21st.dev was not used, and no credentials were accessed.
- **Docker:** only `yazan-portfolio-postgres` was used (migrations and read-only checks). No other container, volume or prune.
- **Public endpoints:** no new public endpoints. Share images are static build assets.

## 15. Tests

| Suite | Result |
|---|---|
| `pnpm typecheck`, `pnpm lint`, `pnpm format:check` | clean |
| Unit (`pnpm test`) | **73 passed** (57 baseline + 7 `language-switch.test.ts` + 9 `seo-phase7.test.ts`) |
| CMS integration (`pnpm test:cms`) | **49 passed** |
| Production build | success |
| E2E, run 1 | **164 passed, 33 skipped, 0 failed** (155 baseline + 9 `seo.cms.spec.ts`) |
| E2E, run 2 | **164 passed, 33 skipped, 0 failed** |
| SEO audit, production mode (`pnpm seo:audit`) | **0 errors** (9 pages) |
| Public axe (WCAG 2.0/2.1/2.2 A+AA) | **0 violations**: 27 EN runs (production mode) + 18 AR runs (preview mode) |

**New coverage:**
- **Metadata:** title, description, canonical, OG (url/type/locale/title), share image (URL, size, alt, reachability), Twitter card.
- **Localization:** all nine switcher cases (§9); gated Arabic has no alternates.
- **Indexing:** production vs preview robots; gated Arabic is 404 and absent; noindex on gated and 404 pages.
- **Sitemap:** publishable-only, page-aware alternates, HTTPS canonical origin, no private URLs.
- **Structured data:** no invented properties; description only when given.
- **Copy-review gate.**
- **Share-image assets:** dimensions, size and EXIF, plus a portrait hash check.
- **Admin screen:** no new accessibility violation types.

The 33 skips are the existing project-scoped skips. No test was weakened or removed.

**Findings fixed during the phase:**
1. **Unreciprocated hreflang:** gated Arabic pages emitted hreflang (found by the audit). Fixed and covered by e2e.
2. **Redirect hop:** the switcher linked to `/en/…`. Fixed.
3. **New failing request:** the switcher prefetch returned 404 when crossing locales. Prefetch was turned off for the switcher.

**My own test corrected:** my first version of the new `og:title` assertion omitted the site-name template. It was corrected to match the product behaviour.

**A11y test scope:** the new admin-screen test was scoped to "no new violation types beyond stock Payload", because Payload's stock edit screens have their own findings (R-53).

## 16. Visual QA

**Public site** (preview-mode build with labelled fixtures):
- **Coverage:** 1440 dark, 1440 light and 390 dark; English and Arabic; project detail, an English-only project, About, the 404 page, and the mobile menu open (EN and AR).
- **Layout:** overflow was 0 everywhere, and `lang`/`dir` were correct.
- **Switchers:** header, mobile menu and footer targets agree on every page.
- **Keyboard:** the switcher is reachable by Tab, with a visible 2 px focus outline in both themes.
- **Design:** header, footer, switcher and mobile menu visuals are unchanged (only link targets changed). Arabic RTL renders correctly.
- **Evidence:** `scratchpad/p7/shots` (22 captures + `visual.log`).

**Share images:** EN and AR were inspected. The name and title are correct, the Arabic is shaped correctly, the face is intact and the hand is excluded.

**Cinematic landing (Phase 3 freeze):**
- Method: the Phase 6 regression method, 19 approved frames × 2 runs.
- The largest mean pixel difference from the approved frames is **0.35** (03 intelligence), within the previously measured run-to-run noise (0.45).
- The portrait close-up differs by at most 0.09. There were no console errors.
- **Result:** unchanged.

**Dashboard:** "SEO & sharing" was captured by the e2e (screen present, fields). The Phase 5/6 screens are otherwise unchanged (the admin e2e suites pass).

**Result:** pass. No regressions.

## 17. Performance

Critical-path JS (browser `transferSize` of the scripts referenced by the server HTML, same method as Phases 4–6):

| Route | Phase 6 | Phase 7 |
|---|---|---|
| `/`, `/ar` | 167,256 B | 167,407 B |
| `/projects` | 166,763 B | 166,914 B |
| `/about`, `/experience`, `/certificates`, `/cv` | 165,509 B | 165,660 B |
| `/skills`, `/contact` | 159,598 B | 159,749 B |

- The increase is **+151 B** (the switcher's resolver). Every route is ≤ 170 KB.
- No CMS or server code appears in public chunks. The scanned markers now also include `getSiteSettings`, `fetchSiteSettings` and `existingPathsByLocale`, and none were found.
- All SEO logic is server-side. There is no client-side SEO code.
- Share images are static assets requested only by social crawlers.

## 18. Risks

- **Closed:**
  - **R-47:** the page-aware switcher.
  - **R-48:** "SEO & sharing".
- **New:**
  - **R-53** (LOW, open): Payload's stock admin screens have axe findings (description contrast, react-select, the unnamed popup button); third-party UI, single editor. Phase 9/10.
  - **R-54** (LOW, open): after a client-side cross-locale switch, App Router prefetches of unprefixed English routes answer 404. Navigation works; this is pre-existing and the switcher no longer prefetches. Phase 8.
- **Carried:**
  - **R-45** (HIGH): cache invalidations are in memory; Phase 9.
  - **R-46** (HIGH): no real content; owner.
  - **R-44** (MEDIUM): the Arabic cinematic copy is unreviewed; owner (D-9).
  - **R-52** (MEDIUM), **R-35** (MEDIUM), **R-39** (LOW), **R-51** (LOW).
  - **R-31** (LOW): Arabic font preload; Phase 8.
  - **R-49, R-50** (accepted).

## 19. Deferred work

| Item | Phase / owner |
|---|---|
| Arabic copy review and approval (D-9); Arabic publication | Owner action (a reviewer must be appointed) |
| Real portfolio content, including Arabic content and the owner's own share image if desired | Owner (R-46) |
| Useful 500 error page (SEO_MASTER §34). An `error.tsx` boundary is a client component, and the public JS budget has about 2.6 KB of headroom, so it belongs with performance and error hardening | Phase 9 |
| Arabic font preload on `/ar` (R-31) | Phase 8 |
| Cross-locale prefetch 404s (R-54) | Phase 8 |
| Payload admin a11y findings (R-53) | Phase 9/10 |
| Search Console verification; `seo:audit` against the deployed domain | Phase 10 |
| AVIF/JPEG fallback, antivirus, media backup, durable cache tags, S3 (from Phase 6) | Phases 8/9 (unchanged) |

## 20. Git state

- **Branch:** `main`, tracking `origin/main`, not ahead or behind.
- **HEAD:** `af32158fdd23f74ef7dc313fea07565f2e33c543` (Phase 1). No commit was created in Phase 7 (the reflog's last entry is the Phase 1 commit) and nothing was pushed.
- **Staged changes:** none.
- **`git status --short`:** 100 entries: 38 `M`, 3 `D`, 59 `??`. These are the uncommitted work of Phases 2–7.
- **Phase 7 files** (modification audit since the Phase 6 closure):
  - **New:**
    - `scripts/generate-share-images.mjs`
    - `src/assets/share/share-en.png`, `share-ar.png`
    - `src/lib/i18n/switch-target.ts`, `switch-paths.ts`
    - `src/lib/seo/share-image.ts`
    - `src/migrations/20260928_105901_phase7_site_settings_seo.{ts,json}`
    - `tests/unit/language-switch.test.ts`, `tests/unit/seo-phase7.test.ts`
    - `tests/e2e/seo.cms.spec.ts`
    - `tests/deployment/seo-audit.mjs`
    - `docs/reports/PHASE_7_REPORT.md`
  - **Modified:**
    - `src/components/shell/LanguageSwitcher.tsx` (committed file; the only tracked file newly modified in this phase)
    - `SiteHeader.tsx`, `SiteFooter.tsx`
    - `src/app/[locale]/page.tsx`
    - `src/cms/globals.ts`, `src/cms/fields.ts`
    - `src/config/copy-review.ts`
    - `src/content/{types,payload-adapter,repository}.ts`
    - `src/lib/i18n/publishability.ts`
    - `src/lib/seo/{metadata,structured-data}.ts`
    - `src/migrations/index.ts`
    - `src/payload-types.ts` (regenerated)
    - `package.json` (`seo:share-images`, `seo:audit`)
    - `docs/architecture/ARCHITECTURE_DECISIONS.md`, `docs/architecture/RISK_REGISTER.md`
- **Unrelated files:** none changed. The cinematic scene (`src/components/cinematic`, `src/scene`), the Phase 4 page components and styles, `portrait.jpg` (SHA-256 `1c00fa07…3fca`, unchanged) and `.env` are untouched.
- **Database** after cleanup:
  - all collections are empty;
  - Profile and CV are at their defaults;
  - `site_settings` has one row with empty values (created by the e2e restore);
  - `payload_migrations` = initial, phase6, phase7.

## 21. Final verdict

# PHASE 7 COMPLETE

Every Phase 7 requirement in the roadmap, the Phase 7 prompt, SEO_PHASE_GATE and ADR-006/011 is either implemented and verified, or legitimately assigned to a named phase or to the owner.

| Requirement | Evidence |
|---|---|
| Arabic / RTL, `lang`/`dir` | audit (lang/dir on every page), e2e, visual QA |
| Translations (UI catalogs) | unit catalog-parity tests. Content and copy approval: owner (D-9, R-46) |
| Localized metadata / OG | e2e (`og:locale`, Arabic title and alt, localized share image) |
| Canonical | e2e + production audit |
| hreflang / x-default | unit, e2e, audit reciprocity |
| Sitemap locale strategy | unit, e2e, production audit |
| robots | unit (production/preview), production run |
| Open Graph / default share image | e2e, unit, visual inspection |
| Structured data without unsupported claims | unit + audit |
| Page-aware switcher (R-47) | unit (7) + e2e (4) |
| Site Settings / SEO defaults (R-48) | e2e + migration |
| Accessibility audit, keyboard, reduced motion, contrast, alt | axe 0 violations (45 runs), existing keyboard and reduced-motion e2e, focus check |
| No Phase 3–6 regression | cinematic pixel regression, 164/164 e2e ×2, JS budget |

Nothing was committed, pushed or deployed. Phase 8 has not been started.
