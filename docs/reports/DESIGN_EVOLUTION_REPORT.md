# Design Evolution Report — Inference Core & Instrument Language

**Date:** 2026-09-29 · **Branch:** `main` (HEAD `df5b37b`, uncommitted work tree) · **Scope:** visual, interaction and 3D design. Content, CMS contract, routing, i18n gate, SEO and security are unchanged.

**Measurement labels:**

- **REAL HW**: Lenovo Legion 5 (Ryzen 7 5800H), headed Chrome. iGPU = AMD Radeon (ANGLE D3D11); dGPU = RTX 3050 Laptop.
- **SIMULATED**: the same laptop with mobile emulation (390×844 @3, touch). There was no CPU or network throttling in this phase.
- **NOT MEASURED — reason**: no number was estimated.

---

## 1. Executive Summary

The site keeps its approved dark, editorial identity and its Phase 3 cinematic narrative. Two things were added.

**1. A hero object: the Inference Core.** It is a procedurally built AI module:
- a substrate with 64 contact pins;
- a heat-spreader frame;
- three silicon die layers with routed traces;
- an optical sensor.

It floats beside the name on arrival and opens into an exploded axonometric view as you scroll. It then re-assembles, docks at the exact origin the approved floor circuits radiate from, and fires an activation front through its dies (sensor → data → processing), in step with those circuits. It dims as the neural graph takes over (inference). First paint, reduced motion, Save-Data and WebGL-less visitors see the same object as a server-rendered engineering drawing.

**2. An "instrument" design language** across the portfolio:
- a zero-byte system-mono voice for measured values;
- registration marks on figures;
- project rows as case files;
- a capability matrix for skills;
- a register for certificates;
- a timeline rail for experience;
- a closing pipeline for contact;
- a hero readout of verified CMS counts;
- restrained pointer micro-interactions.

**Budgets hold** (measured, §19/§25):

| Budget | Result |
|---|---|
| Critical JS `/` (≤ 170 KB) | +490 B, now 164,553 B |
| Scene chunk (≤ 400 KB gzip) | +2.9 KB, now 252,670 B |
| Portrait | unchanged, 71,666 B, same SHA-256 |
| Idle / offscreen rendering | 0 draws |
| Scroll | 0 frames over 33 ms; p99 unchanged at 6.2 ms |

**The cost:** about +230 ms until the first WebGL frame, spent compiling four more programs in parallel while the static drawing is on screen. Also +10 draw calls at arrival; the scroll peak is unchanged (24).

**Checks on the final code:**
- lint, typecheck and format are clean;
- unit tests 99/99 and CMS tests 49/49;
- E2E: 164 passed, 0 failed, run twice;
- SEO audit: 22 pages, 0 errors;
- axe: 0 violations in 33 checks.

**The 21st.dev MCP was not available in this session.** It was not used (§5).

## 2. Initial Design Audit

This audit was made from baseline production captures: 4 viewports, dark and light, reduced motion, 9 routes (scratchpad `qa/before`).

1. **Strengths:**
   - a disciplined token system and restrained palette;
   - excellent typography pairing (Space Grotesk / Inter);
   - a strong scroll narrative (circuits → graph → actuator → portrait);
   - an honest content model;
   - a world-class performance and fallback architecture.
2. **Weaknesses:**
   - The first viewport was 60 % empty starfield. Nothing said "builds intelligent systems" until the second act.
   - On phones, about 1,100 px of black sat above the name.
3. **Hierarchy:** home section titles were 12 px labels, so "Selected work" had the same weight as metadata. The sections read as one undifferentiated list.
4. **Typography:** metadata, dates, indices and stacks used the label face at small sizes. There was no distinct technical voice for measured values.
5. **Navigation:** solid (native dialog, text roll, CSS-only header). No change was needed.
6. **Hero opportunities:**
   - a subject in the empty right/upper field;
   - verified facts (counts) instead of emptiness;
   - a first-paint image that is not a blank grid.
7. **Projects:**
   - 9 of 14 rows have no cover, and those rows left a dead right column;
   - technologies were a loose list;
   - no hover affordance beyond the underline.
8. **3D:** no hero object. The first object (the actuator) appears at act 4. The circuits radiate from an empty origin.
9. **Interaction:** hover states existed but carried little feedback on rows and buttons, and there was no press state.
10. **Mobile:** the hero void (above). Captions over scrims worked well.
11. **Accessibility risks:** new decorative graphics must stay `aria-hidden`; mono text must keep contrast; new hover-only cues must not carry meaning.
12. **Performance risks:**
    - critical-JS headroom of about 6 KB;
    - a new object's shader compiles could re-introduce mid-scroll stalls (Phase 8);
    - pointer interaction could break "idle = 0".

## 3. Design Direction

**"The portfolio as an engineering document; the hero as the machine it documents."**

- **One subject.** A manufactured AI module, read bottom → top as interface → constraint → model → perception. It is not a brain, an orb or a neon wireframe.
- **Meaning through motion.** Every movement is a function of scroll:
  - arrival: the architecture opens up;
  - ignition: it assembles and fires into the approved circuits;
  - intelligence: it hands over to the graph.
- **Drawing → machine.** The static tier shows the same object as an isometric drawing with numbered callouts, so the fallback is a designed state, not a missing one.
- **Instrument typography.** A system-mono voice (zero font bytes) for every measured value, and registration marks on figures.
- **Restraint.**
  - one accent (the existing cyan), plus one warm note (the contacts' nickel-gold) on the object only;
  - no new colours, glass or glow;
  - motion limited to feedback and compositor-only properties.

## 4. UI/UX Pro Max Guidance Applied

The skill was loaded and its search tool queried (queries are in the scratchpad shell history).

| Query | Guidance used | How it shaped the result |
|---|---|---|
| `--design-system` "engineer portfolio dark technical editorial cinematic" (variance 6, motion 5, density 3) | Minimalism/Swiss; monochrome plus one accent; 200–250 ms hover; contrast ≥ 4.5:1; visible focus; reduced-motion final states | One accent kept; hover and press on existing duration tokens; every new effect collapses under reduced motion |
| `--stack threejs` "instancing draw calls materials" | InstancedMesh for repeated parts; tiered segment budgets; fog as depth | 64 pins and 4 screws are 2 instanced draws; lathe/sphere segments are 64 on High and Medium, 40 on Low; no new lights |
| `--domain ux` "hover only interaction touch" | Never rely on hover for meaning | Row hairline, spot light and magnetic pull are decoration; the stretched title link carries the action; the pointer island does nothing on coarse pointers |
| `--domain ux` "motion meaning spatial continuity" | Animate 1–2 key elements per view; respect reduced motion | One animated subject per viewport (the core); the pipeline line is the only scroll-drawn UI element |
| `--domain landing` "portfolio case study" | Neutral ground, visuals first, filter by category | Case-file rows with registered figures; per-discipline counts in the filter |

**Deliberately not adopted:**
- the tool's Inter-only type and its `#2563EB` / light-background palette, which would replace an established brand without a design reason;
- its GSAP `back.out` stagger: it adds a dependency, and overshoot "reads as sloppy on informational UI" (the tool's own note).

## 5. 21st.dev MCP Resources Examined

**None. The 21st.dev MCP was not available in this session.**

- A `21st` MCP server is configured in the user's Claude configuration, but only for the `C:/Users/Lenovo` project scope, not for this repository. No 21st.dev tool was loaded; a tool search for it returned nothing.
- Calling the 21st.dev HTTP API directly with the stored credential would bypass the MCP and expose a credential. That was not done.
- **Disclosure:** while checking availability, the MCP configuration, including its API key, was printed into this session's transcript. It was not written to any file. Rotating that key is recommended.
- **To enable it next time:** add the server at user scope (`claude mcp add --scope user …`), or start Claude Code from a directory where it is configured.

## 6. 21st.dev Patterns Adapted

**None in this phase** (see §5). The 21st.dev adaptations from earlier phases remain unchanged:
- the header solidify, from "Header 1";
- the menu wipe and text roll, from "Immersive Full Screen Navigation".

Every new pattern in this phase is original to this design system.

## 7. Design System Changes

All changes are in `src/app/globals.css` §4–5 and the new §12.

**Tokens:**
- `--font-mono-stack` / `font-mono`: `ui-monospace` system stack, **0 font bytes**. Arabic resolves to IBM Plex Sans Arabic first, so Arabic words are never set in a Latin monospace.
- `--text-meta`: 12 px with 0.04 em tracking. It is the floor for any mono metadata.

**Components:**
- `.fig-marks`: four corner registration ticks. They widen on hover or focus-within.
- `.case-row`: an accent hairline that draws along the top edge (`transform: scaleX`, compositor-only). RTL-aware origin.
- `.spot`: a cursor light (a radial field at `--mx/--my`). Hover-capable fine pointers only.
- `.magnetic`: a ≤ 6 px pull (`translate`) for primary buttons.
- `.matrix`: hairline grid cells. Incomplete rows stay open instead of showing a filled placeholder.
- `.rail-node`: a timeline rail with a diamond node.
- `.pipeline-step`: an accent signal line, scroll-drawn (`animation-timeline: view()`), static under reduced motion.
- `.readout`, `.cine-core` (see §8).

**Actions:** primary buttons are magnetic and gain a press state (`active:scale-[0.98]`). `translate` and `scale` joined their transition list.

Radii on media went from `md` to `sm`: more precise, less "card".

## 8. Hero Changes

`src/app/[locale]/page.tsx`, arrival chapter:

- **Identity unchanged.** Same H1 contract, text and LCP element (`span.font-display`).
- **Readout.** A `<dl aria-label="Portfolio index">` with counts of published CMS projects, skills and certificates (14 / 13 / 28 today, mono and tabular). On desktop it sits in the upper-left field; on phones it follows the identity. It is computed from the repository and never typed in, and it hides any count of zero.
- **Figure caption** (lg+, `aria-hidden`): "Fig. 01 — Inference core: sensor, silicon, substrate". It sits in the bottom row beside "Skip the intro".
- **`StaticCore`.** A server-rendered isometric SVG of the same object, placed where the 3D object sits:
  - it shows the three dies with routed traces and the dashed assembly axis;
  - five numbered callouts (01 sensor → 05 substrate) are language-neutral;
  - it mirrors in RTL, with its numerals kept readable;
  - it lives in the arrival chapter, so it scrolls away with the identity (§20);
  - when the 3D core is live it fades out, so the drawing becomes the machine.

## 9. New 3D Object

`src/scene/parts/InferenceCore.tsx` (procedural; no model or texture download).

| Part | Construction | Material |
|---|---|---|
| Substrate | Rounded-square extrusion with a machined bevel | Anodized graphite, brushed roughness map, light clearcoat |
| 64 contact pins | One `InstancedMesh` | Nickel-gold metal (the object's only warm note) |
| 4 mounting screws | One `InstancedMesh` | Brushed steel |
| Heat-spreader frame | Extrusion with a square hole | Brushed steel (shared material) |
| 3 silicon dies (1.62 / 1.26 / 0.92) | Beveled extrusions with planar UVs | Dark silicon with thin-film iridescence (High and Medium only) and low specular. The emissive map is a generated 256² trace layout (Manhattan routing, pads, cell blocks, seal ring). A radial activation front is injected through `onBeforeCompile` (one shared program via `customProgramCacheKey`). |
| Optical sensor | Lathe-turned housing (a machined profile) with a dome lens | Dark high-clearcoat glass reflecting the scene environment (no transmission pass); a thin cyan iris ring |

**Budget:**
- 10 draw calls;
- 7,360 triangles on High and 4,760 on Low (measured as the difference to baseline);
- 3 generated 256² textures (one per die) plus one 128² roughness texture;
- **no lights added**: the scene's key, rim and fill lights and its PMREM environment are shared.

Materials were tuned against captures. Two iterations removed a "bare aluminium" look (key-light specular) and a green thin-film cast at grazing angles.

## 10. 3D Interaction Design

The choreography lives in `src/scene/core-path.ts`. It is pure and unit-tested: pose keys per framing, eased like the directed camera.

| Scroll | Behaviour | Meaning |
|---|---|---|
| Arrival | Hero pose beside the name (landscape) or above it (portrait); the iris brightens; from 20 % of the act the stack opens into an exploded axonometric and the routing of every die lights faintly | Sensor → architecture |
| Ignition, first half | It re-assembles and travels along the right edge, clear of the centred caption | — |
| Ignition, second half | It docks at the floor origin; the activation front crosses the dies top → bottom, staggered; the approved circuits propagate outward at the same time | Data → processing |
| Intelligence | It dims to 25 % while the neural graph forms above, then fades out (fully gone by 80 % of the act) | Inference |

**Pointer tilt:**
- ±0.09 / 0.14 rad, damped;
- fine pointers only, not on the Low tier, and only while the core is the hero (p < 0.16);
- frames are requested only while the tilt moves.

**RTL:** the core's path mirrors (x and yaw negated). The dock at the origin is symmetric.

**Measured:**
- pointer moving: one frame per pointer event;
- after the pointer stops: about 25 settle frames, then **0**.

## 11. Projects Improvements

`ProjectRow.tsx`, `ProjectIndex.tsx`, `projects/[slug]/page.tsx`.

**Rows as case files:**
- a rail with the mono index and the discipline;
- title (the single stretched link, unchanged semantics);
- summary;
- the **stack** as a mono `/`-separated line with a translated label;
- the cover as a registered figure;
- rows without a cover get an arrow affordance instead of a dead column;
- hover/focus: accent hairline, marks widen, image 1.03×, arrow advances.

**Filter:** a per-discipline count (mono) inside each segment, and a mono live count.

**Detail page:**
- details as a **spec sheet** (matrix cells; empty CMS fields produce no cell);
- narrative sections numbered 01…05 (only the sections with content);
- the cover in registration marks;
- related rows use the new case file.

Nothing is hardcoded: every value is a CMS field.

## 12. About Improvements

- The portrait is a registered figure, sticky on desktop.
- It carries a caption with the confirmed identity (name and title from the CMS Profile).
- `portrait.jpg` is unchanged. The same crop and never-enlarge rule apply.
- The biography text is CMS content, unchanged.

## 13. Skills Improvements

`SkillGroups.tsx`: a **capability matrix**.
- One hairline cell per CMS category, in CMS order.
- Each cell carries its index, the discipline and a measured count.
- Home shows a compact wrapped list; `/skills` shows a vertical list with proficiency labels and evidence links.
- The `#skill-<id>` anchors are preserved.
- No percentages or bars (CONTENT_MODEL).

## 14. Experience / Certificates / CV

- **Experience:** a timeline rail with a node per role. Periods are set in mono. The organisation is set as an accent sub-line.
  - Where the owner gave **no start date**, the period column is removed rather than left empty. Nothing is inferred.
- **Certificates:** a 2-column register. Each entry has a mono register number, the issuer label, and a mono issue date and credential ID. Verification links and attachments are unchanged. There is no certificate schema (SEO_MASTER §25).
- **CV:** inherits every change above; it is composed from the same components.

## 15. Navigation

Unchanged by design: the header, text roll, native menu dialog and language switcher were already strong, and they sit on the critical path.

Onward links (section actions, About "Continue") keep the growing underline.

## 16. Micro-interactions

One delegated client island, `PointerEffects.tsx`, which renders nothing:
- one `pointermove` listener and one rAF per pointer frame;
- fine pointers only; nothing under reduced motion.

Effects:
- cursor light on project rows, skill cells and certificate cells;
- magnetic primary buttons (≤ 6 px);
- press scale on buttons;
- hairline draw on rows;
- mark widening on figures;
- a scroll-drawn pipeline line at the close.

Every effect is decorative: no content or action depends on it.

## 17. Mobile

These are intentional compositions, not shrunk desktops (SIMULATED 390×844 and 768×1024):

- The core is **centred above the identity**, filling the former void. It has its own portrait-framing path.
- Its ignition approach passes **above** the lower-third caption, so it never sits behind the text.
- The readout wraps below the identity. At 320 px the flex layout wraps instead of overflowing; a 10 px overflow was found and fixed.
- Low tier: 40-segment lathe and sphere, no iridescence, no pointer tilt.
- Matrix and register cells stack to one column.

## 18. Accessibility

Final production build, 11 routes × 4 modes (1440 dark, 1440 light, 390 dark, 320 dark):

| Check | Result |
|---|---|
| axe WCAG 2.0/2.1/2.2 A + AA (33 checks) | **0 violations** |
| Horizontal overflow at 1440 / 390 / 320 | **0** |
| Keyboard focus, first 14 tab stops per route | visible everywhere |
| Screen-reader semantics | new graphics `aria-hidden`; readout is a labelled `<dl>`; headings unchanged (1 H1 per page; exactly 6 H2s in `#cinematic`, per E2E) |
| Reduced motion / no WebGL / Save-Data / ≤ 2 GB | static tier; drawing + portrait shown; no canvas (E2E) |
| Screen readers with assistive technology | **NOT TESTED** (no AT available) |

Two issues were found during the phase and fixed:
- a light-mode contrast failure on the filter counts (`opacity-70` was removed);
- the 320 px overflow (§17).

## 19. Performance

**Bundles:**
- Method: gzip level 9 of the `<script src>` tags in the server HTML, `noModule` excluded; baseline and final measured the same way.
- This method gives 164,063 B for the baseline, where Phase 10's method gave 164,430 B.

| Asset | Baseline | Final | Δ | Budget |
|---|---|---|---|---|
| Critical JS `/` | 164,063 | **164,553** | +490 | ≤ 170 KB ✅ |
| Critical JS `/projects` | 163,569 | 164,291 | +722 | ✅ |
| Critical JS `/about`, `/experience`, `/certificates`, `/cv` | 162,293 | 162,782 | +489 | ✅ |
| Critical JS `/skills`, `/contact` | 156,682 | 157,171 | +489 | ✅ |
| Scene chunk (lazy) | 943,103 raw / 249,762 gz | 952,170 / **252,670 gz** | +2,908 gz | ≤ 400 KB ✅ |
| Public CSS | 45,186 / 9,926 gz | 53,686 / 11,305 gz | +1,379 gz | — |
| Portrait | 71,666 B | 71,666 B, SHA-256 `1c00fa07…323fca` | 0 | ≤ 150 KB ✅ |

The +489 B on every route is `PointerEffects`. Critical-JS headroom is now about 5.4 KB.

**3D.** REAL HW for the laptop rows, SIMULATED for the phone rows. Interleaved ABBA runs (after, baseline, after, baseline) of the same harness on the same machine. The baseline is `git archive HEAD`, built and served in isolation.

| Measure | Baseline | Final |
|---|---|---|
| Environment build (PMREM, R-59) | 601–603 ms | 604–616 ms |
| Parallel program compile | 196–202 ms | 372–385 ms |
| Canvas first frame (from navigation) | 1,510–1,527 ms | 1,742–1,762 ms |
| Draw calls / triangles at arrival | 9 / 4,646 | 19 / 12,006 |
| Peak draw calls during a full scroll | 24 | **24** |
| Geometries / textures at arrival | 21 / 6 | 31 / 10 |
| Draws in 3 s idle (top of page) | 0 | **0** |
| Draws in 3 s offscreen | 0 | **0** |
| Draws in 3 s after pointer settle | n/a | **0** |
| Scroll frame p50 / p95 / p99 / max | 6.1 / 6.2 / 6.2–6.3 / 30.3 ms | 6.1 / 6.2 / 6.2–6.3 / 30.2–30.3 ms |
| Frames over 33 ms during scroll | 0 | **0** |
| JS heap after GC | 8.3 MB | 8.8–8.9 MB |
| Navigation ×3, home ↔ `/projects` (canvas on projects / home; heap) | 0 / 1; 9.7 → 10.3 MB | 0 / 1; 10.5 → 11.0 MB (same shape, no leak) |
| dGPU final: first frame / compile / scroll max / over 33 ms | — | 1,891 ms / 423 ms / 30.5 ms / 0 |
| Phone, SIMULATED (Low tier): first frame | 1,449–1,459 ms | 1,605–1,695 ms |
| Phone, SIMULATED: draws / triangles | 9 / 2,566 | 19 / 7,326 |
| Phone, SIMULATED: scroll max / over 33 ms | 24.2 ms / 0 | 24.1–24.2 ms / 0 |

**NOT MEASURED:**
- GPU frame time per draw: no GPU timer query in the harness. The rAF intervals above are the proxy.
- GPU memory: no per-tab API.
- Physical phones, CPU-throttled profiles and Lighthouse: no device, throttling was out of scope, and no Lighthouse dependency may be added.

The core compiles **before** the first frame (the Phase 8 `compileAsync` gate), so it adds no mid-scroll stall.

## 20. Visual Regression

**Method:** the same capture harness on the baseline and final production builds. Mean absolute difference per channel, and the share of pixels differing by more than 40 (`qa/diff.mjs`).

| Frame (1440 dark) | Mean abs. | px > 40 | Expected? |
|---|---|---|---|
| p00, p07 (arrival) | 1.83, 1.97 | 1.5 % | Yes: core, readout, caption |
| p17, p30 (ignition, intelligence) | 0.92, 0.90 | 0.8–1.1 % | Yes: docking core |
| p45, p56, p72, p86 (engineering → identity) | 0.00–0.07 | ≤ 0.02 % | **Unchanged**: approved acts preserved |
| p97 (transition into the portfolio) | 0.33 | 0.06 % | Yes: new section header |

| Other captures | Result |
|---|---|
| 390 phone | arrival 10.2–10.8 (the core fills the former void); acts from p45 on: 0.00–0.03 |
| 1440 reduced motion | arrival 1.07–1.10 (drawing and readout); **every later act 0.00**; p97 3.55 (portfolio restyle) |

**One regression was found and fixed.** The first version placed the drawing in the sticky stage, so in the static tier it persisted behind the later acts and collided with the "Human intent" caption. It was moved into the arrival chapter; the reduced-motion later acts then returned to exactly 0.00.

**Approved-frame harness:** the Phase 3 approved-frame harness (19 frames, `.next/e2e` preview build) was **not re-run**; it lives in earlier sessions' scratchpads. The build-vs-build diffs above cover the same acts.

**RTL (Arabic preview, dev server only):**
- captures at 1440 and 390;
- the header, hero identity, readout position, drawing and 3D core mirror correctly;
- 0 overflow.

Arabic CMS content is unapproved, so RTL **content** rows (projects, skills) could not be seen populated.

## 21. SEO Verification

- `pnpm seo:audit` against the production build, with `PRODUCTION=true` and `SITE_URL=https://yazanalsamman.com`: **22 pages, 0 errors**.
- The H1 contract and text, JSON-LD, canonicals, hreflang (`en` + `x-default`), robots and sitemap are unchanged.
- The readout and all new content are server-rendered HTML; nothing lives only in WebGL.
- Route status on the final build:

| Route | Status |
|---|---|
| `/`, `/about`, `/projects`, `/robots.txt`, `/sitemap.xml` | 200 |
| `/ar`, `/ar/projects`, `/design-system`, `/does-not-exist` | 404 |

## 22. CMS Integrity

- The content contract (`src/content/types.ts`) and the adapters are untouched. Components consume only existing fields.
- Counts, stacks, categories, dates and the email come from the repository.
- New UI strings live in the message catalogs:
  - `cinematic.figure`, `cinematic.readout`;
  - `pages.portfolio.pipeline.*`, `pages.portfolio.stack`, `pages.portfolio.shownOf`.
- Arabic drafts of those strings are in place, and the catalogs keep key parity and pass the no-duplicate test.
- `src/config/copy-review.ts` is unchanged. The Arabic gate is still closed.
- `pnpm test:cms`: 49/49.

## 23. Files Changed

**New:**
- `src/scene/parts/InferenceCore.tsx`: the 3D object;
- `src/scene/core-path.ts`: its choreography;
- `src/components/cinematic/StaticCore.tsx`: the drawing;
- `src/components/shell/PointerEffects.tsx`: the pointer island;
- `docs/reports/DESIGN_EVOLUTION_REPORT.md`: this report.

**Modified:**
- `src/scene/CinematicCanvas.tsx`: mounts the core;
- `src/app/globals.css`: tokens and §12;
- `src/app/[locale]/page.tsx`: hero;
- `src/app/[locale]/layout.tsx`: mounts `PointerEffects`;
- `src/app/[locale]/about/page.tsx`;
- `src/app/[locale]/projects/page.tsx`;
- `src/app/[locale]/projects/[slug]/page.tsx`;
- `src/components/cinematic/StaticComposition.tsx`;
- `src/components/portfolio/{HomeSections,ProjectRow,ProjectIndex,SkillGroups,ExperienceList,CertificateList}.tsx`;
- `src/components/ui/actions.tsx`;
- `messages/en.json`, `messages/ar.json`;
- `tests/unit/cinematic.test.ts`: +4 tests.

**Not touched:** `.env` (mtime 2026-09-27; it was sourced read-only by the isolated baseline build process and never printed), `photos/`, `portrait.jpg`, `src/config/copy-review.ts`, deployment files, Git history.

## 24. Tests

All checks on the final code:

| Check | Result |
|---|---|
| `pnpm lint` | ✅ 0 problems |
| `pnpm typecheck` | ✅ 0 errors |
| `pnpm format:check` | ✅ |
| `pnpm test` | ✅ **99/99** (95 + 4 new core-path tests: continuity, dock, RTL mirror, per-orientation framing) |
| `pnpm test:cms` | ✅ **49/49** |
| `pnpm build` (production) | ✅ |
| `pnpm test:e2e`, run 1 | ✅ 164 passed, 33 skipped, 0 failed |
| `pnpm test:e2e`, run 2 | ✅ 164 passed, 33 skipped, 0 failed |
| `pnpm seo:audit` | ✅ 22 pages, 0 errors |
| axe | ✅ 0 violations in 33 checks |

E2E notes:
- Run 1 overlapped two small CSS/markup edits (§18 fixes). Run 2 ran on the final code.
- The existing E2E suite asserts the cinematic contracts: 6 act H2s, lazy chunk, fallbacks, draw calls < 60, triangles < 50k.

## 25. Before/After Measurements

See §19 (bundles, 3D) and §20 (visual regression).

Lab CWV were not re-run: LCP is still the HTML H1 (unchanged markup and position), and CLS sources were not changed (the readout is in flow and server-rendered; the drawing is absolute). **NOT MEASURED** in this phase: LCP, CLS and INP numbers.

## 26. Remaining Issues

1. **First WebGL frame is about 230 ms later** (four more programs compiled before the first frame). The static drawing covers this window. Precompiled shaders or deferring the core's compile to after first paint would trade that for mid-scroll risk.
2. **Physical phones, CPU-throttled mobile, GPU timing and GPU memory:** NOT MEASURED (R-43).
3. **The Phase 3 approved-frame regression harness was not re-run** (§20). Build-vs-build diffs were used instead.
4. **RTL content rows** are unverified with real Arabic content (the content is unapproved).
5. **Content, an owner decision:** the CMS short bio ("developer … mobile and web applications") undercuts the AI-engineer positioning. Only 5 of 14 projects have covers. The design now handles missing covers gracefully, but case-study imagery and body sections (problem, architecture, results) would strengthen the archive most. Nothing was rewritten.
6. **Ignition at 1440 px:** the core's approach passes close to the end of the centred caption for a fraction of a viewport. It was moved clear in testing; the final keyframe (x = 3.9) was not re-captured separately.
7. **21st.dev MCP:** unavailable (§5). Rotate the API key that was displayed in the session.
8. **Docs:** `docs/DESIGN_SYSTEM.md` does not yet describe the §12 components. This report is the current reference.

## 27. Final Design Verdict

| Question | Answer |
|---|---|
| **Identity** | The first viewport now shows the name, a manufactured AI module and verified numbers together. |
| **Craft** | Every portfolio section has a deliberate structure (case file, matrix, register, rail, pipeline) in one typographic system. |
| **Technology** | The object and its motion describe a real pipeline: sensor → silicon → routing → activation → inference. |
| **Hierarchy** | Section titles are display-size, and metadata has its own voice. |
| **Motion** | One subject per view, scroll-driven, meaningful; feedback-only UI motion. |
| **Restraint** | No new colours, glass, glow or particles; one warm note. |
| **Responsiveness** | Separate phone composition; 320 px safe. |
| **Accessibility** | 0 axe violations; the WebGL-less tier shows the same object as a drawing. |
| **Performance** | Every budget holds: idle 0, scroll unchanged. |
| **Originality** | The object, the drawing and the instrument language are original to this site. |

**Outstanding, per §26:** physical-device measurement, a re-run of the approved-frame harness, and owner-side content improvements.

**DESIGN EVOLUTION COMPLETE — with the disclosed gaps in §26.**

**Git state** (no commit, push, reset, rebase, stash or history operation):

```text
$ git log -1 --oneline
df5b37b feat: publish the portfolio as a clean public snapshot
$ git status --short        # 18 modified, 5 new (incl. this report), plus the pre-existing untracked docs/deploy/ and PHASE_10_REPORT.md
```
