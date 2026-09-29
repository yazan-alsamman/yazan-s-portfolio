# Phase 14 — Portfolio Authority, Content Expansion & Senior AI Engineer Positioning

**Date:** 2026-09-29.
**Git HEAD:** `73cb15fb1f60ae9df41a0b8f53cb1d0a33c94821` (Phase 12).
**Working tree:** the Phase 13 and Phase 14 changes are uncommitted. Nothing was committed, pushed or deployed.

Related documents:
- `PHASE_14_CONTENT_AUDIT.md`
- `../content/PORTFOLIO_CONTENT_MATRIX.md`
- `PHASE_14_OWNER_REVIEW.md`

## 1. Starting state

The starting point was the Phase 13 tree:
- 14 published projects, 25 skills and 28 certificates;
- 1 experience entry, 1 education entry;
- no evidence-status model;
- case studies with 5 sections.

Baseline results: 109 unit, 49 CMS and 164 E2E tests passing; SEO 22 pages / 0 errors; axe 0/36.

## 2. Owner decisions used

The owner approved:
- publishing Tavola, VegaCore OS + Saree'e, Tabkha & More and the Zina website as verified work, described only from their READMEs and code;
- 3–5 clearly labelled concepts.

Everything else comes from existing owner CMS text or the owner's own public repositories.

## 3. CMS and schema

Migration `20260929_122234_phase14_content_authority` is additive: nullable columns with defaults, and no data was rewritten. It adds:

- **Projects:**
  - `provenance` (verified / concept / experimental), `tier` (flagship / strong / supporting) and a `schematic` motif override;
  - case sections `constraints`, `intelligence`, `decisions`, `challenges`.
- **Skills:** `provenance` (verified / exploration) and the categories architecture, security and practice.
- **Profile:** `principles` (≤ 8, localized).
- **Content contract and adapter:** updated to match. Absent values read as verified / supporting.

**Content channel.** `src/cms/content/phase14-content.ts` is applied by `pnpm cms:apply-phase14`, which is idempotent: the second run reported 0 created, 25 updated with identical data. For existing projects it writes only the listed fields; covers, galleries, timelines and unlisted sections are kept.

**Backup.** `pre-phase14.dump` (329,638 B, 124 tables) was taken before applying, in the session scratchpad (`p14/`).

**Integrity.** `pnpm cms:verify-legacy` reports 0 errors. The 11 new projects appear under `projectsNotInDataset` as expected.

## 4. Projects

**Upgraded (14):**
- AI PM: added Problem, Constraints, Intelligence layer and Engineering decisions (restating owner text).
- Breast Tumor Diagnosis: the KNN setup, dataset and Flask API from the README. Metrics are labelled as offline results on a public dataset, not clinical.
- Robot: FIS/ANFIS detail and README metrics; repository link added.
- Student Management: the Spring Cloud topology.
- Project Hub: architecture.
- Services Provider: overview.
- All 14: tier, provenance and order.

**Added, verified (7):**
- Tavola platform
- Trading AI backend (presented as architecture and foundation)
- VegaCore OS (linked to the VegaCORE CTO role; the README's default credentials were deliberately not published)
- this portfolio platform
- Saree'e (Phase-1 status stated honestly)
- Tabkha & More
- Zina website

**Added, concept (4):**
- Enterprise RAG Platform
- Multi-Agent Software Engineering System
- Vision Inspection Pipeline
- LLM Observability & Evaluation Platform

Concepts contain no numbers, users, deployments or links, and a unit test enforces this.

**Result:** 25 published — 7 flagship, 8 strong, 10 supporting. This is one above the ~24 target; the three "Basic …" training projects are candidates to archive if you want fewer.

## 5. Skills

60 skills in total:
- 35 were added. Each verified skill records its evidence, meaning the repository or project, in the source note.
- 4 are exploration skills (RAG, agents, computer vision, LLM evaluation & observability). They appear only in a separate "Exploration" section on /skills and in concept projects. They are excluded from the stack, CV, home, About counts and `knowsAbout`.
- Cyber Security moved to security, and Problem Solving to practice.

## 6. Frontend

- **Expertise model:** Intelligence → Systems & architecture → Application engineering → Data → Infrastructure → Engineering discipline (+ Adjacent). It is used by /skills, project stacks, `knowsAbout` ordering and the systems map.
- **Project page:** the 9 sections in order; "Design objective" for concepts; a concept disclosure banner; an Evidence cell in the spec sheet; motif override; captions "Architecture schematic · no published imagery" / "Conceptual system diagram · not a screenshot".
- **Rows:** a "Concept system" badge (text, not colour alone); dossier includes Intelligence layer.
- **/projects:** an independent, deep-linkable evidence filter (`?evidence=verified|concept`) alongside the discipline filter.
- **Home:** "Selected systems" (the featured flagships); discipline counts from verified projects only.
- **About:** technical profile (flagship systems 07, verified skills 56), engineering principles, systems map (a table on wide screens, a list on phones, derived from CMS technology relations; concepts excluded), and a ProfilePage JSON-LD.
- **Schematics:** new deterministic motifs pipeline, agents, events and tenancy (server-rendered SVG).

## 7. SEO and structured data

- Every new or upgraded project has an SEO title (≤ 60 characters before " — Yazan Al Samman") and a description (50–170 characters).
- `meta.homeDescription` was improved.
- Structured data:
  - `creativeWorkStatus: "Concept"` on concepts;
  - `isBasedOn` → `SoftwareSourceCode` (`codeRepository`) on verified projects with repositories;
  - ProfilePage on About;
  - `knowsAbout` limited to verified skills.
- No fictional credential enters structured data.
- SEO audit: 33 pages / 0 errors (Phase 13: 22 / 0).

## 8. Verification (production build, `next start -p 3218`)

| Check | Phase 13 | Phase 14 |
|---|---|---|
| Lint / typecheck / format | clean | clean |
| Unit | 109/109 | **121/121** (+ `phase14-content.test.ts`, discipline model tests) |
| CMS | 49/49 | 49/49 |
| E2E | 164 passed ×2 | **164 passed ×2** (see §12) |
| SEO audit | 22 / 0 errors | 33 / 0 errors |
| axe (WCAG 2.2 AA) | 0 / 36 | **0 / 45** (+ Tavola, concept and VegaCore pages) |
| Overflow (9 viewports) | 0 / 90 | 0 / 108 |
| Fallbacks (Save-Data, low memory, no WebGL2) | 3/3 | 3/3 |
| Critical JS `/` | 164,524 B | 164,524 B (max 164,779 on /projects; budget 170 KB) |
| Scene chunk | 252,993 B gz | 252,993 B gz (unchanged) |
| Site CSS | 11,748 B gz | 11,906 B gz |
| Idle / offscreen draws | 0 / 0 | 0 / 0 |
| Frames > 33 ms | 0 | 0 in 2 of 3 runs (max 30.3 ms); 1 frame at 36.4 ms in the first run, while the machine was also busy — the scene code is unchanged |
| Visual regression vs Phase 10 | arrival 13.2–14.7, other frames ≤ 1.36 | arrival 13.3–15.0, other frames ≤ 1.39; A↔B stable. No cinematic act changed |
| `/ar` | 404 | 404 |

## 9. Accessibility notes

- Concept status is conveyed by text (badge, banner, caption, filter label), never only by a dashed border.
- The systems map is a real `<table>` with row and column headers, and filled cells have screen-reader text.
- Filters use `aria-pressed` and a live count.

## 10. Remaining gaps

- No dates or roles on the new projects, and no screenshots; see the owner review list.
- `verify-legacy` does not yet assert Phase 14 invariants. The unit tests cover the dataset, and the apply script's idempotency was checked manually.
- Arabic strings are drafts, and the gate stays closed.

## 11. Production readiness

Ready to commit after owner review of the biography, concept titles and the review list. Deploying requires running `pnpm cms:migrate` and `pnpm cms:apply-phase14` on the production database, after a backup. No deployment was made.

## 12. E2E runs

There were four full runs of the suite:

| Run | Conditions | Result |
|---|---|---|
| 1 | Normal | 164 passed |
| 2 | QA production server (3218) running alongside the E2E build | 1 failure: mobile "no horizontal overflow (/)" |
| 3 | Same as run 2 | 1 failure: mobile "WebGL unavailable" — a 30 s timeout while `page.goto` was loading |
| 4 | Competing server stopped | 164 passed |

- Both failures were cinematic-landing tests, which Phase 14 did not change.
- The overflow test then passed 10 of 10 times on its own (`--repeat-each=5`, both paths).
- Conclusion: load-related timing flakes, not regressions.
- Recommendation: do not run a second production server while the E2E suite runs.
