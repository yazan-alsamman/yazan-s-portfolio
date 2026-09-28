# Phase 6 Report — Content & Media Pipeline

**Date:** 2026-09-28 · **Branch:** `main` (HEAD `af32158`, nothing committed in this phase) · **Author:** Claude (agent)

Scope sources: `docs/ROADMAP.md` (Phase 6), `prompts/06_CONTENT_AND_MEDIA_PIPELINE.md`, ADR-008, ADR-009, `DASHBOARD_SPEC`.
Status labels: **Implemented** (code exists) · **Verified** (automated test or recorded evidence) · **Deferred** (moved to a named later phase) · **Blocked** · **N/A**.

---

## 1. Objective

Let the owner manage every portfolio image and document from the dashboard without degrading the public site:
- optimized, metadata-free public images;
- a private original;
- safe upload validation;
- an honest optimization status;
- localized alt text;
- a CV/certificate PDF policy;
- a caching strategy;
- archive/delete behaviour;
- an optional, hash-verified import of the approved portrait.

The Phase 3 scene, the Phase 4 public design and the Phase 5 dashboard stay unchanged, apart from the media/document UX.

## 2. Authoritative Phase 6 requirements

| # | Requirement (source) | Status |
|---|---|---|
| 1 | Optimized image uploads (Roadmap, prompt) | Implemented · Verified |
| 2 | Image transformation: responsive derivatives, no enlargement (ADR-008/009) | Implemented · Verified |
| 3 | Portrait handling: approved file, SHA-256 unchanged, no enhancement (ADR-008, D-5) | Implemented · Verified |
| 4 | Project media: cover and gallery (DASHBOARD_SPEC) | Implemented · Verified |
| 5 | Certificate assets: image or PDF (DASHBOARD_SPEC) | Implemented · Verified |
| 6 | CV upload/download (DASHBOARD_SPEC) | Implemented (Phase 4/5) · Verified |
| 7 | Alt text and localized media metadata (ADR-009) | Implemented · Verified |
| 8 | Safe file validation: MIME, magic bytes, size, pixels, PDF active content (ADR-009) | Implemented · Verified |
| 9 | Caching strategy (prompt) | Implemented · Verified (R-45 carried) |
| 10 | Archive/delete behaviour (ADR-005) | Implemented · Verified |
| 11 | Media optimization status (prompt) | Implemented · Verified (pending/processing: N/A, §6) |
| 12 | Workflow: dashboard → create project → upload media → publish → public page | Verified (e2e, §15) |
| 13 | Public JS ≤ 170 KB, no CMS code in public chunks | Verified (§18) |
| 14 | Phase 3 cinematic landing visually unchanged | Verified (§16.4: pixel diff within run-to-run noise on all 19 approved frames) |
| 15 | AVIF + JPEG fallback derivatives (ADR-008 original text) | Deferred — WebP only, ADR amendment (§5) |
| 16 | Malware scanning / PDF re-rendering | Deferred to Phase 9 (R-51) |
| 17 | Object storage (S3/R2) | Deferred (optional) to Phase 9. The chosen VPS topology uses a persistent volume (ADR-009/012); the adapter seam is unchanged |
| 18 | Media-volume backup/restore; durable cache-tag storage | Deferred to Phase 9 (R-52, R-45) |
| 19 | Real portfolio media and content | Owner action (R-46) |

## 3. Starting state

Phase 5 was complete. The existing upload collections were `media` (images) and `documents` (PDF), with:
- magic-byte sniffing, size limits and regenerated filenames;
- derivatives `thumbnail`/`card`/`large`, with `withoutEnlargement`;
- an archive-before-delete guard and a usage list.

Gaps against Phase 6:
- the original upload was publicly downloadable, EXIF/GPS included;
- the public site could fall back to the original file;
- there were no pixel limits and no PDF content policy;
- there was no optimization status;
- alt text was not gated per locale;
- there was no portrait import path;
- there was no size suitable for a square portrait or a high-DPI hero.

## 4. Media architecture

```
Admin upload ──► uploadGuard (MIME sniff, size, pixels, PDF policy, filename) ──► Payload + sharp
                                                     │
      MEDIA_DIR/images: original (private) + 5 WebP derivatives (public, EXIF-free)
      MEDIA_DIR/documents: PDF (public, inline, noindex)
                                                     │
payload-adapter ─► publicImage(): derivative only · alt in this locale · not archived
                                                     │
                     repository (unstable_cache + tags) ─► public pages
```

- **`src/cms/media-policy.ts`:** a pure module (derivatives, limits, PDF tokens, status). It is shared by the CMS, the content layer and the tests.
- **Private original:** `upload.handlers` guard in `Media.ts`. Anyone who is not a signed-in admin gets `404` for the original filename.
- **Public contract:** unchanged, site-relative `/api/media/file/...` URLs. Pages never learn the original filename.

## 5. Optimization pipeline

| Derivative | Size | Quality | Use |
|---|---|---|---|
| `thumbnail` | 480 w | 80 | admin, small cards |
| `card` | 960 w | 80 | cards |
| `large` | 1600 w | 82 | project detail |
| `full` | 2560 w | 82 | hero / high-DPI (first choice for public pages) |
| `square` | 512 × 512 | 84 | portrait/avatar, focal-point crop |

- **Format:** all derivatives are WebP. sharp drops EXIF/GPS/XMP by default.
- **No enlargement:** `withoutEnlargement` means a small source keeps its own size. For example, the 538 px portrait gives `full` = 538.
- **Why the square is 512:** it is below the portrait's width, so the crop is real.
- **Public choice:** `full → large → card → thumbnail` is the preferred order, and the original is never used.
- **Deviation from ADR-008:** there is no AVIF or JPEG fallback (ADR amendment). All target browsers support WebP. AVIF would multiply the encode time of every upload.

## 6. Status model

Status is computed on read by virtual fields, with no DB column:
- **Ready:** every derivative is recorded and its file exists on disk. The detail lists sizes, for example `full 1600px · … · WebP, metadata stripped · original private`.
- **Failed:** some derivatives are missing, with the reason, for example `Missing: card (file missing)… Re-upload the file to regenerate.`
- **Not applicable:** non-image files.

**Pending/processing:** N/A. sharp runs synchronously inside the upload request, so the document does not exist before its derivatives do. A stored "processing" state would never be observable, and after a crash it would be wrong. Computing the status from files on disk also catches later damage, such as a lost volume or a restore without media (R-52).

The dashboard shows the status as a list column and in the sidebar of each media item. The "On the public site" panel of projects adds a per-locale note when a cover or gallery image is Failed ("not shown anywhere") or has no alt text in that language ("hidden here").

## 7. Portrait handling

- **Authoritative file:** `portrait.jpg` (538 × 661, D-5). SHA-256 `1c00fa075b97e2ef8a3460b3d62155052533729994041bd7f562ed5177323fca`, re-verified at the end of the phase (§21).
- **Import path:** `pnpm cms:import-portrait` (`src/cms/portrait.ts` + `src/cms/scripts/import-portrait.ts`):
  - verifies the hash before and after storing;
  - stores the bytes unmodified;
  - sets EN/AR alt from the existing approved copy (`portraitAlt`);
  - sets the focal point to (55 %, 38 %), so the square crop keeps the face and excludes the third party's hand;
  - is idempotent;
  - **does not** set the Profile portrait, which stays the owner's choice.
- **Not done:** no upscaling, no AI enhancement, no face editing, no destructive recompression. Derivatives are ordinary resampled copies.
- **Scene unchanged:** the Phase 3 scene still uses the repository file. The CMS portrait feeds only the HTML pages (About/Profile).
- **Dev database:** the import was run against the dev database only temporarily for visual QA and then removed (§16). Running it for real is an owner action.
- **Photographer/provenance:** not recorded, because the facts are unknown. No credits were invented.

## 8. PDF policy

- **Accepted:** `application/pdf` (magic bytes `%PDF-`), up to 20 MB. Payload's PDF structure check still applies.
- **Refused:** documents containing `/JavaScript`, `/JS`, `/Launch`, `/EmbeddedFile`, `/RichMedia` or `/SubmitForm`. Matching is on exact-name tokens, so `/JSON` does not match. The refusal message says what was found and suggests "Print to PDF".
- **Served with:**
  - `Content-Type: application/pdf`;
  - `Content-Disposition: inline`;
  - `X-Content-Type-Options: nosniff`;
  - `X-Robots-Tag: noindex`;
  - `Cache-Control: public, max-age=86400`.
- **Limits:** this is a static check, not antivirus (R-51, Phase 9). The CV and certificates link to the stored PDF; the CV download is shown only when the owner enables it (Phase 4/5).

## 9. Security

| Control | Status |
|---|---|
| Admin-only upload, update and delete (no public upload endpoint added) | Unchanged · Verified |
| MIME allowlist plus magic-byte sniffing; SVG refused | Unchanged · Verified |
| Size caps: images 15 MB, PDFs 20 MB | Unchanged · Verified |
| Pixel limits: ≤ 12,000 px per side, ≤ 60 MP, read from the header before decoding | New · Verified |
| PDF active-content refusal | New · Verified |
| Regenerated filenames | Unchanged |
| Original upload private (404 unless admin) | New · Verified |
| EXIF/GPS stripped from every public file | New · Verified (a GPS-tagged JPEG in unit, CMS and e2e tests) |
| `nosniff` on every file; `noindex` on files | Verified |
| Archived media are not served publicly and not rendered | Verified |
| No secrets printed; `.env` untouched; 21st.dev not accessed | Observed |

## 10. Storage

- **Location:** local filesystem under `MEDIA_DIR`:
  - `images/` holds originals and derivatives;
  - `documents/` holds PDFs.
- **Docker:** the Docker image mounts `/app/media` as a volume (ADR-012), so files survive container rebuilds.
- **Database:** stores metadata only.
- **Deletion:** deleting a media document (allowed only when archived and unused) removes its original and derivative files.
- **Backups:** the media volume must be backed up together with PostgreSQL (R-52, Phase 9).
- **Docker in this phase:** only `yazan-portfolio-postgres` was used. No prune; no other container or volume was touched.

## 11. CMS UX

- **Media list:** Filename, Alt, **Optimization**, Width, Height, Size, Archived.
- **Media edit:**
  - read-only "Optimization" status and detail in the sidebar;
  - description explaining the private original, the derivatives and localized alt;
  - focal-point picker (Payload).
- **Upload from a relationship:** Project → Media tab → Cover/Gallery → "Create New" opens an upload drawer with file and alt text. The e2e workflow uses exactly this path.
- **Documents:** the description states the PDF rule (no scripts, attachments or forms; opened inline; not indexed).
- **Project "On the public site" panel:** per-locale notes about images that will not appear.
- **Arabic:** alt text is edited with the locale switcher, in Arabic (RTL).

## 12. Files changed

**New:**
- `src/cms/media-policy.ts`
- `src/cms/portrait.ts`
- `src/cms/scripts/import-portrait.ts`
- `src/migrations/20260928_073607_phase6_image_derivatives.ts` and `.json`
- `tests/unit/media.test.ts`
- `tests/cms/media.test.ts`
- `tests/e2e/media.cms.spec.ts`
- `docs/reports/PHASE_6_REPORT.md`

**Modified:**
- `src/cms/uploads.ts`: pixel limits and the PDF policy; the guard is now async.
- `src/cms/collections/Media.ts`: derivatives, private original, headers, status fields, descriptions and columns.
- `src/content/files.ts`: `publicImage`.
- `src/content/payload-adapter.ts`: images through `publicImage`; the portrait prefers `square`.
- `src/components/content/RichText.tsx`: inline images through `publicImage`.
- `src/cms/admin/public-status.ts`, `src/cms/admin/PublicStatus.tsx`: image notes.
- `src/migrations/index.ts`
- `package.json`: the `cms:import-portrait` script.
- `playwright.config.ts`: `cms` project `workers: 1`.
- `docs/architecture/ARCHITECTURE_DECISIONS.md`: Phase 6 amendments.
- `docs/architecture/RISK_REGISTER.md`: R-50 to R-52.

**Unchanged (frozen):**
- `src/components/cinematic/**`, the Phase 4 page components and styles;
- `portrait.jpg`;
- `.env`.

## 13. Database changes

On `media`:
- `sizes_full_{url,width,height,mime_type,filesize,filename}` and `sizes_square_{…}` columns;
- two filename indexes.

Status fields are virtual (no columns). No data was migrated or deleted.

## 14. Migrations

`20260928_073607_phase6_image_derivatives`:
- generated by `payload migrate:create`;
- reversible (`down` drops the columns and indexes);
- applied to the dev database by the production build (`prodMigrations`).

`payload_migrations` = the initial migration + this one. The `_test` database is migrated by the CMS test harness.

## 15. Tests

| Suite | Result |
|---|---|
| Unit (`vitest`) | 57 passed (6 new in `tests/unit/media.test.ts`) |
| CMS integration (`_test` DB) | 49 passed (6 new in `tests/cms/media.test.ts`) |
| E2E (production build) | two consecutive clean runs: **155 passed, 33 skipped (project-scoped), 0 failed** (runs 3 and 4) |
| Typecheck / lint | clean |

**Closure re-run (2026-09-28, after visual QA, against a fresh production build):**

| Check | Result |
|---|---|
| `pnpm typecheck` | clean |
| `pnpm lint` | clean |
| `pnpm format:check` | all files formatted |
| `pnpm test` (unit) | **57 passed** (7 files) |
| `pnpm test:cms` (CMS integration, `_test` DB) | **49 passed** (4 files) |
| `pnpm build` (fetch cache cleared first, R-45 practice) | success |
| `pnpm test:e2e`, run 1 | **155 passed, 33 skipped, 0 failed** (2.1 min) |
| `pnpm test:e2e`, run 2 | **155 passed, 33 skipped, 0 failed** (2.1 min); includes all 5 `media.cms.spec.ts` tests |

- No test was skipped, weakened, removed or rewritten to obtain these results.
- The 33 skips are the existing project-scoped `test.skip` conditions (desktop-only or mobile-only cases), unchanged from Phase 5.

**Required workflow evidence** (`tests/e2e/media.cms.spec.ts`, real admin UI):
1. Sign in.
2. Projects → Create → title, slug and summary.
3. Media tab → Cover → **Create New** → upload a 1600 × 900 JPEG **carrying GPS EXIF**, with alt text → Save.
4. SEO fields, translation status Approved → **Publish changes**.
5. `/projects/<slug>` shows the cover with the given alt. `src` is the `-1600x900.webp` derivative, and the image loads.

The follow-up tests of that spec check file serving, the dashboard status, the PDF policy and archive behaviour:
- anonymous original 404;
- derivative 200 `image/webp`, with `nosniff`, `immutable` and `noindex`, **no EXIF**, width 1600;
- admin original 200 with EXIF intact;
- dashboard status "Ready" with detail "full 1600px", and the list column;
- plain PDF inline/noindex/nosniff; active PDF → 400;
- archive → derivative 403/404 and the image is gone from the page.

**Incidents:**
- **Runs 1–2 failed** (403 on a profile update; the admin page missing its locale control). The cause was concurrent sign-ins of the shared admin across parallel CMS spec files (R-50). The fix was `workers: 1` for the `cms` project. No test was weakened or removed.
- The Phase 5 R-45 race was not observed in this phase's runs.

## 16. Visual QA

**Method**
- **Server:** the production build (`next start`, `SITE_URL=http://localhost:3217`) against the dev database, in real Chrome through Playwright.
- **Checks per page (automated):**
  - horizontal overflow (`scrollWidth − clientWidth`);
  - broken images;
  - any `<img>` whose URL is an original upload (`.jpg`/`.png` under `/api/media/file/`);
  - console errors and page errors.
- **Screenshots:** every page was captured and then inspected by eye.
- **Scripts** (scratchpad, not part of the repository):
  - `p6/qa.mjs`: fixtures and captures;
  - `p6/focal.mjs`: focal-point editor and failed-status captures;
  - `p6/regress.mjs`: cinematic comparison;
  - `p6/cleanup-check.mjs`: database state.
- **Evidence:** 43 captures (28 admin, 15 public) under `scratchpad/p6/shots/{admin,public}`, and 38 regression frames under `scratchpad/p6/regression/{a,b}`. The `qa.json` and `regress.json` files hold the measurements.

**Temporary fixtures**
All fixtures were labelled "QA fixture", with no real biographical content.
- **Images (JPEG, uploaded through the API):**
  - a 2400 × 1350 cover with EN and AR alt;
  - gallery image 1 (1600 × 1000) with EN and AR alt;
  - gallery image 2 (1200 × 1200) with **EN alt only**;
  - a certificate image (1400 × 1000).
- **Content:** a published EN and AR project using those images, a certificate, a skill, a PDF set as the CV, and fixture biography text.
- **Portrait:** imported with `pnpm cms:import-portrait` (media id 21, verified hash) and temporarily selected as the Profile portrait.

Everything was removed afterwards (§16.5).

### 16.1 CMS (dashboard)

| Area | Viewports / modes | What was checked | Result |
|---|---|---|---|
| Media list | 1440 light and dark, 1280, 1024, 390 | **Optimization** column shows *Ready* for all 5 images; thumbnails are the 480 px WebP derivative; page overflow 0 | Pass. At 1024 and 390, Payload's own table scrolls inside its container (stock behaviour; the page itself does not overflow) |
| Media edit | 1440 light and dark, 1280, 1024, 390 | Sidebar: Optimization *Ready*, Derivatives "thumbnail 480px · card 960px · large 1600px · full 2400px · square 512px · WebP, metadata stripped · original private"; collection description; usage tables ("Used as cover" lists the project) | Pass. At 390 the sidebar stacks below the form and nothing overflows |
| Optimization *Failed* | 1440 | One derivative of the portrait was renamed temporarily → status **Failed**, detail "Missing: thumbnail (file missing). Re-upload the file to regenerate."; file restored → **Ready** | Pass |
| Focal-point UI | 1440 | Edit Image → crop and focal-point editor shows the imported portrait focal point **X 55 %, Y 38 %** on the face | Pass. At 390 Payload hides "Edit Image" (stock Payload; not changed in Phase 6) |
| Localized alt (EN/AR) | 1440 | Locale switch to العربية: "Alt — العربية" field in RTL (portrait: "صورة شخصية ليزن السمان"); gallery image 2 has an empty AR alt | Pass |
| Portrait media item | 1440 EN and AR | 538 × 661, 70 KB JPEG original; derivatives card/large/full = 538 px (not enlarged), square 512; source note with the SHA-256 | Pass |
| Project → Media tab | 1440 | Cover and gallery relationships with thumbnails, edit and remove controls, "Create New / Choose from existing / drag and drop" | Pass |
| Project → Gallery → **Create New** | 1440 | Upload drawer ("Add files", select or drop). The single-file Cover → Create New → file + alt → Save path is exercised end to end by the e2e workflow test | Pass |
| "On the public site" panel | 1440, AR locale | "العربية: live … **Note: Gallery image 2: no alt text in this language — it is hidden here.**" | Pass |
| Certificate with image | 1440 | The Attachment field shows "Image" plus the file (polymorphic media/documents); the panel shows EN and AR live | Pass |
| Documents list / edit, CV global | 1440 | PDF rule description, file card, CV global with the fixture PDF and "Download visible" | Pass |
| Overview (Phase 5) | 1440 | Renders with the fixture content; no layout change | Pass |
| Archive / delete | 1440 + API | Archiving gallery image 1: the media page shows *Archived*, and the list keeps the item. **Deleting an archived but still-used image is refused (HTTP 400):** "This file is still used by: project gallery (1). Remove it there first." Deletion of unused archived items worked during cleanup (all 200) | Pass |

No console errors or page errors appeared on any admin page. Horizontal page overflow was 0 on every captured page.

### 16.2 Public site

| Page | Viewports | Measured | Result |
|---|---|---|---|
| Project detail (EN) | 1440 dark, 1440 light, 390 | Cover `…-2400x1350.webp` (the `full` derivative; the 2400 px source is not enlarged to 2560) rendered 1344 px wide; gallery `…-1600x1000.webp` and `…-1200x1200.webp` (390 px: all three loaded) | Pass. At 1440 the second gallery tile is lazy-loaded and blank in the full-page capture; it loads normally on scroll (390 run and archive run) |
| Project detail (AR) | 1440 | Cover and gallery image 1 with Arabic alt; **gallery image 2 (no Arabic alt) is not rendered**; RTL layout correct | Pass (designed behaviour) |
| After archiving gallery image 1 | 1440 | The project page renders the cover and gallery image 2 only; the archived image is gone | Pass |
| Home "Selected work" / Projects index | 1440 | Project card image from the WebP derivative, 432 px wide | Pass |
| About (portrait from the CMS) | 1440 dark and light, 390, AR 1440 | `…-512x512.webp` (square) with alt "Portrait of Yazan Al Samman" / "صورة شخصية ليزن السمان"; the crop keeps the face and **excludes the third person's hand** | Pass |
| Certificates | 1440, 390 | Certificate image `…-1400x1000.webp` | Pass |
| CV, Contact | 1440 | Render; the footer shows "Download CV (PDF)" only while the CV is visible | Pass |

On every public page:
- the number of original files served was 0;
- there were no broken images;
- horizontal overflow was 0;
- there were no console errors.

The Phase 4 layout (header, typography, grids, footer) renders as designed in these captures. No public component or style file was modified in Phase 6 (§21: file-modification audit), and the public e2e suites (desktop and mobile) pass.

### 16.3 File-serving evidence (automated, e2e)

- The anonymous original is 404.
- Derivatives are `image/webp`, with `nosniff`, `immutable` and `noindex`, and **no EXIF/GPS**, even though the uploaded JPEG carried GPS.
- The admin can fetch the original, with EXIF intact.
- PDFs are inline, `noindex` and `nosniff`; an active PDF is refused with 400.
- An archived image returns 403/404.

See §15.

### 16.4 Cinematic landing regression (Phase 3 freeze)

**Method**
- The capture method is identical to the Phase 3 approval capture (`visual-review/capture.mjs`): the same act scroll positions, real wheel input (touch `scrollBy` on mobile), 2.6 s settle, the same viewports, DPR and themes.
- **Frames:** all 19 approved frames:
  - desktop 1440, 8 acts;
  - mobile 390 @2×, 6;
  - laptop 1280 light, 3;
  - Arabic 1440, 1;
  - portrait close-up @2×, 1.
- **Runs:** two independent captures (A, B) against the clean database, both compared to the approved Phase 3 frames.
- **Metrics:** mean absolute pixel difference (0–255) and the percentage of channels differing by more than 40.

| | Largest mean difference | Largest share of channels changed by > 40 |
|---|---|---|
| Phase 3 ↔ run A | 0.37 (05 systems) | 0.01 % |
| Phase 3 ↔ run B | 0.34 (03 intelligence) | 0.01 % |
| run A ↔ run B (noise floor: animated particles) | 0.45 (05 systems) | 0.02 % |

- The difference from the approved frames is **no larger than the difference between two captures of the same build**.
- Arrival, transition, Arabic and light-theme frames differ by at most 0.04.
- The portrait close-up differs by 0.00 in run A and 0.05 in run B.
- There were no console errors.

**Result:** the cinematic landing is visually unchanged.

### 16.5 Cleanup

- **Fixtures:** all fixtures and the imported portrait were deleted through the API (archive → delete, all 200). The Profile and CV were restored.
- **Collections:** `media`, `documents`, `projects`, `certificates`, `skills`, `experience`, `education` and `redirects` all have 0 documents. `media/images` and `media/documents` are empty.
- **Profile:** as seeded (name, title, approved, no biography or portrait).
- **CV:** as default (no file, `downloadVisible: false`, `draft`).
- **`payload_migrations`:** `20260927_181450_initial` and `20260928_073607_phase6_image_derivatives`.
- **`payload_locked_documents`:** 0.
- **Audit log:** 834 rows. This is expected: the log is append-only and admin-only (Phase 5 precedent).
- **Server:** the preview server was stopped.

**Visual QA result:** pass. No regressions found. The only observations are stock Payload behaviour (a table scrolling inside its container on narrow screens; "Edit Image" hidden at phone width) and a capture artefact (lazy-loaded gallery tile).

## 17. Public-site regression

- **E2E:** the full public suite (desktop and mobile projects) is green in both clean runs. This includes the Phase 3/4 shell, SEO, i18n and route-gate tests.
- **Rendering changes:** public pages change only where a CMS image is rendered. They now use a derivative and omit images without locale alt text.
- **Components:** no public component or style changed.

## 18. Performance

Critical-path JS (browser `transferSize` of the scripts referenced by the server HTML), production build. The markers scanned for were `sharp`, `libvips`, `optimizationStatus`, `imageDimensionProblem`, `pdfActiveContent` and `importApprovedPortrait`.

| Route | Phase 5 | Phase 6 |
|---|---|---|
| `/`, `/ar` | 167,256 B | 167,256 B |
| `/projects` | 166,763 B | 166,763 B |
| `/about`, `/experience`, `/certificates`, `/cv` | 165,509 B | 165,509 B |
| `/skills`, `/contact` | 159,598 B | 159,598 B |

- All routes are ≤ 170 KB and unchanged byte for byte.
- **Re-measured at closure** against the fresh build: identical figures on all 9 routes, all HTTP 200.
- **Markers scanned for in every loaded chunk (none found):** `sharp`, `libvips`, `optimizationStatus`, `imageDimensionProblem`, `pdfActiveContent`, `importApprovedPortrait`, `@payloadcms`, `PublicStatus`, `getOverview`, `Portfolio CMS`, `On the public site`, `payload-toast`, `Portfolio overview`.
- **No new client-side JavaScript was added in Phase 6.** All media logic runs on the server or in the CMS.
- No CMS or media-pipeline code appears in any loaded chunk.
- **Image weight:** for the same 1600 × 900 source, the public cover is the WebP derivative instead of the original JPEG. Images are cached immutably for one year.

## 19. Risks

**New:**
- **R-50** (LOW, accepted): the Payload session race.
- **R-51** (LOW, open, Phase 9): static PDF/image checks only.
- **R-52** (MEDIUM, open, Phase 9): media volume backup.

**Carried forward:**
- **R-45** (HIGH, open): tag invalidations are in-memory. Image URLs are immutable and unique per upload, so a stale page shows a previous image that still exists — unless that image was deleted. Decision in Phase 9.
- **R-46** (HIGH, open): the CMS still holds no real portfolio content. The pipeline is ready for the owner.
- **R-39** (LOW, open): Payload logs access denials at ERROR level. It now also covers anonymous requests for private originals (404 from our handler, which is not logged as an error) and archived files (403, which is logged). Phase 9.
- **R-35** (MEDIUM, open): there is no email adapter. Unchanged; Phase 9.
- **R-48** (LOW): the hidden Site Settings global; Phase 7.
- **R-49** (LOW, accepted): the dashboard status reflects the last save. The new image notes follow the same rule.

## 20. Deferred work

| Item | Phase |
|---|---|
| AVIF / JPEG-fallback derivatives (only if measured weight requires) | Phase 8 (performance) |
| Antivirus scan and/or PDF re-rendering | Phase 9 |
| Media-volume backup and restore drill; optional S3-compatible storage | Phase 9 |
| Durable cache-tag storage (R-45) | Phase 9 |
| Owner: import/select the portrait, upload real project/certificate media and CV, with EN/AR alt | Owner (R-46) |
| Asynchronous processing (only if uploads become large or slow) | Not planned |

## 21. Git state

Recorded at closure, 2026-09-28.

**Repository**

| Item | State |
|---|---|
| Branch | `main`, tracking `origin/main`, **not ahead or behind** (`## main...origin/main`) |
| HEAD | `af32158fdd23f74ef7dc313fea07565f2e33c543`, "feat: add the bilingual Next.js portfolio shell" (Phase 1, 2026-09-27) |
| Commits | `889d6c7` baseline → `af32158` Phase 1. **No commit was created in Phase 6** (reflog: the last entry is the Phase 1 commit) |
| Staged changes | none (`git diff --cached` is empty) |
| Pushed | nothing pushed in Phase 6 |
| `git status --short` | 91 entries: 37 `M`, 3 `D`, 51 `??` |

**What the working tree contains**
- **Previous phases, committed:** the specification, Phase 0 deliverables, `portrait.jpg` (`889d6c7`), and the Phase 1 shell (`af32158`).
- **Phases 2–5, uncommitted:** these were never committed either. This includes:
  - the Payload CMS (`src/cms/`, `src/payload.config.ts`, `src/app/(payload)/`);
  - the Phase 3 scene (`src/scene/`, `src/components/cinematic/`);
  - the Phase 4 pages and components;
  - the Phase 5 dashboard;
  - the Docker files;
  - the reports for Phases 2–5;
  - their modifications to tracked files (for example `package.json`, `messages/*.json`, `src/components/shell/*`), and the deletions `src/config/home.ts`, `src/config/profile.ts` and `src/lib/i18n/available.ts` (Phase 2).
- **Phase 6, uncommitted.** The files modified after the Phase 5 closure (file-modification audit, `find -newer` over the source tree excluding generated folders):
  - `docs/architecture/ARCHITECTURE_DECISIONS.md`
  - `docs/architecture/RISK_REGISTER.md`
  - `docs/reports/PHASE_6_REPORT.md`
  - `package.json`
  - `playwright.config.ts`
  - `src/cms/admin/PublicStatus.tsx`
  - `src/cms/admin/public-status.ts`
  - `src/cms/collections/Media.ts`
  - `src/cms/media-policy.ts`
  - `src/cms/portrait.ts`
  - `src/cms/scripts/import-portrait.ts`
  - `src/cms/uploads.ts`
  - `src/components/content/RichText.tsx`
  - `src/content/files.ts`
  - `src/content/payload-adapter.ts`
  - `src/migrations/20260928_073607_phase6_image_derivatives.{ts,json}`
  - `src/migrations/index.ts`
  - `src/payload-types.ts` (regenerated)
  - `tests/cms/media.test.ts`
  - `tests/e2e/media.cms.spec.ts`
  - `tests/unit/media.test.ts`
  - The only other entries are `docs/reports/PHASE_5_REPORT.md` (the Phase 5 closure edit) and `tsconfig.tsbuildinfo` (git-ignored build cache).

**Frozen items, verified**
- `src/components/cinematic/**`, `src/scene/**` and the Phase 4 page components and styles: none modified in Phase 6. The cinematic regression is in §16.4.
- `portrait.jpg`: SHA-256 `1c00fa075b97e2ef8a3460b3d62155052533729994041bd7f562ed5177323fca`, byte-identical and clean in git. It was re-verified before QA and after all test runs.
- `.env`: not modified, not printed and git-ignored.

**Other**
- `media/` is git-ignored and empty after cleanup.
- Docker: only `yazan-portfolio-postgres` was used (queried read-only at closure). No prune; no other container or volume was touched.
- No accidental modifications were found, so nothing had to be restored.

## 22. Final verdict

# PHASE 6 COMPLETE

Every Phase 6 requirement from the roadmap, the Phase 6 prompt, ADR-008/009 and DASHBOARD_SPEC is either implemented and verified, or explicitly deferred to the phase that the ADRs and risk register name.

| Requirement | Evidence |
|---|---|
| Optimized image uploads / image transformation | CMS test "generates every derivative as WebP…"; e2e derivative `-1600x900.webp`; §16.1 derivatives detail |
| Portrait handling (unchanged, hash-verified, no enhancement) | CMS test "approved portrait…"; SHA-256 re-verified (§21); focal-point UI and square crop (§16.1, §16.2) |
| Project media (cover, gallery) | e2e workflow; §16.2 EN and AR project pages |
| Certificate assets (image/PDF) | §16.1 certificate edit; §16.2 certificates page (image derivative); PDF serving policy in e2e (documents are the certificate PDF target) |
| CV upload/download | §16.1 CV global; §16.2 footer and `/cv`; Phase 4/5 e2e |
| Alt text and localized media metadata | unit and CMS tests (no cross-locale fallback); §16.1 AR alt; §16.2 AR omission; dashboard note |
| Safe file validation | CMS tests (pixel limit, PDF active content); unit tests (tokens, limits); existing magic-byte and size tests |
| Private original, no public EXIF/GPS | e2e file serving (anonymous 404, no EXIF); §16.2 "original files served: 0" |
| Caching strategy | e2e headers (immutable / 1 day / nosniff / noindex); ADR amendment; R-45 carried |
| Archive/delete behaviour | e2e archive; §16.1 delete of an in-use archived image refused, unused ones deleted |
| Media optimization status | CMS test ready → failed → ready; §16.1 *Failed* capture; list column |
| Required workflow: dashboard → project → upload → publish → public page | e2e `media.cms.spec.ts` test 1 (real admin UI), green in 4 consecutive runs |
| Public JS ≤ 170 KB, no CMS code in public chunks | §18 (re-measured at closure) |
| Phase 3 cinematic landing unchanged | §16.4 pixel regression within noise |
| Phase 4/5 regression | 155/155 e2e ×2; §16.1 overview; §16.2 |

**Deferred (not Phase 6 scope):**
- AVIF/JPEG fallback → Phase 8.
- Antivirus / PDF re-rendering → Phase 9 (R-51).
- Media-volume backup and restore → Phase 9 (R-52).
- Durable cache-tag storage → Phase 9 (R-45).
- Optional S3-compatible storage → Phase 9.
- Real portfolio content and media → owner (R-46).
- Asynchronous processing → not planned unless uploads prove slow.

**Open risks carried forward:**
- R-45 (HIGH)
- R-46 (HIGH)
- R-52 (MEDIUM)
- R-35 (MEDIUM)
- R-39 (LOW)
- R-48 (LOW)
- R-51 (LOW)
- R-49 and R-50 (LOW, accepted)

Nothing was committed, pushed or deployed. Phase 7 has not been started.
