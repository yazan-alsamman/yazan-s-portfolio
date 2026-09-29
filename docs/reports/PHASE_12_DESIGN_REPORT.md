# Phase 12 Report — Premium Art Direction, AI Engineer Positioning & Design Integration

**Date:** 2026-09-29 · **Branch:** `main` · **HEAD:** `f599e08` (unchanged). The work tree is uncommitted.

**Scope:** art direction, hero composition, case-study presentation, positioning, skills, about, certificates, 3D refinement. Content data, the CMS schema, routing, the Arabic gate, SEO architecture and security are unchanged.

**Measurement labels:**

- **REAL HW**: Lenovo Legion 5 laptop (Ryzen 7 5800H), headed Chrome, AMD iGPU unless stated.
- **SIMULATED**: the same laptop with 390×844 touch emulation.
- **NOT MEASURED — reason**: nothing was estimated.

**Before/after method:** "HEAD" numbers come from an isolated `git archive HEAD` build, served beside the Phase 12 build, with interleaved runs.

---

## 1. Executive Summary

Phase 12 keeps every established element. Unchanged: the cinematic narrative, the Inference Core, the instrument language, the fallbacks and the budgets. What changed is how deliberately the site states **who, what, and what is built**.

**Hero.** The arrival is recomposed as one drawing sheet:
- identity at the lower left;
- a **Focus** line taken from the owner's featured projects ("Artificial intelligence · Robotics"), plus **one primary action** ("Explore the work");
- a **title block** under the core with the figure caption and the published CMS counts;
- registration marks at the frame corners.

The core was raised and fitted to narrow landscape screens, so it never competes with the name.

**Projects are engineering case files.** Every row carries facts derived from its CMS document: year, source available, figure count, documented sections. **Every project now has a figure.** The 9 projects without imagery get a deterministic, discipline-specific **schematic**, always captioned "Schematic · no published imagery", never a fake screenshot. The filter lists intelligent-systems disciplines first and is deep-linkable (`?discipline=`).

**Positioning, from verified data only:**
- the home introduction leads with a **spec sheet** (role, education, disciplines measured from published projects);
- About gains an engineer's **profile sheet**;
- skills become a **layered capability stack** (L4 Interfaces … L1 Foundations);
- certificates are grouped by issuer;
- no fact was written, changed or inferred. §10 gives the exact content changes recommended to the owner.

**Inference Core:**
- a laser-etched substrate (pin-1 mark, keep-out ring, part designation) that appears in highlights;
- one fewer shader program (the contact material shares steel's program);
- narrow-landscape framing;
- measured compile time went from 361–392 ms to 342–357 ms (desktop) and from 235–277 ms to 216–226 ms (mobile SIMULATED).

**Budgets and checks:**

| Check | Result |
|---|---|
| Critical JS `/` | **164,524 B** (≤ 170 KB) |
| Scene chunk | **252,993 B gzip** (≤ 400 KB) |
| Portrait | unchanged (71,666 B, same SHA-256) |
| Idle, offscreen and pointer-idle rendering | **0 draws** |
| Scroll | **0 frames over 33 ms** |
| axe | **0 violations** (36 checks) |
| Overflow | **0 horizontal** in 90 viewport × route checks |
| SEO | **22 pages, 0 errors** |
| Unit / CMS tests | **106/106**, **49/49** |
| E2E | **164 passed, 0 failed**, run twice |

**21st.dev MCP:** attempted and **not available** in this session. It was not used (§4).

## 2. Baseline Audit

HEAD `f599e08`, captures in scratchpad `qa/p12-current`, plus the CMS content read through the public API.

| Area | Finding |
|---|---|
| Hero | The readout floated alone in the top-left; the caption sat far from its object. There was **no primary action** and no statement of *what is built*. |
| Positioning (content) | Profile short and long bios speak only of "mobile and web applications". The skills have **no AI/ML category** (frontend, programming, backend, mobile, databases, other). **1 of 14** projects links technologies; most have only a description. **Verified AI signals:** the title; 3 featured AI/robotics projects (AI project management, breast-tumour diagnosis, fuzzy/neural robot navigation) plus one "AI-powered" app; the CTO role at VegaCORE. |
| Projects | 9 of 14 rows had no figure, so the row rhythm broke. Known facts (7 repository links, 6 dated projects, gallery sizes, documented sections) were not surfaced. The filter state was not linkable. |
| Skills | A flat matrix: structure was not expressed. |
| Certificates | 28 entries in one register, hard to scan (5 issuers). |
| Project page without body | Only a title, a one-cell spec sheet with an empty second column, and buttons. |
| Navigation | Strong: native dialog, `aria-current`, skip link, visible focus, RTL mirroring. **No change warranted** (§14). |

## 3. UI/UX Pro Max Guidance Used

The skill was loaded and its search tool run (`scratchpad/uiux-p12.txt`).

| Query (domain) | Result | Decision |
|---|---|---|
| "portfolio hero-centric" (landing) | Hero-Centric: **one primary CTA**; keep the next-content cue; static hero and CTA under reduced motion | **Adopted:** one primary CTA; scroll cue and skip link kept; everything static under reduced motion |
| Portfolio Grid (landing) | "Visuals first. Filter by category." | **Adopted** as case-file figures for every row; discipline filter kept and ordered |
| "hero identity headline visual anchor" (landing) | **0 results** | Retried as above (the skill's retry rule) |
| "filter chips state url" / Deep Linking (ux) | Wrap chips; `button` + pressed state; **update the URL on state change** | **Adopted:** filter already wraps with `aria-pressed`; `?discipline=` added with `replaceState` |
| "placeholder image empty state" (ux) | No blank states; **no lorem ipsum / fake content** | **Adopted:** schematics instead of blank columns, **explicitly captioned as schematics** |
| "technical editorial monospace precision" (typography) | Space Mono / JetBrains Mono all-mono pairings ("brutalist", "terminal, hacker") | **Rejected:** the brief forbids hacker/terminal aesthetics, and the brand typography stays. Mono is kept as a secondary voice only. |
| "hierarchical structure grouping" (chart) | Treemap / sunburst | **Rejected:** size encoding of skill counts would read as self-assessment. A layered stack diagram communicates structure without magnitude. |
| Quick reference: `number-tabular`, `touch-density`, `number-formatting` | Tabular figures; comfortable touch spacing | **Adopted:** tabular mono counts; 44 px buttons with 8 px gaps (unchanged) |
| "active state navigation", "touch target spacing" (ux) | Highlight the active item; minimum 44 px / 8 px gap | Already met: **no change** |

## 4. 21st.dev MCP

| Item | Status |
|---|---|
| Available in this session | **No.** Tool searches returned no 21st.dev tools. |
| Why | The `21st` MCP server is configured only for the `C:/Users/Lenovo` project scope, not for this repository, so it does not load here. |
| What was done | I asked the owner. The answer was "proceed without it". No configuration was read, no API was called directly, no workaround was attempted. |
| Resources inspected | **None** |
| Patterns used | **None** from 21st.dev in this phase. The earlier adaptations (header solidify, menu wipe, text roll) remain. |
| Credentials | **None printed in this phase.** The key displayed during the previous phase's availability check is **still flagged for rotation** (owner action). |
| To enable | Add the server at user scope with a rotated key (`claude mcp add --scope user …`), then restart Claude Code in this repository. |

## 5. Art Direction

**"An engineering drawing set for a person who builds intelligent systems."**

The phase adds **authorship**, not effects:
- **Sheet composition:** frame marks, a title block, a figure number.
- **Dossier facts:** measured, never claimed.
- **Schematics:** drawings of a discipline, honestly captioned.
- **A stack diagram of capability.**

No new colour, gradient, glass, glow, particle or 3D object was added. There is one new warm note on the object (the etched marks read only in light), and there is one new animation, the title-block yield (§6).

## 6. Hero

`src/app/[locale]/page.tsx`, arrival chapter; `globals.css` §12–13.

1. **Identity:** H1 unchanged (the E2E H1 contract).
2. **Focus:** the disciplines of the owner's featured projects, intelligent systems first ("Artificial intelligence · Robotics"). This answers *what is built*.
3. **One primary action:** "Explore the work" → `/projects`. It is magnetic for fine pointers only. "Skip the intro" remains.
4. **Title block** under the core:
   - the figure caption;
   - a `<dl>` of published project, skill and certificate counts (CMS);
   - on large screens it yields (opacity) as it scrolls into the core's column, so it never overlaps the exploded object;
   - static under reduced motion.
5. **Sheet frame:** registration marks at the four corners (large screens).
6. **Core placement:**
   - raised in landscape (hero y 1.05 → 1.95), so the name and the object share no band;
   - fitted to narrow landscape screens (x ×0.72–1 and scale ×0.94–1 for aspect < 1.6), so at 1024×768 the core is whole and clear of the name;
   - on phones it is lifted (y 2.6 → 3.35) above the identity;
   - the static drawing was moved to match (desktop 16 → 9 svh, phones 13 → 10 svh).

## 7. Inference Core

| Aspect | Change |
|---|---|
| Geometry | Unchanged: 10 draw calls, 12,006 triangles on High, 7,326 on Low |
| Materials | **Laser-etched substrate:** a roughness map with a pin-1 triangle, a keep-out ring at the heat-spreader footprint and the part designation "INFERENCE CORE IC-01" (a design label, not a factual claim). It is roughness only, so it appears only in specular highlights, as real etching does. **Contact pins now share the steel program** (same brushed roughness map). |
| Animation / choreography | The narrative is unchanged: sensor → architecture (exploded) → data → processing (activation fronts) → inference (hands over to the graph). The approach path and RTL mirror are unchanged; the hero pose and narrow-landscape fit are new (§6). |
| Performance | Programs −1. Textures +1 (the 256² etched map). Compile time is **lower** (§19). Idle, offscreen and pointer-idle rendering stay 0. |

`tests/unit/cinematic.test.ts` gains a narrow-landscape fit test (and keeps continuity, dock, RTL and orientation).

## 8. Projects

**Case files** (`ProjectRow.tsx`):
- a rail: index, discipline, **year**;
- the title: the single stretched link, semantics unchanged;
- summary and stack;
- a **dossier line**: "Source", "N figures", "Documented: Architecture";
- the figure column.

Dossier values come from `ProjectSummary.dossier`, derived in the adapter from the same CMS document:
- **year** only from a stated timeline date (end, else start); never `updatedAt`;
- **source** only from a `repository` link;
- **figures** equal the gallery length;
- **sections** list only the narrative fields that have content.

**Schematic fallbacks** (`ProjectSchematic.tsx`, `lib/disciplines.ts`):
- a seeded, deterministic SVG per slug;
- motif by discipline:
  - network (AI/ML/data);
  - kinematic arm with sensor sweep toward an obstacle (robotics);
  - vision grid with detection boxes (computer vision);
  - module/interface diagram (software engineering and backend);
  - device frame (mobile);
  - browser layout (web);
- rendered on the server and passed to the client index as markup, so **no schematic code ships to the browser**;
- captioned "Schematic · no published imagery";
- rows: desktop only (phones keep the list compact);
- project pages without a cover: a smaller figure under the header.

**Real covers:** registration-marked, with hover/focus mark widening and a 1.03 image scale. Cover files are untouched.

**Filter:**
- disciplines ordered intelligent → systems → applications (CMS order within a family);
- deep-linkable with `?discipline=robotics` (`replaceState`, restored after hydration; the server render stays unfiltered for crawlers).

**Project page:** a single spec cell no longer leaves an empty column (`max-w-sm`).

## 9. AI Engineer Positioning

The portfolio now leads with verified AI and engineering signals. It **wrote none**.

| Surface | What it communicates | Source |
|---|---|---|
| Hero | "Artificial Intelligence Engineer"; Focus: "Artificial intelligence · Robotics" | Profile title; featured projects' categories |
| Home introduction | Role: CTO · VegaCORE; Education: B.IT · AIU · 2026; Disciplines: AI 02 · Robotics 01 · Software engineering 04 · Mobile 05 · Web 02 | Experience, Education, published projects |
| Projects | Intelligent systems first in the filter; case-file dossiers | Category taxonomy (presentation); CMS facts |
| About | Profile sheet: title, role, education, focus | Same CMS entities |
| Skills | A layered system stack | CMS categories, mapped to layers |

## 10. Content Recommendations (owner approval required — not implemented)

The CMS content is the remaining weakness. Nothing below was changed. Each item needs the owner's confirmation that it is true.

1. **Short bio** (Profile → shortBio). The current text describes only mobile and web applications. A proposal built only from facts already published:

   > "Artificial Intelligence Engineer and Chief Technology Officer at VegaCORE. I design and build intelligent systems — AI-assisted project management, AI-powered medical diagnosis, and fuzzy-logic and neural-network robot navigation — together with the software systems they run on."

   The long bio would need the same shift.
2. **Skills:** there is no AI/ML category. If true, add the AI skills actually used (for example fuzzy systems and neural networks, which the robotics project names) under `ai-ml`. The stack will draw an "Intelligence" layer automatically.
3. **Technologies:** link the technologies already named in the AI project-management architecture text (Node.js/Express, MongoDB, Next.js, Flutter) as relations. Link technologies for the other 13 projects too.
4. **Case-study bodies:** add Problem / Approach / Architecture / Results to the three featured AI/robotics projects. The case-file dossier and the numbered project sections will pick them up with no code change.
5. **Imagery:** real figures for the robotics and AI project-management projects would replace their schematics.
6. **Experience:** a start date for the VegaCORE role would enable the timeline period (currently omitted, never inferred).

## 11. Skills

`SkillGroups.tsx`, `lib/disciplines.ts`: a **capability stack**.

- CMS categories are placed in architecture layers:
  - Intelligence → Interfaces → Services → Data → Infrastructure → Foundations;
  - "Adjacent disciplines" is set apart (dashed boundary, `+` marker).
- Layers are numbered from the foundation (L1). Only layers with skills are drawn: today L4 Interfaces, L3 Services, L2 Data, L1 Foundations, and + Adjacent.
- There are no ratings, bars or percentages.
- Anchors (`#skill-<id>`), evidence links and CMS order are preserved.
- Unknown categories fall back to "Adjacent" (unit-tested).

## 12. About

- A new **Profile** sheet (title, role, education, focus) of CMS facts only.
- The portrait figure, crop and caption are unchanged. `portrait.jpg` SHA-256 is `1c00fa07…323fca`, verified in §22.
- The biography text is untouched (see §10).

## 13. Experience · Certificates

**Experience:**
- the rail and the "no stated date, no period column" rule are kept;
- the role is now also surfaced in the home introduction and on About;
- nothing was inferred. The only entry has no dates in the CMS.

**Certificates (`/certificates`, CV):**
- **grouped by issuer**, in CMS order of first appearance;
- each group has an issuer heading and a measured count, and entries keep one continuous register number (01–28);
- the heading outline is h2 issuer → h3 certificate (page) or h3 → h4 (CV);
- verification links, dates and IDs are unchanged;
- home keeps the compact 4-entry register.

## 14. Navigation

The audit used the E2E suite, axe and captures. The only change is the filter deep link (§8).

| Check | Result |
|---|---|
| First interaction | Skip link first, then header controls |
| Keyboard | "Skip the intro" still reachable (E2E) with the added CTA |
| Focus | Visible on the first 14 tab stops of 12 routes |
| Menu | Native dialog, focus trap, Esc (E2E) |
| Active state | `aria-current` underline |
| RTL | Mirrors |
| Language switching | `prefetch={false}` |
| Route transitions | Canvas unmounts on `/projects`, remounts on home |

No redesign was warranted.

## 15. Micro-interactions

Added:
- the schematic accent path thickens with row hover/focus (stroke width, 280 ms);
- the title-block yield (scroll-driven opacity, large screens only).

Kept:
- row hairline, mark widening, magnetic primary button (≤ 6 px, fine pointers only), press scale.

Everything is static under reduced motion. Nothing carries information by hover alone: the dossier, figures and captions are always visible.

## 16. Mobile

Nine viewports: 320×800, 360×800, 390×844, 430×932, 768×1024, 1024×768, 1280×800, 1440×900, 1920×1080. Ten routes each, 90 checks: **0 horizontal overflow**.

The About portrait is flagged by the offender scan because it is wider than its crop frame by design (clipped by the crop, unchanged since earlier phases). It causes no overflow.

Phone composition:
- the core is centred above the identity (lifted);
- focus, CTA and a compact 3-cell title block follow, with label tracking tightened below 576 px;
- case files hide schematics (covers remain);
- the skill stack and registers stack to one column.

Tablet (768×1024) and small laptop (1024×768) were checked with captures (§6).

## 17. RTL

Development preview only; **the Arabic production gate is closed**. `/ar` and `/ar/projects` return 404 in production.

Captures at 1440 and 390, WebGL and reduced motion:
- the core mirrors to the left and the drawing mirrors;
- the identity is right-aligned, the header and menu are mirrored;
- 0 overflow.

Arabic content is unapproved, so the Arabic preview renders no Focus/CTA/title block and no project rows. Their layout uses logical properties only: `start`/`end`, `ps`, `border-inline`, and RTL `transform-origin` for the hairline. No RTL-specific component logic was added.

`src/config/copy-review.ts` is unchanged. The new Arabic strings are unreviewed drafts, exactly like the rest of `ar.json`.

## 18. Accessibility · SEO · CMS Integrity

**Accessibility:**
- **axe (WCAG 2.0/2.1/2.2 A + AA):** 0 violations across 36 checks (12 routes × 1440 dark, 1440 light, 390 dark).
- **Semantics:** the title block is a labelled `<dl>`; schematics and frame marks are `aria-hidden` with a visible textual caption; heading order is kept.
- **Fallbacks:** reduced motion, no WebGL, chunk failure (E2E), Save-Data, low memory and no WebGL2 (probe below) all give the static tier with the drawing and the H1.

| Probe case | Mode | Canvas | Scene chunk | Errors |
|---|---|---|---|---|
| Save-Data | static | 0 | not downloaded | 0 |
| `deviceMemory` 2 GB | static | 0 | not downloaded | 0 |
| No WebGL2 | static | 0 | not downloaded | 0 |

**SEO:**
- `pnpm seo:audit`: **22 pages, 0 errors**;
- the H1 contract, canonicals, JSON-LD, sitemap, robots and hreflang (`en` + `x-default`) are unchanged;
- all new text is server-rendered HTML.

**CMS integrity:**
- the flow is still CMS adapter → content contract → server page → presentation;
- the contract gained an **optional**, derived `dossier` (validated by zod), so existing fixtures and tests are unaffected;
- no project, skill, certificate or experience data and no count is hard-coded;
- the taxonomy (`lib/disciplines.ts`) only decides presentation order and layout;
- the draft/published/archived states and the Arabic gate are untouched;
- `pnpm test:cms`: 49/49.

## 19. Performance

**Bundles** (gzip level 9; baseline = isolated HEAD build):

| Asset | HEAD | Phase 12 | Δ | Budget |
|---|---|---|---|---|
| Critical JS `/` | 164,553 | **164,524** | −29 | ≤ 170 KB ✅ |
| Critical JS `/projects` | 164,291 | 164,458 | +167 (filter deep link) | ✅ |
| Critical JS `/about`, `/experience`, `/certificates`, `/cv` | 162,782 | 162,755 | −27 | ✅ |
| Critical JS `/skills`, `/contact` | 157,171 | 157,144 | −27 | ✅ |
| Scene chunk | 252,670 gz | **252,993 gz** | +323 | ≤ 400 KB ✅ |
| Public CSS | 11,344 gz | 11,680 gz | +336 | — |
| Portrait | 71,666 B | 71,666 B | 0 | ≤ 150 KB ✅ |

**3D** (REAL HW iGPU unless noted). Interleaved HEAD / Phase 12 runs.

| Measure | HEAD | Phase 12 |
|---|---|---|
| Program compile, desktop (3 runs) | 361 / 392 / 363 ms | **356 / 357 / 342 ms** |
| Program compile, phone SIMULATED (2 runs) | 277 / 235 ms | **218 / 226 ms** |
| First WebGL frame, desktop | 1,716 / 1,784 / 1,756 ms | 1,753 / 1,742 / 1,745 ms (same, within noise) |
| Draw calls / triangles at arrival | 19 / 12,006 | 19 / 12,006 |
| Textures at arrival | 10 | 11 (etched map) |
| Idle, offscreen, pointer-idle draws (3 s each) | 0 / 0 / 0 | **0 / 0 / 0** |
| Scroll p50 / p99 / max; frames over 33 ms | 6.1 / 6.2 / 30.2–30.3 ms; 0 | 6.1 / 6.2 / 30.3–30.4 ms; **0** |
| Peak draw calls during scroll | 24 | 24 |
| JS heap after GC | 8.9 MB | 8.9 MB |
| Navigation ×3 (canvas on projects / home; heap) | 0 / 1; 10.5 → 11.0 MB | 0 / 1; 10.5 → 11.1 MB (same shape) |
| dGPU, Phase 12 (compile / first frame / scroll max / over 33 ms) | — | 334 ms / 1,737 ms / 30.4 ms / 0 |

The HEAD copy logged 400s for CMS media images: its scratch copy has no `media/` folder. This is unrelated to the scene.

**NOT MEASURED:**
- per-frame GPU time and GPU memory (no API; rAF intervals are the proxy);
- physical phones;
- the High ≥ 60 fps / Medium ≥ 45 fps tier targets on real Medium hardware. The laptop sustains about 164 fps (165 Hz display).

## 20. Visual Regression

**Method:** the Phase 3/10 approved-frame harness (`regress.mjs`), 18 frames × 2 runs. It is compared with **Phase 10's approved frames**, and also HEAD ↔ Phase 12. The `/ar` frame is skipped because production gates `/ar`.

| Frame | vs Phase 10 approved (mean abs.) | vs HEAD (mean abs., px > 40) | Expected? |
|---|---|---|---|
| 01 desktop arrival | 13.18 | 14.38, 7.9 % | **Yes:** recomposed hero (§6) |
| 09 phone arrival | 14.67 | 18.63, 10.6 % | **Yes** |
| 15 1280 light arrival | 14.33 | 15.68, 8.5 % | **Yes** |
| 02 ignition, 03 intelligence | 1.32–1.40 | 0.42–0.46 | Yes (core path above the dock) |
| 04–08 desktop acts | 0.31–0.43 | 0.00–0.14 | **Unchanged** (≤ the 0.43 envelope) |
| 10–14 phone acts | 0.00–0.73 | 0.00–0.11 | **Unchanged** |
| 16–17 light acts, 19 portrait close-up | 0.02–0.27 | 0.00–0.12 | **Unchanged** |

- Run-to-run A ↔ B: ≤ 0.34.
- The harness reported no page or console errors.
- **Every approved act from ignition onward is visually stable.** The arrival changed deliberately.

## 21. Tests

All checks on the final code:

| Check | Result |
|---|---|
| `pnpm lint` | ✅ 0 problems |
| `pnpm typecheck` | ✅ 0 errors |
| `pnpm format:check` | ✅ |
| `pnpm test` | ✅ **106/106** (99 + 6 taxonomy tests + 1 core-fit test) |
| `pnpm test:cms` | ✅ **49/49** |
| `pnpm build` (production) | ✅ |
| `pnpm test:e2e`, run 1 | ✅ **164 passed, 33 skipped, 0 failed** |
| `pnpm test:e2e`, run 2 | ✅ **164 passed, 33 skipped, 0 failed** |
| `pnpm seo:audit` | ✅ 22 pages, 0 errors |
| axe | ✅ 0 violations / 36 |
| Overflow | ✅ 0 / 90 |
| Fallback probe | ✅ 3/3 static |
| Approved-frame regression | ✅ only intended arrival changes |

## 22. Remaining Issues

1. **Content is the ceiling** (§10). The bio, the lack of an AI skill category, missing technologies and missing case-study bodies need the owner. The design surfaces what exists and never invents.
2. **21st.dev MCP was unavailable** (§4). The previously displayed key is still to be rotated.
3. **Etched substrate marking** is subtle by design (roughness only). It shows in highlights during the scroll, not at the default hero angle.
4. **RTL** content rows are unverified with Arabic content, which is unapproved.
5. **NOT MEASURED:** physical devices, GPU frame time and memory, Lighthouse and field CWV.
6. **Schematics are hidden on phones** (a density decision). Phone rows without covers show text only.

**Protected files:**
- `portrait.jpg`: SHA-256 `1c00fa075b97e2ef8a3460b3d62155052533729994041bd7f562ed5177323fca`, unchanged;
- `.env`: not modified or printed (sourced read-only by the isolated baseline build);
- `photos/` and `src/config/copy-review.ts`: untouched.

## 23. Git State

- **HEAD:** `f599e08 feat: design evolution — Inference Core hero and instrument design language` (unchanged).
- **Commits, pushes, resets, rebases, stashes, history rewrites:** none.
- **Pre-existing untracked files** (`docs/deploy/`, `docs/reports/PHASE_10_REPORT.md`): preserved, untouched.

**Modified (21):**
- `docs/DESIGN_SYSTEM.md` (the "Instrument language" section);
- `messages/ar.json`, `messages/en.json`;
- `src/app/[locale]/{page,about/page,certificates/page,cv/page,projects/page,projects/[slug]/page,skills/page}.tsx`;
- `src/app/globals.css`;
- `src/components/portfolio/{CertificateList,HomeSections,ProjectIndex,ProjectRow,SkillGroups}.tsx`;
- `src/content/{payload-adapter,types}.ts`;
- `src/scene/core-path.ts`, `src/scene/parts/InferenceCore.tsx`;
- `tests/unit/cinematic.test.ts`.

**New (5):**
- `src/components/portfolio/ProjectSchematic.tsx`;
- `src/components/portfolio/case-files.tsx`;
- `src/lib/disciplines.ts`;
- `tests/unit/disciplines.test.ts`;
- `docs/reports/PHASE_12_DESIGN_REPORT.md` (this report).
