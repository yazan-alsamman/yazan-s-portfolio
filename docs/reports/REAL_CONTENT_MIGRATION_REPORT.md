# Real Content Migration Report — Legacy Website → CMS

**Date:** 2026-09-28 (migration) · finalized 2026-09-28 (owner decisions) · **Branch:** `main` (HEAD `af32158`, nothing committed) · **Author:** Claude (agent)
**Sources:**
- `https://yazan-alsamman.github.io`, used for content only; its design, markup, CSS and JS were not used;
- the owner's explicit decisions of 2026-09-28, recorded in `docs/content/OWNER_PROFILE.md`.

**Target:** the Payload CMS (development database `yazan_portfolio`), presented by the unchanged Phase 3–7 site.

---

## 1. Executive summary

The real portfolio content is now the CMS source of truth and is public, in English. It has two layers, kept apart.

**1. Legacy-site layer** (`src/cms/legacy/legacy-content.ts`, `pnpm cms:import-legacy`, create-only):
- the site was crawled completely (21/21 pages);
- 16 projects (14 public, 2 drafts);
- 13 skills (names only);
- 28 certificates;
- 1 education entry;
- the English biography, verbatim;
- 27 genuine screenshots through the Phase 6 media pipeline.

**2. Owner-decision layer** (`src/cms/owner/owner-content.ts`, `pnpm cms:apply-owner`); where the two differ, the owner wins:
- public email `yazanalsaamman@gmail.com`;
- GitHub + LinkedIn + Instagram published; Facebook excluded;
- Experience: Chief Technology Officer (CTO) at VegaCORE, plus the stated experience, with no dates;
- Education: Arab International University (AIU), 2026;
- the 28 certificates published without files;
- the CV published as a web CV, with no file.

**Result:** eight public routes carry real content: Home, Projects (plus 14 project pages), About, Experience, Skills, Certificates, CV and Contact.
- SEO audit (production mode): 0 errors across 22 pages.
- Accessibility: 0 violations.
- Tests: all pass.
- Public JS: within budget.
- Cinematic scene: unchanged.
- Arabic: gated.

**Items deliberately left as migrated** (the owner edits them later in the dashboard; §17):
- P8 and P13;
- the P3 repository;
- screenshots;
- project dates and categories;
- featured projects;
- the biography.

**Verdict: REAL CONTENT MIGRATION COMPLETE (§24). READY FOR PHASE 8.**

## 2. Legacy route inventory

Crawl method: breadth-first over same-origin links from `/`, cross-checked against the repository tree `yazan-alsamman/yazan-alsamman.github.io` (GitHub API). The repository has exactly these 21 pages, so there are no hidden routes. All pages returned HTTP 200.

| # | Legacy URL | Purpose | New route | CMS record | Status |
|---|---|---|---|---|---|
| 1 | `/index.html` (= `/`) | Home: about, personal details, counters, skills, interests | `/`, `/about`, `/skills` | Profile (bio), Skills | Migrated (private data, counters, percentages and interests excluded) |
| 2 | `/resume.html` | Summary, education, experience | `/about`, `/cv` | Education; Profile (long bio) | Migrated. Education corrected and experience replaced by owner decisions (§6, §9) |
| 3 | `/services.html` ("certificates") | 29 certificate lines | `/certificates`, `/cv` | Certificates (28) | Migrated and published (owner decision) |
| 4 | `/portfolio.html` | Project index (16 cards) | `/projects` | Projects | Migrated |
| 5 | `/contact.html` | Address, phone, email, non-functional form | `/contact`, `/cv` | Profile email + social links | Migrated per owner decisions. Private data excluded |
| 6–21 | `/portfolio-details_*.html` (16) | One page per project | `/projects/<slug>` | Projects P1–P16 | 14 published; P8 and P13 drafts (owner: leave as is) |

Obsolete, not recreated:
- the legacy contact form (non-functional PHP);
- the counters;
- the "I'm interested in" block;
- the template stock images.

## 3. Content inventory (counts from inspection and from the CMS)

| Category | Found on legacy | Public (EN) | CMS draft | Not migrated |
|---|---|---|---|---|
| Pages | 21 | — (content mapped to 8 routes) | — | — |
| Projects | 16 | 14 | 2 (P8, P13) | 0 |
| Skills | 13 (with %) | 13 (names only) | 0 | 13 percentage values |
| Interests | 9 | 0 | 0 | 9 (no destination; not skills) |
| Certificates | 29 lines / 28 distinct | **28** (owner: without files) | 0 | 1 duplicate line |
| Education | 1 | 1 (owner-corrected: AIU, 2026) | 0 | legacy institution and dates (superseded) |
| Experience | 2 (unusable) | **1** (owner-confirmed: CTO, VegaCORE) | 0 | the 2 legacy entries (no employer; template metrics) |
| Biography / self-description | index about (2 paragraphs + closing line), resume intro, resume summary, 2 taglines, 3 page intros | short bio + 3 long-bio paragraphs | — | resume summary ("3+ years"), the taglines and the page intros |
| Contact / social | 3 social links, 2 emails, phone, address | email (owner's choice), GitHub, LinkedIn (owner URL), Instagram | — | Facebook (owner: no), the second email, phone and address (private) |
| Counters | 4 | 0 | 0 | 4 (invalid metrics) |
| Portfolio images | 103 | 27 | — | 76 (§12) |
| CV | an HTML resume, no file | web CV at `/cv` (owner: without file) | — | no PDF exists; none fabricated |

**Deterministic check:** `pnpm cms:verify-legacy` is read-only and checks both layers; add `BASE_URL` for reachability. Final output:
- projects `{ total: 16, publishedEn: 14, draft: 2 }`;
- skills `{ 13, 13, 0 }`;
- certificates `{ 28, 28, 0 }`;
- education `{ 1, 1, 0 }`;
- experience `{ 1, 1, 0 }`;
- media 27;
- `publishedFixtures: 0`, `unreachable: []`, `errors: []`.

The routes checked for reachability were `/`, `/about`, `/projects`, `/skills`, `/contact`, `/experience`, `/certificates`, `/cv` and the 14 projects.

**Answers to the completeness questions:**
1. **Legacy pages discovered:** 21.
2. **Pages inspected:** 21.
3. **Meaningful records extracted:** 16 projects, 13 skills, 28 certificates, 1 education entry, 2 experience entries, the profile and 103 images.
4. **Migrated:** 16 projects (14 public), 13 skills, 28 certificates (public), 1 education entry, the profile bio and links, and 27 images. Owner-confirmed additions: 1 experience entry, the email, LinkedIn, Instagram and the web CV.
5. **Intentionally excluded:** private data, 4 counters, 13 percentages, 9 interests, 1 duplicate certificate, 2 legacy experience entries, 76 images, the P8/P13 placeholder bodies and Facebook.
6. **Require owner review:** none blocking. The deferred dashboard items are listed in §17.
7. **Projects in the CMS:** 16.
8. **Experience entries:** 1.
9. **Skills:** 13.
10. **Certificates:** 28 (public).
11. **Education records:** 1.
12. **Mock records still published:** none.
13. **Migrated records inaccessible from the intended frontend:** none.
14. **Broken links introduced:** none (the SEO audit checked every internal link; the external profiles are owner-confirmed, and GitHub plus the repositories return HTTP 200).

## 4. Mapping table

| Source → field | Rule |
|---|---|
| Name and title → Profile (unchanged) | Owner-confirmed identity. The legacy job titles are never used |
| Legacy about/resume text → Profile `shortBio`/`longBio` (EN) | Verbatim. Left unchanged by owner decision |
| Owner email → Profile `email` | `yazanalsaamman@gmail.com` |
| Social links → Profile `socialLinks` | GitHub (legacy, HTTP 200), LinkedIn (owner URL, share parameters removed), Instagram (legacy link, `igsh` parameter removed). Facebook never published |
| Skills → Skills `name` + `category` | Percentages dropped |
| Resume education → Education | Degree and description from the legacy resume. Institution and year from the owner: AIU, 2026, `datePrecision: year`, no start date |
| Owner experience statement → Experience (1 entry) | Organization VegaCORE, role "Chief Technology Officer (CTO)", description = the owner's statement; no dates |
| Certificates → Certificates | Name and issuer; legacy wording in `sourceNote`; published without files (owner); no dates, IDs or URLs invented |
| Projects → Projects | As migrated (§5) |
| Screenshots → Media → project cover/gallery | Genuine screenshots only; SHA-256-verified; descriptive alt |
| Resume → `/cv` (CV global "Publish the web CV") | Web CV composed from the CMS entities. No file |
| Every record → `sourceNote` (never public) | Records the source layer (legacy page, or owner decision and date) and any normalisation |

## 5. Projects

These are unchanged since the migration, which the owner asked for. A before/after snapshot of every project field, link, image relation and technology relation is byte-identical.

| Key | Title | Slug | Category | Date | Repository | Images | Status |
|---|---|---|---|---|---|---|---|
| P1 | AI Intelligence Project Management System | `ai-intelligence-project-management-system` | Artificial intelligence | Jan 2026 | — | 0 | Published, featured |
| P2 | Breast Tumor Diagnosis System | `breast-tumor-diagnosis-system` | Artificial intelligence | — | ✔ | 5 | Published, featured |
| P3 | Robot Obstacles Avoidance System (Fuzzy System, Neural Networks) | `robot-obstacles-avoidance-system` | Robotics | — | — | 0 | Published, featured |
| P9 | Project Hub Application | `project-hub-application` | Mobile | — | ✔ | 6 | Published |
| P7 | Car Renting Application | `car-renting-application` | Mobile | — | ✔ | 4 | Published |
| P4 | Student Management Distributed System | `student-management-distributed-system` | Software engineering | — | ✔ | 0 | Published |
| P5 | Services Provider Application | `services-provider-application` | Software engineering | — | ✔ | 0 | Published |
| P6 | Taxi Elite Application | `taxi-elite-application` | Mobile | — | ✔ | 0 | Published |
| P10 | Fitness Mobile Application | `fitness-mobile-application` | Mobile | May 2023 | ✔ | 0 | Published |
| P11 | SmartHome Mobile Application | `smarthome-mobile-application` | Mobile | Feb 2023 | — | 0 | Published |
| P12 | System Management | `system-management` | Web | Mar 2024 | — | 0 | Published |
| P14 | Basic Online E-Commerce Platform | `basic-online-e-commerce-platform` | Web | — | — | 8 | Published |
| P16 | Basic University Management System | `basic-university-management-system` | Software engineering | Jul 2024 | — | 4 | Published |
| P15 | Basic Python Compiler | `basic-python-compiler` | Software engineering | Jul 2022 | — | 0 | Published |
| P8 | Car Rental Mobile Application | `car-rental-mobile-application` | Mobile | Oct 2023 | — | 0 | Draft (owner: leave as is) |
| P13 | E-commerce | `e-commerce` | Mobile | — | ✔ | 0 | Draft (owner: leave as is) |

Notes from the migration still apply:
- the legacy boilerplate paragraph was not migrated;
- P1's "Key technologies" sentence is kept in its Architecture section;
- P9 and P16 use their legacy card text.

## 6. Experience (owner-confirmed)

**Published** (`/experience`, the Home experience section and `/cv`; About links to it):

> **Chief Technology Officer (CTO)** — VegaCORE
> More than four years of professional experience in the technology market, with a focus on systems analysis, requirements analysis, evaluating appropriate technologies, and designing and building technology solutions.
> Currently serving as Chief Technology Officer at VegaCORE.

- **Source:** the owner's statements. "More than 4 years of experience in the labor market, including systems analysis, requirements analysis, and building solutions using appropriate technology", and "CTO of VegaCORE".
- **Not invented:** no start or end date, no month, no other employer, no clients, team sizes, counts or metrics. The unit test asserts that the text contains no digits.
- **Schema:** the Experience start date was a required field in the dashboard. It is now optional, with help text saying to leave it empty rather than guess. The database column was already nullable, so no data change was needed. With no dates, the period column is empty (R-58).
- **Route:** `/experience` is now live through the existing route-availability logic (published, approved, non-empty). It appears in the navigation, the footer and the sitemap, with a self-canonical URL.
- **Legacy entries:** the two legacy experience entries ("Junior Development specialist", "informatics technologie specialist") remain unmigrated. They name no employer and contain template metrics.

## 7. Skills

13 published, unchanged:
- HTML, CSS, JavaScript (Frontend);
- Java, Python, C++ (Programming);
- PHP, ASP.NET (Backend);
- Flutter (Mobile);
- SQL database engineering (Databases);
- Arduino, Cyber Security, Problem Solving (Other).

No percentages.

## 8. Certificates (published without files — owner decision)

**All 28 are published in English**, using the existing records. No duplicates were created: they are matched by name and issuer.
- **chyiar academy:** HTML, CSS, Bootstrap, JavaScript, PHP, MySQL, ASP.NET.
- **X-academy focalX:** Front-end Developer, React, Node.js, MongoDB, Back-end.
- **Wael abo hamzeh INC:** Dart, Flutter, Firebase, State Management, SQFlite.
- **Syrian Scientific Society for Informatics:** Arduino, Arduino ARC, WRO, A+, Computer Network ARC, Networking.
- **Security Blue Team Academy:** OSINT, Penetration Testing, Threat Hunting, Incident Response, Cyber Security (listed twice on the legacy site; one record).

Only the name and issuer are shown. There are no files, dates, credential IDs or verification URLs, and none were invented. The word "license" appears nowhere on the page (verified). The legacy wording is kept in each record's private `sourceNote`, together with the owner decision.

The dashboard help text for the attachment now says "Certificate image or PDF, if available". `/certificates` is live, in the sitemap and self-canonical, with 0 axe violations.

## 9. Education (owner-corrected)

| Field | Value | Source |
|---|---|---|
| Degree | Bachelor of Information Technology | Legacy resume (unchanged) |
| Institution | **Arab International University (AIU)** | Owner (overrides the legacy "European Internaional University, EIU") |
| Dates | **2026** (graduation year; year precision; no start date, no month) | Owner (overrides the legacy "2021 – 2025") |
| Description | "During my studies, I gained a strong foundation in information technology, …" | Legacy resume (unchanged) |

Rendered as "2026" on About and CV (verified). "European", "EIU" and "2021" no longer appear publicly.

## 10. Contact / social (owner decisions)

| Channel | Public value | Where it appears | Note |
|---|---|---|---|
| Email | `yazanalsaamman@gmail.com` | `/contact`, `/cv` | The owner's choice; the other legacy address appears nowhere (verified) |
| GitHub | `https://github.com/yazan-alsamman` | Contact, CV, footer, `Person.sameAs` | Legacy link; HTTP 200 |
| LinkedIn | `https://www.linkedin.com/in/yazan-alsamman-7541a434` | Contact, CV, footer, `Person.sameAs` | Owner-verified. Android share parameters removed. LinkedIn blocks automated checks (HTTP 999), so it was **not** verified automatically. It differs from the legacy follow link's ID (`…7541a4349`); the owner's URL wins |
| Instagram | `https://www.instagram.com/yazan_al_samman` | Contact, CV, footer, `Person.sameAs` | The legacy site's link without its `igsh` share parameter; the owner said yes |
| Facebook | — | nowhere | The owner said **no**. 0 occurrences in all public HTML, the sitemap and robots (verified). The legacy URL remains only in this report's history and the Phase 0 inventory |

`Person.email` is not emitted: the Phase 7 structured-data architecture (SEO_MASTER §22) does not include it. The email is on the pages.

## 11. Media

27 genuine screenshots (P2 5, P9 6, P7 4, P14 8, P16 4), downloaded from the legacy site and SHA-256-verified, then run through the Phase 6 pipeline. Optimization status "Ready" for all 27, with descriptive English alt text. They are unchanged in this step.

## 12. Images not migrated (76), with reasons

| Reason | Count | Images |
|---|---|---|
| AI-generated renders, not screenshots (garbled text, nonsensical charts) | 31 | P1 (6), P3 (7), P4 (7), P5 (11) |
| Third-party UI-kit / Dribbble-style designs; ownership unclear | 36 | P6 (26), P10 (3), P11 (4), P8 (3) |
| Stock-photo device mockups | 7 | P13 cover, P12 (3), P2 cover, P9 cover, P7 cover |
| Trademark logo | 1 | P15 (Python logo) |
| Personal data | 1 | P14 screenshot 8 (phone numbers of the owner and two other people) |

Also not migrated:
- the legacy portrait (superseded by the approved `portrait.jpg`, unchanged; SHA-256 `1c00fa07…3fca`);
- the logo and icons;
- 37 unlinked repository images (template stock and duplicates).

Missing screenshots are left as they are (owner decision, §17).

## 13. Mock content

There was none: before the migration the development CMS held only the confirmed identity. The E2E suite uses its own `yazan_portfolio_e2e` database and a temp media directory, so test fixtures never touch the real content. This was verified after four more full E2E runs: identical counts, 0 fixtures.

## 14. Content not migrated (complete list)

1. **Private data:** date of birth/age, phone numbers, address and neighbourhood, city as home location (Category C).
2. **The 4 counters.**
3. **13 skill percentages.**
4. **9 interests.**
5. **Legacy job titles.**
6. **Resume "3+ years" summary sentence:** superseded by the owner's "more than 4 years" statement.
7. **Footer and contact taglines.**
8. **Page intro blurbs.**
9. **Project boilerplate paragraph.**
10. **Project "Client" values:** no field, and unconfirmed.
11. **P8 and P13 legacy bodies:** the records stay drafts, as migrated.
12. **The 2 legacy experience entries.**
13. **The second legacy email.**
14. **Facebook:** owner decision.
15. **1 duplicate certificate line.**
16. **76 images:** §12.
17. **Non-functional contact form.**

## 15. Normalisations (spelling/format only)

As in the migration:
- "rending" → "renting";
- "Pyhton" → "Python";
- "freindly" → "friendly";
- "AI powered" → "AI-powered";
- "engeneering" → "engineering";
- "mangoDB" → "MongoDB";
- "Devloper" → "Developer";
- plus casing.

Owner URLs: share and tracking query parameters removed (LinkedIn `utm_*`, Instagram `igsh`). The "Internaional" spelling fix is superseded by the owner's institution (AIU).

## 16. Conflicts

| ID | Conflict | Resolution |
|---|---|---|
| C-1 | Education 2021–2025 vs the P1 graduation project dated January 2026 | **Resolved by the owner:** AIU, graduation 2026 |
| C-2 | Two legacy emails | **Resolved by the owner:** `yazanalsaamman@gmail.com` |
| C-3 | P14 dated 2018 vs 2023 screenshots | Left as migrated (date omitted). Owner: dashboard later |
| C-4 | P5, P7 and P15 legacy categories | Left as migrated. Owner: dashboard later |
| C-5 | P4 and P10 card copy errors | Detail pages used (no owner action needed) |
| C-6 | P3 links to P2's repository | Left as migrated (no link). Owner: dashboard later |
| C-7 | P8's contradictory legacy content | Left as a draft. Owner: dashboard later |
| C-8 | Legacy experience dates vs "3+ years" | **Superseded by the owner's statement** (more than 4 years; CTO of VegaCORE; no dates) |
| C-9 | P9 may be an earlier version of P1 | Left as two records. Owner: dashboard later |
| C-10 | LinkedIn ID: legacy follow link `…7541a4349` vs owner URL `…7541a434` | **The owner's URL is used** |

## 17. Owner decisions applied and deferred dashboard editing

**Applied (2026-09-28):**
1. Identity unchanged: Yazan Al Samman / يزن السمان, Artificial Intelligence Engineer. The legacy titles are not used.
2. Experience: CTO at VegaCORE plus the stated experience, with no dates (§6).
3. Certificates: all 28 published without files (§8).
4. Public email `yazanalsaamman@gmail.com` (§10).
5. LinkedIn published (canonical URL) (§10).
6. Facebook not published (§10).
7. Instagram published (§10).
8. CV published as a web CV without a file (§18).
9. Education: Arab International University (AIU), 2026 (§9).

**Deliberately left unchanged** (owner decision; to be edited later in the dashboard). A snapshot diff of all project fields, links and relations and of the biography is byte-identical before and after:
- **P8, Car Rental Mobile Application:** draft, unchanged.
- **P13, E-commerce:** draft, unchanged.
- **P3 repository:** no link, unchanged.
- **Missing project screenshots:** none added.
- **Project dates and categories:** unchanged.
- **Featured projects:** P1–P3, unchanged.
- **Biography:** unchanged (migrated legacy text).

`pnpm cms:import-legacy` is now create-only, so re-running it can never overwrite these later dashboard edits or the owner decisions.

## 18. CV (web, no file)

- The CV global gains **"Publish the web CV"** (per locale). It is on for English and approved; Arabic is untouched (draft).
- `/cv` is live, indexable and in the sitemap. It is composed from the CMS:
  - name;
  - title ("Artificial Intelligence Engineer");
  - summary (the short biography);
  - experience (CTO, VegaCORE);
  - education (AIU, 2026);
  - skills (13);
  - certificates (28);
  - contact (email, GitHub, LinkedIn, Instagram).
- **No PDF:** no PDF exists and none was generated. The download link, the version line and the footer's "Download CV" link appear only when a PDF is published (verified: 0 download links).
- **Wording:** the CV meta description no longer mentions a downloadable PDF (EN; the Arabic string was shortened the same way by deletion only, and stays under copy review).
- **Excluded data:** no phone number, address, birth date, dates or metrics.

## 19. Arabic status

- **Gated, unchanged.**
- No Arabic content was written, translated or approved: every record's Arabic Translation status is "Draft" (verified: 0 approved in Arabic). The CV web-CV flag is off for Arabic, and `copy-review.ts` is still pending.
- **Production:** `/ar`, `/ar/cv`, `/ar/experience` and `/ar/certificates` all return 404. There is no Arabic hreflang and there are 0 `/ar` URLs in the sitemap.

## 20. SEO verification (production mode, `SITE_URL=https://yazanalsamman.com`)

`pnpm seo:audit`: **0 errors**. 22 pages crawled, 22 sitemap URLs, 28 URLs checked:
- Home, Projects, About, **Experience**, Skills, **Certificates**, **CV**, Contact;
- 14 projects.

Every page has:
- one H1;
- a unique title and description;
- a self-canonical HTTPS URL;
- reciprocal hreflang (`en` + `x-default`);
- valid JSON-LD without placeholders;
- a reachable `og:image`;
- no broken internal links;
- sitemap ↔ indexability consistency.

`Person`:
- name and `jobTitle` confirmed;
- `sameAs` = GitHub, LinkedIn, Instagram exactly (no Facebook);
- no email property (not in the architecture).

Other checks:
- 0 occurrences of "facebook" or of the other legacy email in all public HTML, the sitemap and robots;
- P8 and P13 return 404;
- robots unchanged.

## 21. Test results (exact)

| Command | Result |
|---|---|
| `pnpm typecheck` | clean |
| `pnpm lint` | clean |
| `pnpm format:check` | "All matched files use Prettier code style!" |
| `pnpm test` | **86 passed** (11 files: 80 + 6 in `owner-content.test.ts`) |
| `pnpm test:cms` | **49 passed** (4 files) |
| `pnpm build` (production mode, real content) | success |
| `pnpm test:e2e` (isolated `_e2e`), run 1 | **164 passed, 33 skipped, 0 failed**; 0 server errors |
| `pnpm test:e2e`, run 2 | **164 passed, 33 skipped, 0 failed**; 0 server errors |
| `pnpm cms:import-legacy` / `pnpm cms:apply-owner`, each run twice | idempotent; the legacy re-run changes nothing ("profile fields filled: none") |
| `pnpm cms:verify-legacy` (+ `BASE_URL`) | `errors: []`, `unreachable: []` |
| `pnpm seo:audit` (production mode) | 0 errors, 22 pages |
| Public axe (WCAG 2.0/2.1/2.2 A+AA), 9 pages × 3 modes | **0 violations** in 27 runs; overflow 0 |

**Earlier migration incidents**, fixed and still documented:
- the invalid-locale metadata guard;
- the admin robots-tag race (R-57).

## 22. Visual regression and performance

- **Design:** no redesign. The layouts are unchanged; only content and state changed.
- **Captures:** 21 new captures (1440 dark and light, 390 dark) of Home, About, Experience, Certificates, CV, Contact and a long project page (P9, 6,986 px). 0 overflow and 0 broken images.
  - On a 390 px phone the long email address wraps inside its column, following the existing contact-page style (no overflow).
- **Rendering changes (not redesign):**
  - Experience entries without dates show no period;
  - the CV page gains sections built from the existing list components (summary, certificates, contact) and hides the download block without a PDF.
- **Cinematic regression** against the approved Phase 3 frames:
  - 16 act frames are within run-to-run noise (≤ 0.36);
  - the 3 "transition" frames differ only because the development placeholder panel beneath the scene is replaced by the real Introduction (unchanged since the migration check: 0.95 / 1.89 / 0.77).
- **Public JS:** at most 167,407 B on `/` (unchanged; ≤ 170 KB). The others: `/projects` 166,937 B; `/about`, `/experience`, `/certificates`, `/cv` 165,660 B; `/skills`, `/contact` 159,749 B. 0 CMS markers in public chunks. No new client components.

## 23. Files and database changes (this finalization)

**New:**
- `src/cms/owner/owner-content.ts`
- `src/cms/scripts/apply-owner-content.ts`
- `src/migrations/20260928_125526_owner_content_decisions.{ts,json}`
- `tests/unit/owner-content.test.ts`

**Modified:**
- `src/cms/collections/content.ts` (Experience start date optional; certificate attachment help text)
- `src/cms/globals.ts` (`instagram` network; "Publish the web CV")
- `src/content/{types,payload-adapter}.ts`
- `src/lib/social.ts`
- `src/components/portfolio/ExperienceList.tsx`
- `src/components/shell/SiteFooter.tsx`
- `src/app/[locale]/cv/page.tsx`
- `src/cms/admin/public-status.ts`
- `src/cms/scripts/import-legacy.ts` (create-only)
- `src/cms/scripts/verify-legacy.ts` (owner checks)
- `src/migrations/index.ts`
- `src/payload-types.ts` (regenerated)
- `messages/en.json`, `messages/ar.json` (the CV description no longer promises a PDF)
- `package.json` (`cms:apply-owner`)
- `docs/content/OWNER_PROFILE.md`
- `docs/architecture/{ARCHITECTURE_DECISIONS,RISK_REGISTER}.md`
- this report

**Database** (only `yazan-portfolio-postgres`):
- migration `20260928_125526_owner_content_decisions` (additive, reversible: an enum value and one column);
- dev data: Profile email and social links; 1 experience entry; education corrected; 28 certificates published; the CV web flag (EN).

No other container, volume or project was touched.

## 24. Final migration verdict

# REAL CONTENT MIGRATION COMPLETE

Every item from the migration's stop conditions is satisfied:
- legacy site crawled (21/21);
- complete inventory;
- data extracted and mapped to the existing CMS;
- no mock content;
- projects migrated;
- experience migrated (owner-confirmed);
- skills migrated;
- certificates migrated and public (owner-authorised, without files);
- education migrated (owner-corrected);
- contact and social links (email, GitHub, LinkedIn, Instagram; no Facebook);
- safe media migrated;
- nothing silently discarded (§12, §14);
- conflicts documented or resolved (§16);
- owner decisions applied, and the deferred items explicitly preserved (§17);
- Arabic gate preserved;
- SEO architecture preserved (audit 0 errors);
- all public routes and all 14 project pages verified;
- accessibility verified;
- tests pass;
- production build passes;
- git state documented.

The CMS is the source of truth for all real content; nothing is hardcoded in components.

## 25. Phase 8 readiness — READY FOR PHASE 8

Phase 8 (ROADMAP "Performance & 3D Hardening"; `prompts/08_PERFORMANCE_3D_HARDENING.md`) must measure, then optimize based on evidence:
- build size and JS bundles;
- initial load and image sizes;
- 3D asset sizes;
- desktop, laptop and mobile FPS;
- GPU/CPU pressure;
- memory and resource disposal;
- layout stability;
- reduced motion.

Its report is `docs/reports/PHASE_8_REPORT.md`, with before/after measurements.

**Exact starting state** (measured on this build, real content, production mode):

- **Public critical-path JS** (browser `transferSize` of the scripts referenced by the server HTML):

  | Route | Bytes |
  |---|---|
  | `/` | 167,407 |
  | `/projects` | 166,937 |
  | `/about`, `/experience`, `/certificates`, `/cv` | 165,660 |
  | `/skills`, `/contact` | 159,749 |

  Budget ≤ 170 KB; headroom about 2.6 KB on `/` (R-41).
- **Cinematic scene:** unchanged since the Phase 3 approval. Its lazy scene chunk (three + R3F) was about 250 KB gzip in Phase 3 (R-06). The Low tier renders WebGL on phones (R-43, untested on real devices).
- **Real content now present:** 14 project pages. Images are served as WebP derivatives, with portrait screenshots contained; the longest page is P9 at 6,986 px (1440 wide).
- **Open Phase 8 items in the risk register:**
  - R-06 (3D weight and Core Web Vitals);
  - R-31 (Arabic font preload);
  - R-41 (JS headroom);
  - R-43 (phones and WebGL);
  - R-54 (cross-locale prefetch 404s);
  - the AVIF/JPEG fallback evaluation (Phase 6 deferral).
- **Tooling available:**
  - `scratchpad/p5/crit.mjs` (critical JS), `pnpm seo:audit` and the axe scripts;
  - the cinematic regression harness (`scratchpad/p6/regress.mjs`, approved Phase 3 frames);
  - `pnpm cms:verify-legacy`;
  - the isolated E2E suite (164 tests).
- **Repository:** `main` @ `af32158`, with the Phases 2–7 and migration work uncommitted (§ Git state in the final summary).

Phase 8 has **not** been started.
