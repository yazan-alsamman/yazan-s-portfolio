# Phase 4 Report — Public Site Core

**Date:** 2026-09-28 · **Branch:** `master` (uncommitted; nothing staged, committed or pushed)
**Scope source:** `docs/ROADMAP.md` §Phase 4 and `prompts/04_PUBLIC_SITE_CORE.md`.
**Precondition:** Phase 3 was approved by the owner ("APPROVED BY OWNER — READY TO PROCEED", recorded in `PHASE_3_REPORT.md` and `PHASE_3_VISUAL_REVIEW.md`).

Legend used below: **Implemented** · **Verified** (a test or measurement actually ran and passed) · **Deferred** (a later phase owns it) · **Blocked** · **N/A**.

---

## 1. Objective

Build the public portfolio around the approved cinematic landing:

- **Routes:** About, Projects, Project detail, Experience, Skills, Certificates, CV, Contact.
- **Supporting pieces:** the footer and the homepage portfolio sections.

The constraints are:

- **Content:** it comes only from the CMS (no hard-coded duplicate data). Case-study storytelling shows a section only when verified content exists.
- **Design:** editorial, premium, and "not every section a card grid".
- **Language and quality:** bilingual, SEO-first and accessible, within the existing budgets.
- **Baseline:** Phase 3 stays frozen.

## 2. Starting State

- **Homepage:** Phase 3 cinematic landing; `#portfolio` held only a development "pending sections" panel.
- **Navigation:**
  - A static "planned/live" flag; every content route was "planned".
  - Production navigation listed Home only, and the sitemap listed Home only.
- **CMS schema:** complete from Phase 2 (Projects, Experience, Education, Certificates, Skills, Media, Documents, Redirects, globals Profile/CV/SiteSettings). The content repository only read Profile, Projects, CV and Redirects; `getRedirect` existed but was not used by any route.
- **CMS content (dev database):** Profile name + title only (EN/AR). **Zero** projects, experience, education, certificates, skills, media or documents.
- **Owner decisions in force:**
  - ADR-013: no contact form in v1, email/social only.
  - ADR-005: publish / archive model.
  - ADR-006: `/` English, `/ar` Arabic, no fallback; Western digits.
  - D-9: Arabic copy-review gate.
  - IA: empty pages are not published; Education lives on About and CV.

## 3. Authoritative Requirements (audit)

| Requirement (source) | Status |
|---|---|
| About, Projects, Project detail, Experience, Skills, Certificates, CV, Contact, Footer (ROADMAP P4, PS-1) | Implemented · Verified |
| Content from the CMS / content layer; no duplicated hard-coded data (prompt 04, CONTENT_MODEL) | Implemented · Verified |
| Case study: context, problem, approach, architecture, technologies, outcome, media, links (prompt 04, PS-4, SEO_MASTER §13) | Implemented · Verified (each section renders only with content) |
| Only sections with verified content (prompt 04, IA §0) | Implemented · Verified (dev notice; production 404) |
| Breadcrumbs on project detail (PS-8, IA §3) | Implemented · Verified (+ BreadcrumbList JSON-LD) |
| Related projects (PS-9) | Implemented · Verified |
| Stable slugs; changed slugs redirect (PS-7, T9) | Implemented (route now resolves `redirects`); covered by Phase 2 CMS tests for the redirect records |
| Internal linking graph (IA §5, SEO_MASTER §15) | Implemented · Verified. Links: Home → sections; About → onward routes; Project → Skills / related / Contact; Experience → Projects; Skills → evidence projects |
| Phase 4 SEO gate (SEO_PHASE_GATE: title, description, canonical, H1, semantic HTML, internal links, image alt, indexability, localized metadata) | Verified (e2e + production-mode check, §11) |
| Education as a section of About and CV, no route (IA §1) | Implemented · Verified (QA) |
| Contact without a form (ADR-013) | Implemented · Verified |
| Skills without percentages (CONTENT_MODEL) | Implemented · Verified |
| Dashboard, media pipeline, full bilingual/SEO audit, performance hardening, security | **Deferred:** Phases 5–9 per ROADMAP |
| Lab / articles (PS-10) | **N/A:** optional, only with owner material |

**Already complete before Phase 4 (not rewritten):**

- CMS schema, validation, localization, drafts/publish/archive, access control, media and document upload safety, revalidation hooks (Phase 2).
- Header, mobile menu, theme toggle and language switcher (Phase 1).
- The cinematic landing (Phase 3, frozen).

## 4. Architecture Decisions

1. **Route availability is computed from the CMS.**
   - `fetchRouteAvailability(locale)` replaces the static "planned/live" flag.
   - It drives the header, footer, sitemap and a route gate (`gateContentRoute`).
   - Empty route in production → 404 and absent everywhere. In development → a visible notice, `noindex`.
   - Rules: About needs the long bio; Contact needs an email or social profile; CV needs a downloadable PDF; list pages need ≥ 1 public item.
2. **Content contract extended, not replaced** (`src/content/types.ts`):
   - New schemas: Experience, Education, Certificate, SkillDetail, ProjectRef, RouteAvailability.
   - Project gains timeline, gallery, videoUrl and experience.
   - Profile gains longBio.
   - Presentation still depends only on these types, never on Payload shapes.
3. **Rich text is rendered server-side by an in-house Lexical renderer** (`RichText.tsx`). No new dependency and no raw HTML injection. Headings are re-based under the page outline, and only http(s)/mailto/site-relative links are allowed.
4. **Robust per-item validation.** Optional rows (links, gallery images, joined projects and skills) are validated one by one. An incomplete row is dropped, and the published page stays. This was found during QA: whole-document validation had hidden a published project while the index still linked to it.
5. **CMS file URLs are site-relative** (`fileUrl`), so `next/image` treats them as local images on any host or port.
6. **hreflang per page.** `buildPageMetadata({ availableIn })` and the sitemap pair only locales in which the same page exists.
7. **Rendering stays server-first.** All pages are statically generated (●), and CMS publishes revalidate them by tag. The only new client JS is the `/projects` category filter. The list is complete in the server HTML, and the filter only hides rows after hydration.
8. **The Phase 3 page was changed only inside `#portfolio`.** One `<HomeSections>` element was added where Phase 3 reserved the portfolio content; the cinematic section and scene code are untouched (verified in §13).

## 5. Implementation

| Page / area | What it renders (only when content exists) |
|---|---|
| **Header / footer / mobile menu** | Live routes only (production); every route in development. The footer adds GitHub/LinkedIn labels and a CV download link. |
| **Home `#portfolio`** | 01 Introduction (short bio → About) · 02 Selected work (featured projects) · 03 Technical expertise (skills by category) · 04 Experience (latest 3) · 05 Certificates (latest 4) · 06 Contact CTA. It keeps the Phase 3 index-numeral motif, and each section links to its route. |
| **/projects** | An editorial numbered index (not a card grid): title link, summary, category, technologies, cover when present. Category filter (accessible `aria-pressed` buttons + live count) when ≥ 2 categories exist. |
| **/projects/[slug]** | Breadcrumbs, category eyebrow, H1, summary, and a details row (role, timeline, category, context = experience). Cover image. Sections Overview / Problem / Approach / Architecture / Results, then Technologies (linked to `/skills#skill-id`), Media (gallery, video link), Links, Related projects (same category first, then shared technologies), CTA to all projects and Contact. JSON-LD BreadcrumbList + CreativeWork. Retired slugs redirect. |
| **/about** | Short bio as lead; long bio (rich text) beside the portrait (CMS portrait if uploaded, otherwise the approved `portrait.jpg` with the Phase 3 crop); Education; "Continue" links to live routes. |
| **/experience** | A measured timeline: period, role, organization, description, technologies, projects done in that role, links. |
| **/skills** | Skills grouped by category in CMS order, each linking to its evidence projects; no bars or percentages. |
| **/certificates** | Issuer, exact certificate name, date, credential ID, "Verify at issuer" link, PDF link or image. No implied verification and no schema. |
| **/cv** | A download button (PDF, version, updated date) plus an HTML summary composed from Experience, Education and Skills (no duplicated facts). |
| **/contact** | Owner-approved email and profiles (`rel="me"`). No form (ADR-013). |

**Messages:** a `pages` namespace in EN and AR (Arabic drafted and gated by the copy review, D-9). Dates use `Intl`, with Western digits in both locales (ADR-006).

## 6. Files Changed

**New:**

- **Routes:**
  - `src/app/[locale]/{about,projects,projects/[slug],experience,skills,certificates,cv,contact}/page.tsx`
- **Components:**
  - `src/components/content/RichText.tsx`
  - `src/components/pages/{PageIntro,DevEmptyNotice,Breadcrumbs}.tsx`
  - `src/components/portfolio/{ProjectRow,ProjectIndex,TechnologyList,ExperienceList,EducationList,CertificateList,SkillGroups,HomeSections}.tsx`
- **Content and library modules:**
  - `src/content/{rich-text,files}.ts`
  - `src/lib/{route-gate,format,social}.ts`
  - `src/lib/seo/{page-metadata,sitemap}.ts`
- **Tests:**
  - `tests/unit/portfolio.test.ts`
  - `tests/cms/portfolio.test.ts`
  - `tests/e2e/portfolio.spec.ts`
  - `tests/e2e/portfolio.cms.spec.ts`
- **This report:** `docs/reports/PHASE_4_REPORT.md`

**Modified:**

- **Content layer:** `src/content/{types,payload-adapter,repository}.ts`
- **Navigation and sitemap:** `src/config/navigation.ts`, `src/app/sitemap.ts`
- **SEO modules:** `src/lib/seo/{metadata,structured-data}.ts`
- **Shell:** `src/components/shell/{SiteHeader,SiteFooter}.tsx`
- **Homepage:** `src/app/[locale]/page.tsx` (only the `#portfolio` insertion)
- **Styles:** `src/app/globals.css` (§11, rich-text styles)
- **Messages:** `messages/{en,ar}.json`
- **Tests:**
  - `tests/unit/i18n.test.ts`: navigation tests rewritten for availability; "PDF" allowed as identical in both languages.
  - `tests/e2e/cinematic.spec.ts`: a test-only 60 s budget for the GPU-bound test.
- **Docs:** `docs/architecture/{ARCHITECTURE_DECISIONS,INFORMATION_ARCHITECTURE,RISK_REGISTER}.md`, `docs/reports/PHASE_3_{REPORT,VISUAL_REVIEW}.md` (owner approval recorded).

**Phase 3 code:**

- The only change is the `<HomeSections>` insertion inside `#portfolio`.
- The scene, cinematic components, timeline and cinematic CSS are unchanged.
- One Phase 3 *test* got a wider timeout. Reason: under the larger parallel suite it exceeded 30 s once while sharing the GPU; alone it takes 8–9 s. That is test timing, not app behaviour.

## 7. Database Changes

**None.** No schema change and no migration: the Phase 2 schema already covered every Phase 4 field. The dev database contains no fixtures after testing (verified: all collections 0; Profile bio, email and social links null as before; CV hidden).

## 8. CMS Changes

**None to collections, globals, access control, hooks or validation.** The public read layer was extended: new readers for experience, education, certificates and skills, plus route availability. It keeps the Phase 2 publication filter (published, not archived, locale approved, no fallback, schema-validated), and joins are filtered too, so draft or archived projects never leak through skills or experience.

## 9. SEO Changes

- **Per page:**
  - A localized title (`<Page> — <name>`) and a human-written, identity-based description.
  - A self-referencing canonical.
  - hreflang only to locales where the page exists, plus x-default.
  - Open Graph and Twitter metadata; project pages use `og:type=article` and the cover as `summary_large_image`.
  - Exactly one H1.
- **Structured data:** project pages emit `BreadcrumbList` + `CreativeWork`. `Person`/`WebSite` remain on Home. Certificates get no schema.
- **Sitemap:**
  - Live routes and published projects, with `lastmod` from `updatedAt`.
  - Publishable locales only (Arabic excluded while its copy review is pending).
  - Hreflang alternates per URL.
- **Robots behaviour (unchanged):**
  - Production: public pages indexable; the CV PDF is `X-Robots-Tag: noindex` (served from `/api`).
  - Non-production: everything noindex.
- **Internal linking:** Home → every live route and featured projects; Project → Skills, related projects, Contact; Skills → evidence projects; Experience → projects; About → onward routes.

## 10. Accessibility Changes

- **Semantics:**
  - Single H1 per page; section headings as h2, rich-text headings re-based below.
  - `nav` with labelled breadcrumbs (`aria-current="page"`).
  - Filter buttons with `aria-pressed` and a polite live-region count.
- **Links and targets:**
  - Stretched-link rows (one tab stop, name = title).
  - A hidden "(opens external site)" hint on external links.
  - Touch targets of at least 44 px.
- **Language:** Latin technology names isolated LTR inside Arabic; `<time dateTime>`.
- **Images:** alt text from the CMS (empty only for decorative images). The About portrait alt comes from the CMS name.
- **Motion and contrast:** reveals use the existing CSS scroll-driven `.reveal`, which is disabled under reduced motion; contrast comes from existing tokens.
- **Verified by axe (WCAG 2.2 A/AA):**
  - `/projects` and `/about` (empty state, desktop and mobile).
  - A fully populated project case study.
  - All existing Phase 1–3 axe tests still pass.

## 11. Performance Impact

Critical-path JS is measured as the browser transfer of the scripts referenced by each route's server HTML (same method as Phases 2–3; post-load prefetches excluded).

| Route | Critical JS | Note |
|---|---|---|
| `/` | **167,256 B** | Phase 3: 167,243 B → +13 B. The approved landing is unaffected. |
| `/projects` | 166,763 B | includes the filter island (the route chunk is 7,165 B with `next/image`) |
| `/about`, `/experience`, `/certificates`, `/cv` | 165,509 B | the `next/image` client component |
| `/skills`, `/contact` | 159,598 B | ≈ the Phase 2 baseline |

- **Budget:** every route is within the ≤ 170 KB budget (R-41 updated).
- **Prefetch:** after load, Next prefetches the Home route chunk (7,658 B, via the header wordmark link). It is not on the critical path.
- **CSS:** 9,472 → 10,243 B (+771 B: rich text + new utilities).
- **Layout shift:** CLS 0 on `/`, `/projects` and `/about`; 0.0007 on `/ar/projects`.
- **3D and scene:** unchanged. The lazy 3D chunk is still only for WebGL tiers, and there are no new heavy dependencies.
- **Rendering:** every page is statically generated; there are no benchmarks beyond these local measurements.

## 12. Tests

**Final verification suite (final code):**

| Command | Result |
|---|---|
| `pnpm format:check` | "All matched files use Prettier code style!" |
| `pnpm lint` | exit 0 |
| `pnpm typecheck` | exit 0 |
| `pnpm test` | **6 files, 51 tests passed** (+11 in `tests/unit/portfolio.test.ts`: rich text, safe links, file URLs, sitemap/hreflang assembly, JSON-LD, date formatting; navigation tests rewritten) |
| `pnpm test:cms` | **2 files, 37 tests passed** (+8 in `tests/cms/portfolio.test.ts`: route availability, joins without leaks, the extended project contract, education, certificates PDF/image, per-locale gating, invalid-row robustness). Real PostgreSQL 17 `_test` database, rebuilt from the migrations. |
| `pnpm build` | exit 0; the 8 new routes statically generated for `en` and `ar` |
| `pnpm test:e2e` | **143 passed, 0 failed, 33 skipped by design — 2 consecutive clean runs** on the final code. New: 26 read-only empty-state tests (EN/AR × 7 routes + sitemap/RTL/404/axe) and 7 fixture tests (REST content → revalidation → rendered pages → cleanup). |

**Additional verification:**

| Check | Result |
|---|---|
| **Production-mode build** (`SITE_ENV=production`, local) | `/` 200 with `index, follow`; the 7 empty routes and an unknown project → **404**; sitemap = Home only; navigation = Home only; no development notices; `/ar` 404 (copy-review gate) |
| **Media + CV end to end** (REST uploads) | Cover and gallery served via `/_next/image` from site-relative paths; video link; `og:image` absolute on `SITE_URL`; `summary_large_image`; `/cv` download (PDF 200, `application/pdf`, `X-Robots-Tag: noindex`); footer CV link; sitemap gains `/cv` and the project URL |

**Incidents (honest record):**

1. **Test locator:** an ambiguous locator (GitHub link in both the page and the footer) was fixed in the test.
2. **Parallel load:** the GPU-bound Phase 3 test timed out once under the larger parallel load. It was given a 60 s budget (test-only).
3. **Stale cache after restart (real finding, R-45):** CMS content deleted in one run was still served after a server restart. Next keeps tag invalidations in memory only, and `next build` reuses `.next/cache/fetch-cache`.
   - Test mitigation: the fixture suite re-requests affected pages after cleanup, and local builds for QA clear `.next/cache/fetch-cache`.
   - The production decision is deferred to Phase 9.
4. **QA fixture bug that exposed a real app issue:** an incomplete link row hid a published project. Fixed (§4.4) and covered by a new CMS test.
5. **Leftover fixture:** the QA script's cleanup initially failed for that invalid project. It was deleted manually through the API; the database is verified clean.

## 13. Visual QA

- **Method:**
  - Production build (`next start`), Chrome with hardware WebGL.
  - Temporary labelled fixtures in EN and AR ("QA fixture…", clearly not real), deleted afterwards.
  - 42 screenshots, kept in the session scratchpad and not committed.
  - Every page: HTTP 200, exactly one H1, **0 px horizontal overflow**, **no console errors**.
- **Viewports:**
  - Desktop 1440, 1920, 1280 (light).
  - Tablet 768 portrait, 1024 landscape.
  - Mobile 390, 360.
  - Also: EN/AR (RTL), dark and light, reduced motion.
- **Pages:**
  - Home `#portfolio` (all six sections at 1440 and 390, AR, light).
  - Projects index; case study (EN/AR, all widths); About; Experience; Skills; Certificates; Contact; CV (empty and with a PDF); a project with cover and gallery.
- **Approved cinematic landing, regression check:** all 8 acts at 1440 and 6 acts at 390, captured by real scrolling and pixel-compared with the approved Phase 3 captures.
  - Acts 1–7: mean absolute difference **0–0.39 / 255** (animation and GPU noise; ≤ 0.015 % of channels differ by more than 40).
  - Transition act: 0.95 / 1.89 (desktop / mobile). Visually inspected: the scene and copy are identical; the only difference is the new "01 — Introduction" portfolio section appearing below "The person behind the systems." where the development panel used to be. That is the intended bridge.
  - **The approved scene is visually unchanged.**
- **Found and fixed during QA:**
  - The Arabic breadcrumb separator was mirrored into "\" (fixed).
  - Whole-project invalidation by a single bad link (§4.4).
- **Observed, not changed:**
  - English date short forms use en-GB ("Sept 2015").
  - In development builds the navigation also lists routes without content (by design, as a development aid; production lists live routes only, verified).

## 14. Risks

| ID | Risk | Status |
|---|---|---|
| **R-45 (new, HIGH)** | Cache invalidations are lost on server restart; `next build` reuses the data cache. Stale CMS content can return after a restart. | OPEN. The production decision (durable-tag `cacheHandler` / clearing the cache at start / a revalidate window) belongs to Phase 9. See the register. |
| **R-46 (new, HIGH)** | The CMS has no portfolio content, so production shows only the landing until the owner publishes verified content. | OPEN. Owner content entry; by design. |
| R-47 (new, LOW) | The language switcher can point to a missing per-locale page (localized 404). | Deferred to Phase 7. |
| R-41 (updated) | Critical-path JS headroom: all routes within 159.6–167.3 KB. | OPEN (monitor) |
| R-44 | Arabic UI copy (including the new Phase 4 strings) is agent-drafted and unreviewed. | OPEN. The gate keeps Arabic unpublished. |

## 15. Deferred Items

- **Phase 5:** dashboard UX polish for entering this content.
- **Phase 6:** media pipeline (image derivatives in the CMS, portrait handling in the CMS, CV/PDF policies).
- **Phase 7:**
  - Page-aware language switcher (R-47).
  - Site-wide default share image.
  - Full bilingual/SEO audit and Arabic copy review.
- **Phase 8:** real-device performance measurements.
- **Phase 9:** cache-coordination decision (R-45), security review.
- **Optional or owner-driven:** contact form (ADR-013, owner request O-08), Lab/articles (PS-10).
- **21st.dev:** no 21st.dev MCP tools are available in this session. As instructed, no HTTP or credential workaround was used; no API key was read. The UI reuses the approved design system (Phase 1 patterns already adapted from 21st.dev research: index numerals, measured rules, link underlines).

## 16. Final Verification

| Item | Status |
|---|---|
| All Phase 4 routes + footer + homepage sections | Implemented · Verified (fixtures, e2e, QA screenshots) |
| CMS as the single source; no hard-coded content | Verified: pages render nothing factual without CMS content; production 404s verified |
| Bilingual EN/AR, RTL, localized metadata, no English fallback | Verified (e2e + QA); Arabic publication still gated |
| SEO gate (title, description, canonical, hreflang, OG/Twitter, JSON-LD, robots, sitemap, H1, internal links, alt) | Verified |
| Accessibility (axe, keyboard, landmarks, headings) | Verified (axe on new pages; the existing suites still pass) |
| Performance budget | Verified: every route ≤ 167,256 B critical JS |
| Phase 3 unchanged | Verified: pixel regression + code scope |
| Database / migrations | N/A: no changes; the migrated test database was rebuilt and all CMS tests pass |
| Docker / other projects | Only `yazan-portfolio-postgres` was used. Tavla (backend, Postgres, Redis, MinIO, Nginx) untouched and running; nothing pruned, stopped or deleted. |
| `portrait.jpg` | Unmodified (SHA-256 `1c00fa07…3fca`) |

## 17. Git State

- Branch `master`, HEAD `af32158` (history untouched). Nothing staged, committed or pushed. No secrets, `.env` or keys added.
- The working tree also contains the uncommitted Phase 2 and Phase 3 work (as at the start of this phase).
- `git status --short` and `git diff --stat` are reproduced in the phase hand-off message.

## 18. Production-Readiness Assessment

- **Code: Phase 4 complete.** Every Phase 4 route and component is implemented. Every acceptance criterion is verified against real CMS content (fixtures), in both locales, in development and production modes.
- **Site content: not launch-ready.** The CMS holds no verified portfolio content (R-46), so a production deployment today would correctly show only the approved landing, with every other route unpublished.
- **Operations: not launch-ready.** The cache-coordination risk (R-45) must be decided before production (Phase 9).
- **Deployment:** no deployment happened in this phase. There are no claims about indexing, Core Web Vitals or external availability.

**Verdict:** PHASE 4 COMPLETE
