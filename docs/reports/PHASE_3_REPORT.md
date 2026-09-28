# Phase 3 Report — Cinematic 3D Landing Experience

**Date:** 2026-09-28 · **Branch:** `master` (uncommitted working tree; nothing staged, committed or pushed)
**Scope:** Phase 3 only: the homepage cinematic narrative "From human intent to machine intelligence". No Phase 4+ work, no CMS or admin changes, no deployment changes.

---

## 1. Objective

Turn the homepage into a scroll-driven cinematic sequence in eight acts: Arrival, Ignition, Intelligence, Engineering, Systems, Human Intent, Identity, Transition.

The sequence has to meet these constraints:

- **HTML stays authoritative:** crawlable and accessible, with the 3D layer as an enhancement only.
- **Budget:** the ≤ 170 KB gzip critical-path JS budget holds (Phase 2: 159,595 B).
- **Portrait:** the authoritative `portrait.jpg` (538 × 661) is used without modification or upscaling.
- **Degradation:** reduced motion, no WebGL, no JavaScript and load failures all degrade gracefully.
- **Mobile:** it gets a dedicated composition.
- **Arabic:** the copy-review gate stays in force.

## 2. Starting State

- **Phase 2:** complete, verdict READY FOR PHASE 3. Payload CMS 3.90.2 is approved, and identity comes from the CMS Profile through `src/content/repository.ts`.
- **Homepage:** a single hero with the H1 ("Yazan Al Samman — Artificial Intelligence Engineer" / "يزن السمان — مهندس ذكاء صنعي"), JSON-LD, and a development-only "pending sections" panel.
- **Public `/`:** 159,595 B JS (9 files), 8,630 B CSS. LCP is the H1, CLS 0.
- **ADR-007 (Phase 0):** three + R3F with selective drei, postprocessing in High, no GSAP/Lenis, lazy island, HTML LCP.
- **Tests:** 29 unit, 29 CMS integration, 75 e2e (+32 skipped by design).

## 3. Design Direction

**"An architectural computational space that assembles, acts, and then yields to a person."**

The palette, type and tokens of the existing design system are unchanged.

- **Environment:** Obsidian `#07090D` with Steel grid lines, restrained studio lighting (one neutral key, one cool rim, low fill) and exponential fog for depth.
- **Signal colours:** Electric Cyan, AI Violet and Signal Blue appear only as signal: circuit pulses, activation waves, joint rings, connection lines. There is no environmental neon.
- **Materials:** dark anodized aluminium, brushed metal, procedural 2 × 2 twill carbon, all image-based lit from a procedural room environment (no HDR download).
- **Typography carries the narrative:**
  - Each act has one label (Space Grotesk, measured `02 —— LABEL` index motif from Phase 1) and one line.
  - The Identity act is typographic, not a 3D title.
- **Restraint:** Arrival and Identity are intentionally almost empty. Every animation is a function of scroll progress: no idle spinning, no random particles, no camera drift.
- **Light mode:** the stage stays dark in both themes, because the cinematic stage is a dark "installation". The Transition act bridges the stage into the page theme with a gradient.

## 4. 21st.dev Research

**Status: the 21st.dev MCP was not available in this session.** No `21st` MCP tools are exposed to the session. In Phase 1 the server was reached over HTTP with the owner's configured key. This time, the Phase 3 brief explicitly forbids a credential workaround, so **no workaround was attempted and no credentials were read.**

What was used instead:

- **Inspected (Phase 1 research, already in the codebase):**
  - "Immersive Full Screen Navigation" (hyperiux): clip-path reveal, editorial type, index numerals.
  - "Header 1" (efferd): transparent-to-solid sticky header.
  - An underline pattern (soralabs).
- **What influenced Phase 3:**
  - The Phase 1 editorial index motif (`01–08` + hairline) became the act-label system.
  - The CSS-first, zero-JS motion approach carried over: the header, `.reveal` scroll-driven captions and the static composition are all CSS.
  - The **ui-ux-pro-max** skill (installed) was consulted for scroll-storytelling practice:
    - camera scrubbed by scroll, never scroll-jacked;
    - DPR cap 2;
    - particle budgets ≤ 3 k on mobile;
    - GPU resource disposal;
    - no scroll snapping.
- **Intentionally rejected:**
  - GSAP ScrollTrigger pinning (scroll-jacking; 46 KB).
  - Lenis smooth-scroll (fights native keyboard/AT scrolling).
  - Glassmorphism cards over the scene.
  - Per-character text splitting (breaks Arabic shaping).
  - Bloom/postprocessing (neon look; +27 KB).
  - Spline embeds.
  - Stock robot/brain models.

**Final quality gate Q11 ("Did 21st.dev materially improve the design research?")**: honestly, **not in Phase 3**. The Phase 1 research was reused. Access has to be restored natively (MCP loaded at session start) before later phases can use it.

## 5. Cinematic Narrative

The timeline is a single table (`src/scene/timeline.ts`). Act lengths are in viewport heights, 8.4 in total. The same table sizes the HTML chapters and drives the scene, so text and image cannot drift.

| Act | Progress range | HTML layer | Scene |
|---|---|---|---|
| I · Arrival | 0.000–0.131 | `<h1>` name + title (CMS), "Scroll to enter" cue, "Skip the intro" → `#portfolio` | Sparse point field (5.2 k / 1.4 k points, 3.5 % signal points), measured floor grid fading into fog, a thin cyan→violet horizon. Camera dollies in slightly. |
| II · Ignition | 0.131–0.238 | `02 Computation` — "Every system begins as a signal." | Manhattan circuit paths on the floor are traced outward from the origin by scroll (distance-parameterised shader), with a cyan pulse at the wavefront. The camera lifts to a three-quarter view. |
| III · Intelligence | 0.238–0.381 | `03 Intelligence` — "Structure emerges from data." | An abstract 5-layer graph (no brain, no head): nodes assemble from scattered positions, staggered input → output. Edges then appear and a violet activation wave travels through the layers. The graph is framed to the side of the copy. |
| IV · Engineering | 0.381–0.536 | `04 Engineering` — "Intelligence needs a body to act." | A procedural 5-axis actuator (bevelled extruded links, anodized/brushed/carbon materials, cyan joint rings). It assembles from an exploded state in the first half of the act, then articulates (yaw/shoulder/elbow/wrist) with scroll. It receives shadows in High. |
| V · Systems | 0.536–0.643 | `05 Systems` — "Software, data and machines, composed as one." | Pull-back to a unified view: circuits, graph and actuator together. Connection curves are drawn from the graph outputs to the end-effector, and a travelling wave cycles through the graph. |
| VI · Human Intent | 0.643–0.798 | `06 Human intent` — "Every system starts with a question someone chose to ask." + portrait `<img>` | The machine recedes (graph dims to 10 %, actuator fades). The portrait is revealed by a scroll-driven sampling scan, and connection curves draw from every subsystem to the portrait (§7). |
| VII · Identity | 0.798–0.917 | Display composition of name + title (`aria-hidden`; the H1 already states it) | The system simplifies: all points collapse into one horizon line, and the portrait and connections fade. |
| VIII · Transition | 0.917–1.000 | `08 The work` — "The person behind the systems." Then `#portfolio` | The canvas fades out by progress. A gradient bridges the dark stage into the page theme and the portfolio content takes over. |

All copy is conceptual. **No facts were invented:** no metrics, employers, years or technologies. Identity comes from the CMS Profile only.

## 6. 3D Architecture

**Layering (ADR-007, INFORMATION_ARCHITECTURE §4):**

```
section#cinematic  (server-rendered)
├─ .cine-stage  sticky 100svh, data-theme=dark, aria-hidden
│   ├─ StaticComposition   CSS only (always present)
│   └─ CinematicStage      client island → lazy CinematicCanvas (three + R3F)
└─ .cine-chapters  HTML copy per act (heights from the timeline)
div#portfolio
```

**Scene (`src/scene/`):**

- **Pure modules (unit-tested):**
  - `timeline.ts`: acts, ranges, `actProgress`, envelopes, `damp`.
  - `camera-path.ts`: keyframes.
  - `quality.ts`: tiers.
  - `progress.ts`: scroll → progress.
  - `random.ts`: seeded PRNG.
- **Parts:**
  - `Field`: points, grid, horizon.
  - `Circuits`, `NeuralGraph` (instanced nodes + edges), `Actuator`, `Links`, `Portrait`.
  - `Director`: per-frame orchestration and stats.

**Controls and timeline:**

- **Progress model:** `scroll → normalized progress → damped progress → per-act local progress → scene state`.
- **Scroll listener:** one passive listener (rAF-throttled) writes `progress.target`. It uses a centre-line model: the act on screen is the chapter whose copy crosses the viewport centre.
- **Damping:** the Director damps toward it every frame (`damp(p, target, λ = 6, dt ≤ 0.1 s)`). No overshoot or velocity explosions (unit-tested).
- **Input:** wheel, touch, keyboard (PageDown/End/Home verified) and the scrollbar all behave identically, because native scroll is never intercepted. There is no scroll snapping or pinning.
- **State:** scene state is centralized (`sceneState`). No React re-renders per frame.

**Camera:**

- **Keyframes:** one to two keyframes per act, interpolated with smoothstep easing so the camera settles on each composition like a dolly operator.
- **Framing sets:**
  - Landscape set: subjects are framed opposite the copy.
  - Portrait set (aspect < 0.85): pulled back, subjects centred, wider lens.
- **Continuity:** unit-tested (< 0.35 world units per 0.1 % progress) for both sets.

**Assets:**

- **No external models or textures.** Geometry is procedural with seeded randomness (deterministic), and all shaders are custom GLSL.
- **Downloaded assets:** the only one is the build-hashed copy of `portrait.jpg` (71,666 B).
- **Generated textures:** the carbon weave is a 64 × 64 canvas texture generated at runtime. The environment is generated by PMREM from three's `RoomEnvironment`.

**Materials and lighting:**

- **Materials:** `MeshPhysicalMaterial` (anodized: metalness 0.9 / clearcoat; brushed; carbon with clearcoat).
- **Lighting:**
  - ACES filmic tone mapping (exposure 1.05).
  - Ambient 0.08, a key directional light (1024² shadow map in High), a Signal Blue rim and a local point light on the actuator.
  - Fog `FogExp2(obsidian, 0.03)`.

**Quality tiers (`detectTier`):**

| Tier | Selected when | Scene |
|---|---|---|
| **static** | `prefers-reduced-motion`, no WebGL2, Save-Data, `deviceMemory ≤ 2` | No three.js download; CSS composition + HTML portrait |
| **low** | coarse pointer or width < 768 (phones, tablets) | 1,400 points, 8 nodes/layer, 14 circuit paths, no antialias, no shadows, DPR ≤ 1.5 |
| **medium** | ≤ 4 cores or ≤ 4 GB | 3,000 points, 11 nodes/layer, 24 paths, antialias, no shadows, DPR ≤ 1.5 |
| **high** | otherwise | 5,200 points, 14 nodes/layer, 34 paths, antialias, PCF shadows, DPR ≤ 2 |

**Runtime behaviour:**

- **Adaptive DPR:** a sustained average frame > 25 ms over 120 frames lowers the DPR by 0.25, down to a floor of 1.
- **Pausing:** the frameloop stops when the section is offscreen (`IntersectionObserver`).
- **Cleanup:** all geometries, materials and textures are disposed on unmount.
- **Deviation from the Phase 0 wording of ADR-007** ("Low downloads no three.js"): Low renders a reduced scene, and **static** is the no-download tier. The brief's LOW tier describes a reduced *scene*. This is documented as an ADR-007 amendment and can be reverted in one line.

**Failure handling:** each of the following leaves the static composition in place and marks the section `data-cinematic="static"`:

- WebGL2 is unavailable;
- the chunk fails to load (verified by aborting it in e2e);
- a runtime error occurs (error boundary);
- the WebGL context is lost.

The canvas is hidden until its first frame exists, so there is never a blank canvas or a spinner.

**Isolation:** the canvas receives only plain props (tier, portrait URL, active flag, fade ref). The scene has no CMS, router or i18n access, and Payload stays isolated in `src/content/*`.

## 7. Portrait Integration

- **Source:** `portrait.jpg` at the repository root. It is imported by the home page as a static import, so the build emits a **hashed copy**. The source file is never written: **SHA-256 before and after Phase 3 = `1c00fa075b97e2ef8a3460b3d62155052533729994041bd7f562ed5177323fca`** (unchanged), and git shows no modification.
- **Scene treatment (`parts/Portrait.tsx`):** the image is used as a texture on two planes.
  - **Front plane:**
    - a UV crop (u 0–0.94, v 0.12–1) removes the third party's hand and pen at the bottom-right edge;
    - a restrained Obsidian→Cloud duotone keeps **18 % of the original colour**, so the person stays authentic;
    - a faint cool rim on highlights and a soft vignette mask dissolve the edges into the environment (no pasted rectangle);
    - a scroll-driven "sampling scan" reveal with a faint sampling grid shows the machine perceiving its origin.
  - **Back plane:** a heavily mip-blurred, darkened atmosphere layer 0.9 units behind. This is honest 2.5D depth separation, not face reconstruction.
- **Resolution discipline:** every frame, the projected height is **capped at the cropped source height (582 CSS px)**. The portrait is never displayed larger than its source and never full-screen.
- **No AI processing:** no AI upscaling, generative fill, face reconstruction or hallucinated background.
- **HTML portrait:**
  - An `<img>` rendered with `next/image` (optimized derivative, 11.7 KB) in the Human Intent chapter, with the same crop in CSS and a maximum width of 20 rem (no enlargement).
  - Alt text: "Portrait of Yazan Al Samman" (from the CMS name).
  - It is the visible portrait in static/no-JS mode.
  - In WebGL mode it is visually hidden but stays in the accessibility tree, because the canvas is `aria-hidden`.
- **Derivatives:** no files were generated or committed. Next's image optimizer creates cached derivatives at request time.

## 8. Performance

All sizes are measured transfer (gzip/br) on the production build (`next start`), Chrome, with a cold cache.

| Metric | Phase 2 | Phase 3 | Change |
|---|---|---|---|
| **Critical-path JS** `/` and `/ar` | 159,595 B (9 files) | **167,243 B (10 files)** | +7,648 B (+4.8 %) · **within the ≤ 170 KB budget** (2,757 B headroom vs 170,000 B) |
| Deferred 3D chunk (three + R3F + scene) | — | **250,527 B (1 file)** | Requested only after idle time, only for low/medium/high tiers; never for static |
| CSS | 8,630 B | 9,472 B | +842 B |
| Images, static/no-JS | — | 11,711 B (optimized fallback portrait) | |
| Images, WebGL | — | 83,677 B (+71,666 B hashed original as texture) | |
| Fonts | 114,292 B EN · 205,876 B AR | unchanged | 0 |
| LCP element | H1 | H1 (`span.font-display`) | LCP 108–288 ms locally |
| CLS | 0 / 0.0002 (AR) | 0 / 0.0002 (AR) | 0 |
| Payload/Lexical code in public chunks | 0 | 0 | isolated (bundle audit) |

**What the +7.6 KB is:** the client island (tier detection, scroll binding, lazy loader, error boundary) plus the `next/image` client component. Replacing `<Image>` with `getImageProps()` was tried and produced a byte-identical chunk, so the simpler `<Image>` was kept. This is tracked as R-41.

**Scene complexity** (`window.__cinematic`, sampled at act centres):

| Tier | Draw calls | Triangles | Points | GPU geometries / textures | JS heap |
|---|---|---|---|---|---|
| high (1440 × 900) | 9–23 | 4,646–8,674 | 5,200 | 34 / 7 | 11–14 MB (static page: 5–6 MB) |
| low (390 × 844, 768, 1024 touch) | 8–20 | 2,564–5,882 | 1,400 | 33 / 5 | 12–13 MB |

- **Textures:** portrait 538 × 661; carbon 64 × 64; PMREM environment; shadow map 1024² (High only).
- **Frame rate:** 157–165 fps at the actuator reveal on this machine (display-capped, hardware GPU). There were transient dips to 78–107 fps when the actuator first appears (first-use shader/material setup). **This is not a device benchmark**; real mid/low-end devices are a Phase 8 task (R-43).

**Loading behaviour:**

1. The server HTML already contains the identity and all act copy.
2. Fonts and CSS load; the static composition is the first paint.
3. After hydration + `requestIdleCallback` (1.5 s timeout), the tier is chosen and the 3D chunk requested.
4. The canvas fades in after its first frame.

**Throttled test (400 ms RTT, 50 KB/s):**

- H1 visible at 2.06 s over the static composition.
- WebGL takes over at 13.9 s.
- The stage is never blank in between.

## 9. Accessibility

- **Headings:**
  - A single `<h1>` (CMS name + title) in the first viewport.
  - Six `<h2>` act headings in reading order (EN and AR).
  - Act chapters are `role="group"` labelled by their heading.
- **Decorative content:** the stage (static composition + canvas) is `aria-hidden`. The Identity display is `aria-hidden` because the H1 already states it. There is **no canvas-only text**.
- **Portrait:** always present as an `<img>` with meaningful alt text.
- **Keyboard:**
  - "Skip the intro" link (visible, reachable by Tab after the header controls, verified in e2e), which moves to `#portfolio` (focusable).
  - The global skip link to `#main` is unchanged.
  - Native keyboard scrolling drives the timeline (PageDown ×8 → p = 0.80; Home → p = 0.05).
- **Reduced motion:**
  - Static tier: no canvas, no camera travel, no particle motion.
  - The Phase 1 global contract collapses CSS transitions.
  - The narrative is preserved through the static composition, the act captions and the visible portrait.
- **Contrast:** copy is on the dark stage in both themes. The section carries the stage colour so contrast tools evaluate the real backdrop (this fixed a light-theme axe finding during Phase 3), and a soft text shadow keeps copy legible over bright metal highlights.
- **axe:** WCAG 2.2 A/AA shows **0 violations** on `/`, `/ar`, `/design-system` and `/ar/design-system`, in dark and light, on desktop and mobile. The cinematic section shows 0 in static mode.

## 10. Responsive Behavior

- **Desktop/laptop (landscape framing):**
  - The copy sits opposite the subject: the graph and actuator on the end side, the portrait on the start side (world-space placement is physical, so it is the same in RTL).
  - Captions for Ignition are centred.
- **Phones and portrait tablets** (aspect < 0.85): a dedicated camera path, not a scaled-down desktop.
  - The camera is further back with a wider lens (fov 44–56) and subjects are centred in the upper frame.
  - Copy sits in the lower third over a soft vertical scrim.
  - Low tier budgets apply.
  - The portrait is shown at ≤ 582 CSS px.
- **Tablet:**
  - 768 × 1024 portrait uses the phone composition.
  - 1024 × 768 landscape touch uses the landscape framing with the Low tier.
- **Viewport units:** `svh` everywhere, so mobile URL-bar resizing does not rescale the stage. `touch-action: pan-y` on the canvas.
- **Overflow:** no horizontal overflow at any sampled progress (e2e: EN/AR × desktop/mobile at five positions). Screenshots at 1440/1920/1280/1024/768/390 all show overflow 0.

## 11. SEO

- **Unchanged from Phase 2:** canonical, robots, sitemap, hreflang rules (Arabic not advertised while unpublishable), localized metadata and JSON-LD (`Person` from the CMS entity).
- **Server HTML is sufficient:**
  - It contains the H1, every act heading and line, and the portrait `<img>`.
  - With JavaScript disabled the page is complete: H1, 6 × h2, portrait visible.
  - No script referenced by the server HTML contains three.js (e2e).
- **No SEO tricks:** no hidden SEO text, keyword stuffing or JS-only metadata. The Identity display duplicates the H1 visually but is `aria-hidden`, and the H1 remains the single semantic heading.

## 12. Tests

**Final verification suite (final code):**

| Command | Result |
|---|---|
| `pnpm format:check` | "All matched files use Prettier code style!" |
| `pnpm lint` | exit 0, 0 problems |
| `pnpm typecheck` | exit 0 |
| `pnpm test` | **5 files, 40 tests passed** (+11 new in `tests/unit/cinematic.test.ts`) |
| `pnpm test:cms` | **1 file, 29 tests passed** (real PostgreSQL 17) |
| `pnpm build` | exit 0; `/en`, `/ar`, `/en/design-system`, `/ar/design-system` still SSG (●) |
| `pnpm test:e2e` | **98 passed, 0 failed, 33 skipped by design**, **5 consecutive clean runs** on the final code (the last 2 after the final CSS change) |

**New unit tests** (`tests/unit/cinematic.test.ts`):

- **Timeline:** contiguity and order, local progress, envelopes.
- **Motion maths:** smoothstep; damping with no overshoot and a dt clamp.
- **Camera:** continuity for both key sets; portrait fov wider than landscape.
- **Other:** tier mapping, tier-settings ordering, centre-line progress, seeded determinism.

**New e2e tests** (`tests/e2e/cinematic.spec.ts`, desktop + mobile):

- the content layer is real HTML;
- server HTML contains the identity before JS;
- skip-intro navigation;
- skip-intro keyboard reachability (desktop);
- the WebGL canvas mounts lazily and reports draw calls/triangles within budget, with no page errors;
- the 3D chunk is absent from the server-referenced scripts;
- reduced motion → static + visible portrait;
- WebGL unavailable → static;
- the 3D chunk failing to load → static;
- no overflow across the narrative (EN/AR);
- axe on the cinematic section.

**Skipped tests:** 33 skipped: the 32 Phase 2 by-design skips (desktop-only/mobile-only cases) plus the desktop-only keyboard-order test on mobile.

**Incidents (honest record):**

1. The first full e2e run found a real **light-theme axe contrast failure** on the Identity display. The sticky stage is a sibling of the copy, so contrast tools resolved the page's light background. Fixed by giving the section the stage colour.
2. The same run found a **test bug**: "3D chunk not in the initial load" read the live DOM, where the lazy chunk had correctly been injected. The test now reads the server HTML.
3. One later run had **one failure from a test race**. Scene stats are published every 120 frames, and the poll accepted the pre-scroll snapshot. The test now waits for a post-scroll snapshot. Because the `cms` project depends on the read-only projects, that failure also left the 9 CMS e2e tests unrun in that run. Five consecutive clean runs followed.

## 13. Visual QA

**Method:**

- Production build, Chrome (hardware GPU).
- Screenshots at act centres (p = 0, .185, .31, .43, .5, .589, .7, .75, .857, .958). Captures are kept in the session scratchpad and not committed.
- Every capture was inspected, and the issues found were fixed before the final run:

| Found | Fix |
|---|---|
| Portrait rendered almost full-screen at the end of Human Intent (exposes resolution) | New camera keys + per-frame cap at the source height |
| Hard rectangle edges on the portrait layers | Softer vignette and atmosphere masks |
| Neural graph and actuator competing with the Human Intent copy | Graph recedes to 10 %, actuator exits after Systems |
| Graph nodes too large/bright; copy overlapping nodes | Smaller nodes; graph framed opposite the copy |
| Arrival too empty on WebGL; cue and skip link below the fold | Stronger grid and a horizon line; arrival content kept in the first viewport |
| Mobile: invisible fallback figure pushed the caption off-screen; hard scrim edge | Fallback leaves layout in WebGL mode (visually hidden, still accessible); scrim fades at both ends |
| Horizon crossing the Identity title; static floor edge touching the H1 | Identity copy raised; static horizon moved up |
| Copy over bright metal on 1024 landscape | Soft text shadow on chapter copy |

**Final state checked in each view:**

- **Desktop 1440 and 1920:** all eight acts (EN), key acts (AR).
- **Laptop 1280:** light theme.
- **Tablets:** 768 portrait, 1024 landscape.
- **Mobile 390:** EN (all acts), AR.
- **Fallbacks:** reduced motion, WebGL unavailable, JavaScript disabled, throttled network.
- **Other checks:** keyboard scrolling, header/menu unchanged, no text collisions at act centres, no clipping, no overflow.
- **Arabic RTL:**
  - Copy blocks align to the inline-start (right) edge, while the scene placement stays physical. This is intentional: the subjects are world-space objects.
  - Arabic labels carry no tracking or uppercase.

**Design quality bar (brief §23):** the result reads as a directed, custom sequence (typography + procedural scene), not a template with 3D added. That is a self-assessment; owner review is still the arbiter (R-18).

## 14. Known Limitations

1. **Not tested on physical phones or low-end GPUs.** Only mobile emulation on a desktop GPU was used (R-43). Phase 8 must measure on real devices. Switching Low → static is a one-line change if needed.
2. **Critical-path JS headroom is 2.7 KB** under the 170 KB budget (R-41).
3. **Console warning:** one `THREE.Clock` deprecation warning per WebGL page view, from R3F 9.8.1, the latest stable release (R-42). Harmless; the dependency was not patched.
4. **21st.dev MCP unavailable** in this session; no Phase 3 research from it (§4).
5. **Arabic cinematic copy is unreviewed.** The agent drafted it, and it stays behind the copy-review gate: `/ar` remains `noindex`/unpublishable (R-44, D-9).
6. **Reduced motion shows one static composition** for all acts. The narrative is carried by the captions and the portrait, not by per-act stills.
7. **No offline portrait matte or depth map.** Depth is a two-plane treatment (ADR-008 amendment).
8. **Light mode:** the stage is intentionally dark, and the dark→light bridge at the Transition act passes through mid-greys.

## 15. Architecture Changes

- **Dependencies (exact pins):** `three` 0.186.1, `@react-three/fiber` 9.8.1, `@types/three` 0.186.0 (dev). No drei, postprocessing, GSAP or Lenis.
- **New code:**
  - `src/scene/**`: timeline, camera path, quality, progress, random, state, seven parts, canvas.
  - `src/components/cinematic/{CinematicStage,StaticComposition}.tsx`.
  - Tests.
- **Changed code:**
  - `src/app/[locale]/page.tsx`: cinematic section + `#portfolio`; metadata and JSON-LD unchanged.
  - `src/app/globals.css`: §10 cinematic styles.
  - `messages/{en,ar}.json`: `cinematic` namespace.
  - `src/config/media.ts`: portrait note.
  - `src/components/ui/layout.tsx`: `Stack` typing narrowed. R3F's global JSX augmentation otherwise widens `ElementType`.
  - `eslint.config.mjs`: React Compiler `immutability`/`refs` rules off **for `src/scene/**` only**, with the reason recorded.
- **Docs:**
  - ADR-007 and ADR-008 "Phase 3 amendments".
  - INFORMATION_ARCHITECTURE §4 "As built".
  - RISK_REGISTER: R-06 updated; R-41–R-44 added.
- **Not changed:** CMS collections, admin, migrations, content repository contract, SEO modules, proxy, Docker/deployment.

## 16. Git State

- Branch `master`. HEAD `af32158` (history untouched; `889d6c7` not rewritten).
- Nothing staged, committed or pushed. No `.env`, keys or credentials were added.
- The working tree also still holds the uncommitted Phase 2 work, as at the start of this phase.
- **Phase 3 files:**
  - New:
    - `src/scene/`
    - `src/components/cinematic/`
    - `tests/unit/cinematic.test.ts`
    - `tests/e2e/cinematic.spec.ts`
    - `docs/reports/PHASE_3_REPORT.md`
  - Modified:
    - `package.json`, `pnpm-lock.yaml`
    - `src/app/[locale]/page.tsx`, `src/app/globals.css`
    - `messages/en.json`, `messages/ar.json`
    - `src/config/media.ts`, `src/components/ui/layout.tsx`
    - `eslint.config.mjs`
    - `docs/architecture/{ARCHITECTURE_DECISIONS,INFORMATION_ARCHITECTURE,RISK_REGISTER}.md`
- `portrait.jpg` is unmodified (SHA-256 above).
- Docker: the `yazan-portfolio-postgres` container was used by the CMS tests. Tavla and all other containers were not touched; nothing was pruned, stopped or deleted.
- `git status --short` and `git diff --stat` are reproduced at the end of the phase hand-off.

**Final quality gate (brief §31):**

1. Cinematic narrative: **yes** (eight acts, one table).
2. Scroll controls the story: **yes** (deterministic, damped).
3. AI/software/robotics without clichés: **yes** (no brain, head, code rain or neon).
4. Portrait integrated naturally: **yes**, within its resolution.
5. Works without WebGL: **yes** (tested).
6. Deliberate mobile composition: **yes**.
7. Reduced motion: **yes**.
8. SEO-first HTML: **yes**.
9. JS budget: **yes**, 167.2 KB ≤ 170 KB.
10. Payload isolated: **yes**.
11. 21st.dev improved the research: **no**, unavailable (documented, non-blocking per the brief).
12. Custom-built rather than templated: **yes** (self-assessed).
13. No unsupported facts: **yes**.
14. No secrets or unrelated projects touched: **yes**.
15. Tests and visual checks documented: **yes**.

## 17. Phase Verdict

READY FOR PHASE 4

## Owner Approval (2026-09-28)

The owner reviewed the Phase 3 result remotely using the visual review package (`PHASE_3_VISUAL_REVIEW.md`: 20 production screenshots and two full-scroll recordings) and **formally approved the Phase 3 visual design**.

The approval covers:

- **Direction and story:** the overall visual direction, the cinematic landing narrative and the 8-act sequence (Arrival, Ignition, Intelligence, Engineering, Systems, Human Intent, Identity, Transition).
- **Scene:** 3D composition, camera movement, scroll-driven behaviour, lighting and materials.
- **Integration:** typography integration and portrait integration.
- **Layouts:** desktop and mobile composition.
- **Fallbacks:** reduced-motion fallback and WebGL fallback.
- **Language and themes:** Arabic scene behaviour, dark-mode presentation and light-mode compatibility.

The approved implementation is now the **frozen baseline**. Later phases change Phase 3 code only when integration makes a change technically unavoidable. Any such change must be explained, must preserve the approved visual result, and must be verified and documented. The issues listed in the visual review are accepted as part of the approved baseline; they are not a backlog to fix.

**Final Phase 3 status:** APPROVED BY OWNER — READY TO PROCEED
