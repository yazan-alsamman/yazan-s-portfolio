# Phase 13 Report — Content Authority, Case-Study Depth & Final Polish

**Date:** 2026-09-29 · **Branch:** `main` · **HEAD:** `73cb15f` (unchanged). Nothing was committed or pushed.

**Measurement labels:**

- **REAL HW**: Lenovo Legion 5 laptop (Ryzen 7 5800H), headed Chrome, AMD iGPU.
- **SIMULATED**: the same laptop with 390×844 touch emulation.
- **NOT MEASURED — reason**: nothing was estimated.

The companion document with every content decision is `docs/reports/PHASE_13_CONTENT_REVIEW.md`.

---

## 1. Executive Summary

Phase 13 changes what the portfolio **says and proves**, not how loud it looks. There is no new 3D object, effect or colour.

**Content authority.** The owner approved three changes in the session. They were implemented through the repository's owner-content channel (`src/cms/owner/owner-content.ts` → `pnpm cms:apply-owner`), after a database backup, and verified with `pnpm cms:verify-legacy` (0 errors):

1. an **AI Engineer short bio**, built only from facts already in the CMS;
2. an **AI & machine learning** skill category with the six techniques the owner's own project texts name: large language models, neural networks, fuzzy logic, FAISS vector retrieval, expert systems, algorithm design;
3. **technology links** for the two projects whose texts name them: AI project management (12 technologies) and robot navigation (2).

**Evidence-driven presentation:**
- **Skills.** Every skill now shows its evidence: the projects that use it, and certificates whose name matches exactly (for example Flutter · Wael abo hamzeh INC; Node.js · X-academy focalX). There are no ratings.
- **Project pages** are engineering dossiers:
  - category and year above the title;
  - the repository as the primary action;
  - the stack **grouped by architecture layer** (Intelligence / Interfaces / Services / Data);
  - on-page contents;
  - numbered case sections;
  - numbered figures captioned with the owner's descriptions.
- **About and CV** gain a shared "Selected work" evidence list. The CV now carries projects.
- **Certificates** get an issuer index.
- **JSON-LD** gains `Person.knowsAbout` and `CreativeWork.keywords`, from CMS data only.

**Budgets and checks:**

| Check | Result |
|---|---|
| Critical JS `/` | 164,524 B (unchanged) |
| Critical JS `/projects` | +39 B |
| Scene chunk | byte-identical |
| CSS | +68 B gzip |
| Idle / offscreen / pointer-idle rendering | 0 |
| Frames over 33 ms | 0 |
| axe | 0 violations |
| Horizontal overflow (90 checks) | 0 |
| SEO | 22 pages, 0 errors |
| Unit / CMS tests | 109/109, 49/49 |
| E2E | 164 passed, 0 failed, run twice |
| Approved acts vs Phase 12 | ≤ 0.29 mean absolute difference |

**21st.dev MCP:** attempted, and still **not available** (§11).

## 2. Content Audit

The full matrix is in the content review, §3. Findings:

| Project | Finding |
|---|---|
| **AI Intelligence Project Management System** | The only project with real engineering depth in the CMS: an overview plus a detailed architecture (LLMs, neural network + FAISS, greedy assignment, expert system, full stack) |
| **Breast Tumor Diagnosis** | Summary, repository and 4 real figures, but no text |
| **Robot Obstacles Avoidance** | Title and summary only |

- The Problem / Approach / Results fields are empty on **all 14** projects.
- 7 projects have repositories, 6 have a year, and 5 have real imagery.
- **Owner input is required for depth** (content review §7, §11). **Nothing was authored on the owner's behalf.**

## 3. AI Engineer Positioning

**Identity → domains → evidence:**

| Surface | Content |
|---|---|
| Hero | Unchanged: title; Focus "Artificial intelligence · Robotics" |
| Home introduction | The **new bio**, beside the verified spec sheet (role, education, disciplines) |
| Skills | An **Intelligence** layer (L5) now tops the capability stack, each technique linked to its project evidence |
| Project pages | "What was built → how → with what", by layer |
| Structured data | `knowsAbout` lists the intelligence techniques first |

The **long bio** is still the legacy text. It is not approved; the proposal is in content review §10.

## 4. Case-Study Improvements

`src/app/[locale]/projects/[slug]/page.tsx`

- **First viewport:**
  - discipline and year above the title;
  - the summary;
  - the **repository** as the primary action, labelled with the CMS label; it no longer repeats in the Links section;
  - the spec sheet: role, timeline, category and context when present, plus the **technologies grouped by layer** (each linking to its skill).
- **Contents:**
  - `nav` "Contents" lists the case sections that exist (numbered) and Media/Links;
  - it is rendered only with ≥ 2 entries;
  - the anchors use the existing scroll padding under the sticky header.
- **Sections:**
  - Overview → Problem → Approach → Architecture → Results, numbered, only when the CMS has content;
  - the CMS has no "Implementation" field. Adding one is a schema change that was **not** made; content review §7 records the recommendation.
- **Figures:**
  - real screenshots are registration-marked, with a visible caption "Fig. 0n — <owner's description>";
  - the caption is hidden from assistive technology, which already reads the identical alt text.
- **Rows:** the stack line shows 6 items plus "+N". The full list stays in the accessibility tree and on the project page.

## 5. Project Imagery

Honest by construction:
- real imagery (5 projects) is used as the cover and numbered figures;
- the other 9 projects keep the deterministic schematic, always captioned "Schematic · no published imagery";
- no screenshot was generated.

**Recommended:** real figures for the two strongest AI projects (content review §8).

## 6. Skills

- The capability stack is kept.
- The new L5 **Intelligence** layer holds 6 techniques. Interfaces, Services and Data gain the 6 approved technologies.
- **Evidence:**
  - projects come through the CMS join;
  - certificates come from an **exact, case-insensitive name match** only (no fuzzy matching);
  - skills without evidence show none. Nothing is implied.
- No bars, percentages, stars, badges or years.

## 7. About · Experience · Certificates · CV

**About:**
- lead with the new bio;
- profile sheet (title, role, education, focus);
- the long bio (legacy, pending approval);
- **Selected work** evidence (featured projects: discipline, year, technology count);
- education.

**Experience:**
- unchanged; no dates exist in the CMS, so none are inferred;
- the VegaCORE start date is an owner action.

**Certificates:**
- the issuer-grouped register is kept;
- a new **issuer index** of jump links with counts, in the register's order and ids;
- dates, credential IDs and verification URLs are absent in the CMS (owner action §11).

**CV:**
- inherits everything from the same CMS: new bio summary, experience, **selected work (new)**, education, the capability stack with the Intelligence layer, and certificates grouped by issuer;
- there is no separate content source.

## 8. Homepage Hierarchy

**01 Identity** (hero) → **02 What I build** (introduction: the new bio plus the spec sheet) → **03 Selected work** → **04 Technical expertise** (stack, Intelligence first) → **05 Experience + 06 Certificates** (evidence) → **Contact**.

- Contrast comes from scale and structure; no colour was added.
- The section keys are unchanged (the E2E contract).

## 9. Visual Polish

- The duplicate repository link was removed from project pages.
- Long stack lines are truncated in rows.
- A lone spec cell is width-constrained (Phase 12).
- Numbered figure captions were added.
- The contents row gives the long AI case study a scannable top.
- Reading measure is bounded at 68ch (`.rich-text`), in the UI/UX Pro Max 65–75 range.
- No gradients, glass, particles or motion were added.

## 10. UI/UX Pro Max

Loaded and queried (`scratchpad/p13/uiux-p13.txt`).

| Query (domain) | Recommendation | Decision |
|---|---|---|
| "long form reading line length" (ux) | 65–75 characters per line; body line height 1.5–1.75 | **Adopted / verified:** `.rich-text` max 68ch; body 1.6 |
| "table of contents anchor navigation" (ux) | `scroll-behavior: smooth`; sticky-nav padding | Padding **kept** (existing `scroll-padding`). Smooth scroll **rejected**: it would animate every programmatic scroll the scroll-driven cinematic and its deterministic QA harnesses rely on, and the reduced-motion contract already governs motion. |
| "image caption figure alt" (ux) | Descriptive alt for meaningful images | **Adopted:** existing owner alt text, now also a visible numbered caption (aria-hidden to avoid duplication) |
| "information density progressive disclosure" (ux) | Heading line balance: bound the measure, no hard breaks | **Adopted:** `text-wrap: balance` with a bounded measure; rows truncate stacks (+N), the full list is on the page |
| "trust credibility evidence" (landing) | Trust & Authority: hero → **proof (certs, stats)** → solution → CTA | **Adopted** as skills → evidence (projects, certificates) and About/CV "Selected work". **Rejected:** logos, badges and stats not in the CMS |
| "case study storytelling" / "storytelling" (landing) | **0 results**, retried once | No database match; general structure kept (content review §7) |
| "editorial serif long read" (style) | Editorial grid: figure/figcaption and section dividers; drop caps, pull quotes, serif body | figure/figcaption and dividers **adopted**. Drop caps, pull quotes and serif body **rejected**: brand typography, and no quotes exist to pull. |

## 11. 21st.dev MCP

| Item | Status |
|---|---|
| Available | **No.** A tool search at the start of the phase returned no 21st.dev tools. |
| Reason | It is configured only for the `C:/Users/Lenovo` project scope, so it does not load in this repository |
| Bypass | **None.** No configuration read, no direct API call, no credential printed, stored or committed. |
| Resources and patterns used | **None** |
| Key rotation | The key displayed during the design-evolution phase is **still flagged for rotation** (owner action) |
| To enable | `claude mcp add --scope user …` with a rotated key, then restart Claude Code in this repository |

## 12. Responsive · RTL · Accessibility

**Responsive:**
- 9 viewports × 10 routes (320×800 … 1920×1080): **0 horizontal overflow** (90 checks);
- the About portrait is wider than its crop frame by design, clipped by that frame; no page overflow;
- mobile project page order: title → discipline/year → summary → repository → spec sheet (the stack stacks) → figure → contents → sections.

**RTL:**
- the new layout uses logical properties only (`start`/`end`, `border-inline`, grid);
- the Arabic gate is **closed** (`/ar`, `/ar/projects` return 404 in production);
- `copy-review.ts` is unchanged;
- the new Arabic strings are drafts (the parity and no-duplicate tests pass);
- RTL rendering of the new project/skills/certificates structure with **Arabic content** is **NOT MEASURED**: Arabic content is unapproved, so those pages have no Arabic content to render.

**Accessibility:**
- axe WCAG 2.0/2.1/2.2 A + AA: **0 violations** / 36 checks (12 routes × 3 modes);
- keyboard focus is visible;
- **Semantics:**
  - Contents is a labelled `nav` with real links;
  - the stack is a nested `dl`;
  - evidence is text;
  - schematics and marks are `aria-hidden`, with visible captions;
  - no information exists only visually.
- **Fallbacks:**

  | Case | Mode | Canvas | Scene chunk | Drawing | Errors |
  |---|---|---|---|---|---|
  | Save-Data | static | 0 | not downloaded | visible | 0 |
  | Low memory | static | 0 | not downloaded | visible | 0 |
  | No WebGL2 | static | 0 | not downloaded | visible | 0 |

  Reduced motion and chunk failure are covered by the E2E suite.

## 13. SEO · Structured Data · CMS Integrity

**SEO:**
- `pnpm seo:audit`: **22 pages, 0 errors**;
- H1 contracts, canonicals, hreflang (`en` + `x-default`), sitemap and robots are unchanged;
- the new content is server-rendered HTML;
- project pages now expose the stack, contents and figure captions as text.

**Structured data:**
- `Person.knowsAbout`: published skill names, intelligence first;
- `CreativeWork.keywords`: the project's linked technologies;
- both are emitted only when present;
- no reviews, ratings, employers or dates were added (`worksFor` stays absent, per the existing policy).

**CMS integrity:**
- the flow is still adapter → contract → page;
- content changes were made **only** through the owner-content script (idempotent; skills create-only; existing project technology links kept);
- the verifier was updated to accept the owner-approved bio (it still errors on any other value);
- `cms:verify-legacy`: 0 errors;
- skills: 25 published; projects: 14 published, 2 drafts; certificates: 28;
- **DB backup** before the change: `scratchpad/p13/pre-phase13.dump` (326,133 B, `pg_restore --list` verified).

## 14. Performance

Phase 12 HEAD build versus the Phase 13 build, REAL HW / SIMULATED phone:

| Measure | Phase 12 HEAD | Phase 13 |
|---|---|---|
| Critical JS `/` | 164,524 | **164,524** |
| Critical JS `/projects` | 164,458 | 164,497 (+39) |
| Critical JS `/about`, `/experience`, `/certificates`, `/cv` | 162,755 | 162,755 |
| Critical JS `/skills`, `/contact` | 157,144 | 157,144 |
| Scene chunk (gzip) | 252,993 | **252,993** (identical) |
| Public CSS (gzip) | 11,680 | 11,748 (+68) |
| Portrait | 71,666 B | 71,666 B (SHA-256 `1c00fa07…323fca`) |
| Shader compile, desktop | 359 ms | 344 ms |
| Shader compile, phone | 259 ms | 226 ms |
| First WebGL frame, desktop | 1,752 ms | 1,718 ms |
| First WebGL frame, phone | 1,609 ms | 1,564 ms |
| Draw calls / triangles | 19 / 12,006 | 19 / 12,006 |
| Idle, offscreen, pointer-idle draws | 0 / 0 / 0 | **0 / 0 / 0** |
| Scroll max / frames over 33 ms | 30.2 ms / 0 | 30.4 ms / **0** |
| Heap after GC | 8.9 MB | 9.0 MB |
| Navigation ×3 (canvas on projects / home; heap) | 0 / 1; 10.6 → 11.1 MB | 0 / 1; 10.6 → 11.1 MB |

The scene code is unchanged, so the compile and first-frame deltas are run-to-run variance.

**Budgets:** critical JS ≤ 170 KB ✅ · scene ≤ 400 KB ✅ · portrait ≤ 150 KB ✅ · idle/offscreen 0 ✅ · 0 frames over 33 ms ✅.

**NOT MEASURED:**
- physical phones;
- per-frame GPU time and GPU memory (no API);
- the High ≥ 60 / Medium ≥ 45 fps targets on real Medium-class hardware;
- Lighthouse and field CWV (not deployed).

## 15. Visual Regression

**Method:** the approved-frame harness (18 frames × 2 runs; `/ar` skipped under the production gate).

| Frames | vs Phase 10 approved | vs Phase 12 HEAD | Verdict |
|---|---|---|---|
| Arrival (01, 09, 15) | 13.2–14.7 | **0.00** | Unchanged since Phase 12 (the Phase 12 hero is the intended difference from Phase 10) |
| Ignition, intelligence (02, 03, 10) | 0.73–1.36 | 0.04–0.29 | Stable |
| Engineering → transition, phone and light acts, portrait (04–08, 11–14, 16–19) | 0.00–0.42 | 0.00–0.17 | **Stable**, within the 0.43 envelope |

The harness reported no page or console errors. **There are no unintended regressions.** Phase 13 changed no cinematic act.

## 16. Tests

| Check | Result |
|---|---|
| `pnpm lint` | ✅ 0 problems |
| `pnpm typecheck` | ✅ |
| `pnpm format:check` | ✅ |
| `pnpm test` | ✅ **109/109** (106 + 3 owner-content tests) |
| `pnpm test:cms` | ✅ **49/49** |
| `pnpm build` | ✅ |
| `pnpm test:e2e`, run 1 | ✅ **164 passed, 33 skipped, 0 failed** |
| `pnpm test:e2e`, run 2 | ✅ **164 passed, 33 skipped, 0 failed** |
| `pnpm seo:audit` | ✅ 22 / 0 |
| `pnpm cms:verify-legacy` | ✅ 0 errors |
| axe | ✅ 0 / 36 |
| Overflow | ✅ 0 / 90 |
| Fallbacks | ✅ 3/3 |
| Regression | ✅ |

## 17. Remaining Issues

1. **Case-study depth is capped by content.** Problem / Approach / Results are empty on every project. Projects 2 and 3 have no body text. This is owner-authored material (content review §7).
2. **The long bio is still the legacy text.** The proposal is ready; it needs approval.
3. **No real imagery** for the two strongest AI projects.
4. **21st.dev MCP** is unavailable, and the old key is still to be rotated.
5. **Production content.** The encrypted deployment package predates these CMS changes. Run `pnpm cms:apply-owner` after the production restore, or regenerate the package.
6. **RTL with Arabic content** and physical-device performance: NOT MEASURED.

## 18. Owner Actions

1. Approve or edit the **long bio** (content review §10).
2. Write **Problem / Approach / Results** for the three featured AI/robotics projects. Also add the body text and imagery for Breast Tumor Diagnosis and Robot Obstacles Avoidance.
3. Add **technologies** for the other 11 projects (only what was used).
4. Add further AI/ML skills and frameworks **only if used**.
5. Add the VegaCORE **start date**, and certificate **dates / IDs / verification URLs**, if available.
6. **Rotate** the 21st.dev API key; optionally enable the MCP at user scope.
7. On deployment, apply the owner content to production (`pnpm cms:apply-owner`).
8. Appoint the Arabic reviewer (gate D-9) when Arabic should go live.

## 19. Git State

- **HEAD:** `73cb15f feat: phase 12 — AI engineer positioning, case-file dossiers and hero sheet` (unchanged).
- **Commits, pushes, resets, rebases, stashes, history rewrites:** none.
- **Pre-existing untracked files** (`docs/deploy/`, `docs/reports/PHASE_10_REPORT.md`): preserved.

**Modified:**
- `docs/content/OWNER_PROFILE.md`;
- `messages/en.json`, `messages/ar.json`;
- `src/app/[locale]/{page,about/page,certificates/page,cv/page,projects/[slug]/page,skills/page}.tsx`;
- `src/cms/owner/owner-content.ts`;
- `src/cms/scripts/{apply-owner-content,verify-legacy}.ts`;
- `src/components/portfolio/{ProjectRow,SkillGroups}.tsx`;
- `src/lib/seo/structured-data.ts`;
- `tests/unit/owner-content.test.ts`.

**New:**
- `src/components/portfolio/SelectedWork.tsx`;
- `docs/reports/PHASE_13_CONTENT_REVIEW.md`;
- `docs/reports/PHASE_13_REPORT.md`.

**Outside Git:** the local development database (owner-approved content applied, backup taken). `.env`, `photos/` and `portrait.jpg` are untouched.
