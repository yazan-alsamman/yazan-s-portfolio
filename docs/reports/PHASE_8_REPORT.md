# Phase 8 Report — Performance & 3D Hardening

**Date:** 2026-09-28 · **Branch:** `main` (HEAD `af32158`, uncommitted work tree) · **Scope:** measured performance only. The design, the cinematic scene, the content, the CMS, routing/i18n and the Arabic gate are frozen and were not changed.

**Measurement rule used throughout.** Every number below comes from an actual run, and each is labelled as one of:

- **REAL HW**: the laptop described in §4, running a real GPU.
- **SIMULATED**: the same laptop with CDP CPU throttling, network throttling and/or mobile emulation. These are *not* phone or low-end-device results.
- **NOT MEASURED — reason**: no numbers were estimated.

Conclusions rest on at least two runs. Before/after comparisons use interleaved **ABBA** runs (baseline r1 → optimized r1 → baseline r2 → optimized r2) of the same harness on the same machine.

---

## 1. Executive Summary

Phase 8 found **three real bottlenecks**, all in the home page's cinematic experience, and fixed them without changing what the user sees:

1. **The scene rendered ~165 frames/s forever, even when nothing moved.** Reading the page cost 17–22 % of the main thread, 31–39 % renderer CPU and 33–48 % GPU-process CPU (REAL HW, iGPU and dGPU). It continued offscreen at similar cost. With **demand rendering**, idle is now **0 frames/s and ~0 % CPU/GPU**.
2. **Shader compiles stalled the page mid-scroll.** Hidden parts (the actuator, the circuits) compiled their programs the first time they became visible, giving two frames of **515–552 ms** during the first scroll. With a **parallel compile of all scene programs before the first frame**, the worst frame during the same scroll is **30 ms** (p99 12.2 → 6.2 ms).
3. **The header's scroll-driven animation repainted the whole page every frame** after its range ended (~330 paints/s at rest), because it animated the backdrop filter. It now animates only an **opacity layer** (compositor-only), with the same end states.

**Result:** home main-thread time during a load and settle window fell by **38 % on the laptop** (2,737 → 1,687 ms) and **39–51 % under 4× CPU throttling** (SIMULATED). Scroll is smooth: 0 frames over 33 ms on every configuration tested. Critical JS is unchanged: `/` is **167,430 B** (baseline 167,407 B, budget 170 KB), and no CMS or server code reaches public bundles. LCP (0.28 s laptop, ~1.2 s simulated mobile, ≤ 3.0 s simulated slow 3G), CLS (**0** everywhere) and all lab interactions (≤ 136 ms simulated mobile) were already in budget and are unchanged within noise.

**What was not done:** no physical phone, no desktop PC and no lower-power laptop was available. Those device classes are **NOT MEASURED**, and the mobile figures are simulations. Lighthouse and field (CrUX/RUM) data are **NOT MEASURED** (no Lighthouse dependency may be added, and the site is not deployed). One cold-visit long task remains, the ~0.7 s synchronous PMREM environment compile (R-59). **Verdict: PHASE 8 PARTIALLY COMPLETE** (§33).

## 2. Starting State

- Real-content migration complete (REAL_CONTENT_MIGRATION_REPORT: READY FOR PHASE 8). English content is live through the CMS: 14 published projects (16 total, 2 draft), 28 certificates, 13 skills, 1 education entry, 1 experience entry, 27 media. Arabic is gated: every `/ar` route answers 404.
- Stack: Next.js 16.3.6 (Turbopack), React 19, Payload 3.90.2 on PostgreSQL (`yazan-portfolio-postgres`), three 0.186.1, @react-three/fiber 9.8.1 (no drei, no postprocessing).
- Git at start (`scratchpad/p8/git-initial.txt`): `main`, HEAD `af32158`, 38 modified, 3 deleted, 65 untracked. This is the uncommitted work of Phases 2–7 and the migration, which was preserved.
- A `next dev` server that **I did not start** (started 16:58) was running for the whole phase and holds `.next/dev`. I did not stop it. Its interference is described in §4.

## 3. Authoritative Documents Reviewed

`docs/ROADMAP.md`, `docs/architecture/ARCHITECTURE_DECISIONS.md` (ADR-007 cinematic, ADR-009 media, ADR-011 SEO, ADR-015 budgets and every phase amendment), `docs/architecture/RISK_REGISTER.md`, `docs/PERFORMANCE_ACCESSIBILITY.md`, `docs/LANDING_CINEMATIC_SPEC.md`, `docs/TECHNICAL_ARCHITECTURE.md`, `docs/reports/PHASE_3_REPORT.md`, `PHASE_3_VISUAL_REVIEW.md`, `PHASE_4_REPORT.md` … `PHASE_7_REPORT.md`, `REAL_CONTENT_MIGRATION_REPORT.md`, `CLAUDE.md`/`AGENTS.md` (Next.js 16 notice), `package.json`, `next.config.ts`, `playwright.config.ts`.

There is no `docs/ARCHITECTURE_COMPLIANCE_AUDIT.md`, `docs/PROJECT_ROADMAP.md`, `docs/RISK_REGISTER.md` or `docs/COPY_REVIEW.md`; the real equivalents are the files above and `src/config/copy-review.ts`.

**Budgets applied (ADR-015):**

- critical-path JS for `/` (excluding the lazy scene) ≤ 170 KB gzip;
- scene chunk ≤ 400 KB gzip;
- LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms;
- hero/portrait image ≤ 150 KB;
- High tier at 60 fps and Medium at ≥ 45 fps;
- render loop idle when offscreen.

## 4. Baseline Methodology

**Hardware (REAL HW):**

| Item | Value |
|---|---|
| Machine | Lenovo Legion 5 (82JW) notebook on AC power |
| CPU | AMD Ryzen 7 5800H, 8 cores / 16 threads |
| RAM | 14 GB |
| Display | 1920×1080 at 165 Hz |
| OS | Windows 11 Pro |
| Browser | Chrome (Playwright `channel: 'chrome'`) |

GPUs, as reported by WebGL `UNMASKED_RENDERER`:
- **iGPU:** "ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11)" (Chrome's default).
- **dGPU:** "ANGLE (NVIDIA, NVIDIA GeForce RTX 3050 Laptop GPU Direct3D11)" (`--force_high_performance_gpu`).
- Both expose `KHR_parallel_shader_compile`.

**Builds:** production (`SITE_ENV=production SITE_URL=https://yazanalsamman.com pnpm build`, `next start -p 3217`). Preview-mode builds were used only for the cinematic regression, which needs the `/ar` frame.

**Harnesses** (scratchpad, not in the repository):
- `perf.mjs`: 9 routes × 3 profiles; LCP/FCP/CLS/longtask/Event Timing observers; CDP `Performance.getMetrics`; transfer bytes.
- `scene.mjs`: headed Chrome on the iGPU or dGPU. It measures:
  - init marks and long tasks;
  - idle cost at arrival and offscreen: rAF rate, main-thread busy share, and per-process CPU from CDP `SystemInfo.getProcessInfo`;
  - frame-time distributions during slow and fast scroll, and during resize;
  - heap after GC; three.js `renderer.info`;
  - freeze/resume.
- `bundle.mjs` (raw/gzip/br, tagged). `crit.mjs` (critical JS from the server HTML's script tags, plus an admin-marker leak scan of every loaded chunk).
- CPU profiles, a menu-tap trace, tier and lifecycle probes, build-vs-build page captures.
- `regress.mjs` (the Phase 3 frames).

**Profiles:**
- `laptop`: 1440×900, no throttling. REAL HW.
- `laptop-cpu4x`: CPU 4× slower. SIMULATED lower-power laptop.
- `mobile-sim`: 390×844 @3×, touch, CPU 4×, 150 ms RTT, 1.6 Mbps. SIMULATED.
- `mobile-slow3g`: as `mobile-sim` but 400 ms RTT, 400 kbps. SIMULATED.

**Environment incidents (disclosed):**
1. The first baseline matrix ran while the foreign `next dev` server was compiling. It made non-home LCP look falsely halved after the change. That comparison was **retracted**; only the ABBA runs are used.
2. Early in the phase, moving/removing `.next` to swap builds also affected the dev server's `.next/dev` folder. The swap script was then changed to never touch `.next/dev` or `.next/cache`, and the stale copy was deleted at the end. The dev server kept running.
3. Two runs hit `EADDRINUSE` from a leftover server. One was discarded and redone. The other was verified by its transferred JS bytes to have been served by the intended build, and kept.
4. **A build-cache hazard was found (R-60).** The E2E build (empty `_e2e` database) leaves one-year data-cache entries in `.next/cache/fetch-cache`. A later production build reused them and prerendered six content routes as 404. Measurements on that build were discarded, `fetch-cache` was cleared, and the build was redone. All numbers reported here come from builds with HTTP 200 on every route.

## 5. Baseline Measurements

Baseline = the work tree at the start of Phase 8. Its sources are reconstructed byte-exactly: all 78 chunk names were reproduced.

| Measure (baseline) | Value | Class |
|---|---|---|
| Critical JS `/` | 167,407 B | build |
| Critical JS `/projects` | 166,937 B | build |
| Critical JS About / Experience / Certificates / CV | 165,660 B | build |
| Critical JS Skills / Contact | 159,749 B | build |
| JS total (73 files) | 4.39 MB raw / 1.29 MB gzip / 1.05 MB br | build |
| Scene chunk (three + R3F) | 942 KB raw / 249.4 KB gzip / 204.7 KB br | build |
| Home LCP / TBT / main-thread (laptop) | 318 ms / 758 ms / 2,737 ms | REAL HW |
| Home idle at rest (iGPU) | 165 frames/s, main 17–18 %, renderer 31–32 %, GPU process 33–35 % | REAL HW |
| Home idle at rest (dGPU) | 161–163 frames/s, main 21–22 %, renderer 37–39 %, GPU process 45–48 % | REAL HW |
| First slow scroll, worst frame | 515–552 ms (2 frames > 33 ms) | REAL HW |
| Header at rest | ~330 paints/s (Chrome paint events) | REAL HW |

Full per-route tables are in §16, with the baseline beside the final values.

## 6. JavaScript Bundle Analysis

| | Baseline | Final | Δ |
|---|---|---|---|
| JS total, gzip (73 files) | 1,290,320 B | 1,290,711 B | +391 B |
| Scene chunk, gzip (lazy, High/Medium/Low tiers only) | 249,394 B | 249,762 B | +368 B |
| Critical JS `/` | 167,407 B | **167,430 B** | +23 B |
| Critical JS, all other public routes | see §5 | identical | 0 |
| Admin/CMS markers in any chunk loaded by a public page | 0 | **0** | — |

- The largest chunks are admin-only: 373 KB and 112 KB gzip, tagged `cms/admin`, never requested by public pages.
- The scene chunk is 250 KB gzip against its ≤ 400 KB budget. It is downloaded only after the tier decision, and never for the static tier (§21–22).
- Phase 8 added code only to the deferred scene chunk. Critical-path headroom stays ~2.5 KB (R-41).

## 7. Client Component Analysis

There are six client islands, and each is justified:
- `HeaderNav`: active state.
- `LanguageSwitcher`: page-aware target, `prefetch={false}`.
- `ThemeToggle`.
- `MobileMenu`: native `<dialog>`.
- `ProjectIndex`: client filter.
- `CinematicStage`: tier decision; lazy-loads the scene.

All page content is server-rendered HTML. No island was merged or removed: none showed a measurable cost that removal would fix. Per-route critical JS differs only by these islands (§5).

## 8. Image Performance

| Page | Image bytes transferred | Class |
|---|---|---|
| Home | 72,084 B (the portrait texture, 71,666 B, loaded by the scene; the static composition uses the same file) | REAL HW |
| `/projects` | 41–47 KB (laptop), 41 KB (mobile-sim) | REAL / SIM |
| Project detail, project-hub-application | 132,934 B (laptop), 194,551 B (mobile-sim at DPR 3) | REAL / SIM |
| Project detail, breast-tumor-diagnosis-system | ~50 KB | REAL / SIM |
| About | 11,915 B | REAL / SIM |

- Delivery: WebP derivatives with `srcset`/`sizes`, and lazy loading below the fold (Phase 6). The LCP image on project pages is prioritized.
- The portrait is 71.7 KB, within the 150 KB hero budget. `portrait.jpg` was not modified: SHA-256 `1c00fa075b97e2ef8a3460b3d62155052533729994041bd7f562ed5177323fca` was verified at the end of the phase.
- **AVIF: NOT MEASURED — not evaluated in this phase.** No image was on the critical path of a slow LCP (§17), so WebP is kept.

## 9. Font Performance

- **English pages** download two preloaded WOFF2 files: Inter 48,256 B and Space Grotesk 22,288 B (71,378 B transferred), measured on every EN route. `font-display: swap`, with metric-adjusted fallbacks from `next/font`.
- The four IBM Plex Sans Arabic weights (177 KB) are **not** downloaded on English pages (measured).
- **R-31 (Arabic font preload): deferred.** Arabic is unpublished, so no Arabic page can be measured, and a preload would only add bytes. It will be re-opened when Arabic is approved.

## 10. 3D Architecture Audit

Structure:
- A lazy R3F island (`CinematicStage` → `CinematicCanvas`).
- A tier decision from capabilities, not the user agent (`detectTier`):
  - static: reduced motion, no WebGL2, Save-Data, or ≤ 2 GB memory;
  - low: touch or < 768 px;
  - medium: ≤ 4 cores or ≤ 4 GB;
  - high: otherwise.
- A `Director` runs first each frame (progress damping → camera → canvas fade), with adaptive DPR, offscreen pause and context-loss fallback.

Scene size (REAL HW):
- High tier: 9 draw calls, 4,646 triangles and 5,200 points at arrival, and 34 geometries / 7 textures after a full scroll.
- Low tier: 33 / 5.

Disposal: the environment map, room and PMREM generator are disposed on unmount. R3F disposes the scene graph.

**Findings:**
- (a) The frame loop was `always`, even though every frame is a pure function of scroll progress (no wall-clock animation anywhere).
- (b) Programs were compiled lazily at first visibility.
- (c) The environment prefilter (`PMREMGenerator.fromScene`) compiles synchronously. The CPU profile shows `fromScene` 632 ms (GGX prefilter 479 ms) and `getProgramParameter` 721 ms self time inside a 686 ms long task.

(a) and (b) were fixed (§27). (c) remains (R-59).

## 11. Desktop Measurements

**NOT MEASURED — no desktop PC available.** Only the laptop in §4 exists, with its two GPUs; results from it are not presented as desktop results.

## 12. Laptop Measurements

REAL HW, ABBA r1/r2:

| Measure | iGPU baseline | iGPU final | dGPU baseline | dGPU final |
|---|---|---|---|---|
| Scene ready (canvas shown) | 1,481–1,588 ms | 1,573–1,584 ms | 1,608–1,611 ms | 1,745–1,765 ms |
| Init long tasks, sum / max | 947–1,050 / 691–741 ms | 839–851 / 720–730 ms | 877–912 / 688–702 ms | 829–863 / 723–732 ms |
| Init TBT (Σ over 50 ms) | 747–800 ms | 689–701 ms | 727–762 ms | 713–729 ms |
| Idle at arrival, frames/s | 165.4 | **0** | 161–163 | **0** |
| Idle: main thread / renderer / GPU process CPU | 17–18 / 31–32 / 33–35 % | **0 / 0.1 / 0.1 %** | 21–22 / 37–39 / 45–48 % | **0 / 0.1 / 0.1 %** |
| Offscreen: main / renderer / GPU process | 13–14 / 28–29 / 35–36 % | **0 / 0.1 / 0 %** | 19–21 / 38–43 / 50–56 % | **0 / 0–0.1 / 0 %** |

- On the dGPU the canvas appears ~150 ms later, because all programs are compiled before it is shown. The static composition is on screen and interactive during that time.
- **SIMULATED lower-power laptop** (`laptop-cpu4x`): home main-thread time 6,978 → 3,438 ms; TBT 844 → 816 ms.
- **Physical lower-power laptop: NOT MEASURED — none available.**

## 13. Mobile Measurements

**Physical phones: NOT MEASURED — no Android or iOS device was available.** Everything below is SIMULATED (§4 profiles) on the laptop iGPU. It represents CPU and network cost, not a phone GPU, a thermal limit or battery.

| Measure (Low tier, `mobile-sim`, ABBA) | Baseline | Final |
|---|---|---|
| Scene ready | 2,638–2,759 ms | 2,742–2,777 ms |
| Init TBT | 1,488–1,538 ms | 1,422–1,456 ms |
| Idle at arrival: frames/s / main thread | 165.6 / 56–61 % | **0 / 0.1 %** |
| Slow scroll worst frame | 176–279 ms (3–4 frames > 33 ms) | **24 ms (0)** |
| Home LCP / TBT (page load) | 1,280 / 1,028 ms | 1,234 / 935 ms |

Renderer CPU reads ~100 % under CDP throttling in both builds. That is an artifact of the throttler, not work.

## 14. FPS / Frame-Time Analysis

REAL HW, frame intervals from rAF during a scripted wheel scroll through the entire cinematic section. The display runs at 165 Hz, so ~6.1 ms is one refresh.

| Config | Build | Slow scroll p50 / p95 / p99 / max | Frames > 33 ms | Fast scroll p50 / p99 / max |
|---|---|---|---|---|
| iGPU laptop | baseline | 6.1 / 12.0 / 12.2 / 521–552 ms | 2 | 6.1 / 12.1–12.2 / 12.2 ms |
| iGPU laptop | final | 6.1 / 6.2 / 6.2 / 30.3 ms | **0** | 6.1 / 6.2 / 6.2 ms |
| dGPU laptop | baseline | 6.1 / 6.2–6.3 / 12.0–12.3 / 515–521 ms | 2 | 6.1 / 6.3–12.2 / 6.4–12.4 ms |
| dGPU laptop | final | 6.1 / 6.2 / 6.3 / 30.3 ms | **0** | 6.1 / 12.1–12.3 / 12.3–13.2 ms |
| iGPU mobile-sim (SIM) | final | 6.1 / 6.2 / 12.1 / 24.3 ms | 0 | 6.1 / 6.2–6.3 / 6.4–13 ms |

- Average during scroll: **~164 fps** (both GPUs), versus the 60 fps High-tier target.
- **Medium tier ≥ 45 fps:** NOT MEASURED on a real medium-class device. The tier decision itself was verified (§22).
- The single remaining ~30 ms frame is the first frame of the scroll. It did not reproduce as a stall.

## 15. CPU / GPU / Memory Findings

- **CPU/GPU at rest:** see §12. Before Phase 8, a visitor reading the first screen kept one CPU core ~20 % busy and the GPU process 33–56 %, in the tab and offscreen alike. Now both are ~0.
- **Memory (REAL HW):**
  - JS heap ~10–11 MB after scene init and 8.5 MB after scroll + GC, on both builds (8.3 MB Low tier).
  - Across 6 client-side cycles home ↔ `/projects`:
    - exactly one canvas lives on home, and none remains mounted on `/projects`;
    - three.js resources return to 21 geometries / 6 textures / 9 draw calls each time;
    - heap after GC goes 7.2 → 9.9 MB, with shrinking steps (+1.5, +0.5, +0.2, +0.2, +0.1).
  - Control without 3D (`/about` ↔ `/projects`, 6 cycles): 6.6 → 7.9 MB, the same shape. The growth is router/RSC cache behaviour, not a scene leak.
- **GPU memory:** NOT MEASURED — Chrome exposes no per-tab GPU memory API. Texture and geometry counts are used as the proxy.
- **Lifecycle events:** after page freeze → resume the scene still renders WebGL (both GPUs and mobile-sim). `webglcontextlost` falls back to the static composition (Phase 3 code, unchanged).

## 16. Core Web Vitals

Lab values, mean of the two ABBA runs (baseline → final). TTFB is local (production server on the same machine), so it is only a server-render indicator. The INP column is a **lab proxy**: the longest Event Timing duration for scripted clicks and taps. **Field INP/CWV: NOT MEASURED — the site is not deployed.** **Lighthouse: NOT MEASURED — no Lighthouse dependency may be added in this phase.**

**`laptop` (REAL HW)**

| Route | TTFB | FCP | LCP | CLS | TBT | INP~ | Main thread |
|---|---|---|---|---|---|---|---|
| `/` | 22 → 18 | 318 → 282 | 318 → 282 | 0 | 758 → 677 | 24 → 16 | **2,737 → 1,687** |
| `/projects` | 21 → 19 | 114 → 130 | 114 → 130 | 0 | 0 | 28 → 28 | 568 → 574 |
| `/projects/project-hub-application` | 15 → 15 | 86 → 102 | 244 → 102 | 0 | 0 | 28 → 32 | 476 → 435 |
| `/projects/breast-tumor-diagnosis-system` | 28 → 23 | 124 → 108 | 228 → 108 | 0 | 0 | 24 → 20 | 468 → 450 |
| `/about` | 14 → 16 | 210 → 198 | 226 → 206 | 0 | 0 | 20 → 16 | 388 → 359 |
| `/experience` | 14 → 13 | 88 → 116 | 88 → 116 | 0 | 0 | 20 → 20 | 337 → 333 |
| `/certificates` | 14 → 13 | 90 → 100 | 90 → 100 | 0 | 0 | 24 → 20 | 340 → 337 |
| `/cv` | 17 → 15 | 90 → 106 | 90 → 106 | 0 | 0 | 24 → 24 | 368 → 347 |
| `/contact` | 13 → 13 | 92 → 86 | 92 → 86 | 0 | 0 | 24 → 24 | 332 → 334 |

**`mobile-sim` (SIMULATED)**

| Route | TTFB | FCP | LCP | CLS | TBT | INP~ | Main thread |
|---|---|---|---|---|---|---|---|
| `/` | 183 → 183 | 1,280 → 1,234 | 1,280 → 1,234 | 0 | 1,028 → 935 | 140 → 128 | **6,262 → 3,825** |
| `/projects` | 181 → 182 | 1,170 → 1,124 | 1,170 → 1,124 | 0 | 195 → 169 | 112 → 108 | 1,943 → 1,801 |
| `/projects/project-hub-application` | 184 → 182 | 1,142 → 1,096 | 1,142 → 1,096 | 0 | 173 → 178 | 120 → 124 | 1,977 → 1,891 |
| `/projects/breast-tumor-diagnosis-system` | 183 → 177 | 1,142 → 1,108 | 1,146 → 1,114 | 0 | 201 → 169 | 112 → 104 | 1,863 → 1,821 |
| `/about` | 179 → 180 | 1,100 → 1,082 | 1,160 → 1,102 | 0 | 177 → 176 | 104 → 92 | 1,766 → 1,722 |
| `/experience` | 177 → 186 | 1,046 → 1,030 | 1,046 → 1,030 | 0 | 194 → 160 | 100 → 108 | 1,641 → 1,577 |
| `/certificates` | 179 → 181 | 1,030 → 1,078 | 1,030 → 1,078 | 0 | 193 → 173 | 124 → 100 | 1,640 → 1,662 |
| `/cv` | 178 → 181 | 1,180 → 1,134 | 1,180 → 1,134 | 0 | 175 → 185 | 108 → 108 | 1,857 → 1,833 |
| `/contact` | 180 → 185 | 1,060 → 1,088 | 1,060 → 1,088 | 0 | 184 → 169 | 96 → 104 | 1,626 → 1,630 |

- `laptop-cpu4x` (SIMULATED): all routes LCP 194–278 ms, CLS 0, INP~ 64–116 ms. Home main thread 6,978 → 3,438 ms.
- **`mobile-slow3g` (SIMULATED, final build, 2 runs):** LCP `/` 2.38–2.49 s; content routes 2.30–2.99 s (the worst is the breast-tumor project image at 2.99 s); TTFB ~0.44 s; CLS 0; INP~ ≤ 136 ms.
- Non-home deltas are within run-to-run noise (± ~30 ms). The optimizations only touch the home page's scene and the header.

## 17. LCP Analysis

| Route | LCP element | Laptop | Mobile-sim |
|---|---|---|---|
| `/` | the H1 display line (`span.font-display`), HTML — never the canvas | 0.28 s | 1.23 s |
| `/projects` | intro paragraph | — | 1.12 s |
| Project detail, project-hub-application | H1 | — | 1.10 s |
| Project detail, breast-tumor-diagnosis-system | cover image (`img.object-cover`, prioritized) | — | 1.11 s |
| `/about` | the portrait image (`img.cine-portrait-img`) | — | 1.10 s |
| Other routes | text (H1, lead or link) | — | — |

LCP was already within budget and text-dominated, so no LCP change was made. Every LCP is below 2.5 s, except that under simulated slow 3G the image-LCP project page reaches 2.99 s. That is a network-bound cover image and a known limit of that profile, recorded under R-06.

## 18. CLS Analysis

CLS is **0.000 on every route, every profile and every run** (REAL HW and SIMULATED), including the font swap and the canvas fade-in. Sources were checked with `layout-shift` entries: none were recorded. Both new layers (the header `::before` and the canvas shown only after the first real frame) are out of flow or opacity-only.

## 19. Scroll Performance

See §14.

- The two causes of scroll jank were lazy program compiles, and header repaints layered on the continuous render loop. Both are removed.
- Scroll input remains native: no scroll hijacking, and one passive listener.
- The scene now renders **only while the damped progress is moving**. The frame that settles lands exactly on the target, so the resting image is identical to the one continuous rendering converges to (§26).
- **Menu interaction** (SIMULATED 4× CPU): opening the mobile menu takes 136–160 ms. It is dominated by the native `showModal()` style recalculation (538–641 elements). A direct `aria-expanded` optimization was tried with no measurable benefit and reverted (§28). It is within the 200 ms INP budget.

## 20. Resource Lifecycle

- **Offscreen pause:** the IntersectionObserver sets `frameloop="never"` offscreen (Phase 3). Offscreen cost is now 0 % (§12).
- **Unmount:** the environment, room and PMREM generator are disposed, and the progress `onChange` hook is cleared. After 6 navigation cycles, WebGL resources return to the same counts (§15).
- **Freeze/resume:** verified.
- **Resize:** the canvas re-renders on resize. p99 is 6.8–18.4 ms with a 18–24 ms max, except one 182 ms iGPU outlier that did not reproduce in 3 further probes.
- **`window.__cinematic` stats** are now published after the frame's render (same tick), so `renderer.info` describes the current frame. They are read by E2E and QA.

## 21. Reduced Motion

Verified on the final code (`reducedMotion: 'reduce'`): the tier is **static**, no canvas is created, the **scene chunk is not downloaded**, and the static composition with the portrait is shown with no page errors. The CSS motion tokens collapse to 0.01 ms.

Build-vs-build captures in reduced motion across 10 routes × 3 views: every top-of-page capture is pixel-identical (§26).

## 22. Save-Data / Low-End Behavior

Final code, tier decision and scene download observed per case (REAL HW browser, capabilities overridden per case):

| Case | Tier | Canvas | Scene chunk |
|---|---|---|---|
| Default laptop | high | yes | 943 KB raw |
| `navigator.connection.saveData = true` | **static** | no | **not downloaded** |
| `deviceMemory = 2` | **static** | no | **not downloaded** |
| No WebGL2 | **static** | no | **not downloaded** |
| 4 cores / 4 GB | medium | yes | downloaded |
| Phone emulation (390 px, touch) | low | yes | downloaded |

No case produced page errors. Phones render the Low tier. That was a Phase 3 decision (R-43), and it differs from ADR-015's initial "Low tier 0 KB of three" target. It was not changed in this phase: it is a product decision, and at rest the Low tier now costs ~0.

## 23. Routing / Prefetch

- Header links use the default App Router prefetch. The language switcher already has `prefetch={false}`.
- **R-54 (failing cross-locale prefetches): not reproducible in Phase 8.** Arabic is unpublished, so no locale-crossing navigation exists in production, and the Arabic gate was not weakened to test it. It will be re-tested when Arabic is published.
- Client-side navigation home ↔ `/projects` was verified for lifecycle (§15).

## 24. Accessibility Regression

axe-core (WCAG 2.0/2.1/2.2 A + AA) on the final production build, run on 10 routes in 3 modes (1440 dark, 1440 light, 390 mobile dark): **30 checks, 0 violations, 0 horizontal overflow**. The header change keeps its contrast: the tint layer is identical in the solid end state. Reduced motion: §21.

## 25. SEO Regression

`pnpm seo:audit` (production mode, final build): **22 pages checked, 0 errors**. This covers canonicals, hreflang (EN + x-default only while Arabic is gated), robots, sitemap, JSON-LD and share images. No SEO code or metadata changed in this phase.

## 26. Visual Regression

1. **Build vs build**, 60 captures: 10 routes × 1440 dark, 1440 light and 390 dark, each at the top and after scrolling; reduced motion; production.
   - **30 captures are bit-identical**, including every top-of-page capture.
   - The rest differ only in the header strip after scrolling: worst mean absolute difference 0.034/255, with 0 pixels over 40.
2. **Cinematic regression against the approved Phase 3 frames**: 19 frames × 2 runs (A/B), preview build.
   - **First run: a real regression.** Two acts were off by up to 2.2 (ignition 0.91, systems 2.15, versus ≤ 0.39 before Phase 8). Cause: demand rendering stopped when the damped progress was within 1e-4 of the target. That left the camera slightly short (p = 0.18495 instead of 0.18505).
   - **Fix:** the settling frame snaps to the target.
   - **Rerun:** all act frames ≤ **0.43**, with 0.00–0.01 % of pixels over 40. That matches the pre-Phase-8 runs (migration: ≤ 0.39).
   - Transition frames 08/14/17 are 0.87–1.95. That equals the migration run (0.95/1.89/0.77) plus a 1 px sub-pixel line offset: content, not scene.
   - Frame 15 (light theme, arrival) is 0.36, confined to the header during its first 6rem of scroll. The intermediate look is a crossfade of the full blur instead of a growing blur radius, and the end states are identical. This is **the one intentional visible difference**: a transient half-state of the header, disclosed in ADR-015 (Phase 8 amendments).
   - A↔B run-to-run: ≤ 0.08. No console errors.
3. **Scene after client-side navigation** versus a fresh load: 0.023 mean difference (encoder noise), identical after scrolling.

## 27. Optimizations Applied

### 27.1 Demand rendering of the cinematic scene

- **Problem:** `frameloop="always"` rendered ~165 identical frames/s while the user was reading, and kept the renderer and GPU process busy.
- **Evidence:** §12 idle rows; the CPU profile shows `WebGLRenderer.render` dominating idle.
- **Change:**
  - `frameloop` is `demand` (`CinematicCanvas.tsx`).
  - `progress.onChange` → `invalidate` whenever the scroll progress changes (`progress.ts`).
  - The Director re-requests frames while the damping settles and sleeps when settled. It snaps to the target on the settling frame, damps with the typical frame interval after a sleep, and counts only consecutive frames for adaptive DPR (`Director.tsx`).
  - The portrait texture requests a frame when it arrives (`Portrait.tsx`).
- **Before → after (REAL HW, ABBA):**

  | Measure | Before | After |
  |---|---|---|
  | Idle frames/s | 161–165 | **0** |
  | Idle main thread | 17–22 % | **0** |
  | Idle renderer CPU | 31–39 % | **0.1 %** |
  | Idle GPU-process CPU | 33–48 % | **0.1 %** |
  | Offscreen | 13–56 % | **0** |
  | Home main-thread time per load window (laptop) | 2,737 ms | 1,687 ms (**−38 %**) |
  | Home main-thread time (cpu4x) | 6,978 ms | 3,438 ms (**−51 %**) |
  | Home main-thread time (mobile-sim) | 6,262 ms | 3,825 ms (**−39 %**) |

- **Regression check:**
  - cinematic regression ≤ 0.43 on acts (after the snap fix, §26);
  - E2E cinematic spec (reads `__cinematic.p` and `drawCalls`);
  - new unit test: frames are requested only when progress changes;
  - navigation lifecycle (§15).

### 27.2 Parallel compile of every scene program before the first frame

- **Problem:** hidden parts compiled their shaders on first visibility, mid-scroll.
- **Evidence:** 2 frames of 515–552 ms in the first slow scroll on both GPUs; CPU profile in `getProgramParameter`.
- **Change:**
  - After the environment build, the Director calls `await gl.compileAsync(scene, camera)` (`KHR_parallel_shader_compile`).
  - `frameloop` stays `never` until it resolves (`onWarm`).
  - The canvas is shown after the first real frame (`onFirstFrame`).
  - On error, it falls back to the synchronous path (same image).
- **Before → after:** slow-scroll max frame 515–552 → **30.3 ms**; p99 12.0–12.3 → 6.2–6.3 ms; frames over 33 ms 2 → **0** (iGPU and dGPU). Mobile-sim max frame 176–279 → 24 ms. Init TBT 747–800 → 689–701 ms (iGPU).
- **Cost:** on the dGPU the canvas appears ~150 ms later (1,608 → 1,755 ms). The static composition is visible and interactive meanwhile, and LCP is unaffected.
- **Regression check:** visual regression; E2E; the canvas fade is unchanged.

### 27.3 Header solidify animation: opacity layer instead of an animated filter

- **Problem:** the scroll-driven header animation animated the backdrop filter, background and border. Chrome then repainted every frame even after the 6rem range ended.
- **Evidence:** ~330 paints/s at rest, ~25 % renderer and ~30 % GPU-process CPU with the scene excluded.
- **Change (`globals.css`, inside `@supports (animation-timeline: scroll())`):**
  - The blur and tint moved to `.site-header::before`, whose **opacity** is scroll-animated (compositor-only).
  - The border colour is animated on the header.
  - The fallback for browsers without scroll timelines is unchanged.
- **Before → after:** paints at rest ~330/s → **0**. CSS +23 B gzip.
- **Regression check:** end states pixel-identical (§26 build-vs-build); transient difference disclosed (frame 15); a11y contrast unchanged.

### 27.4 `window.__cinematic` published after render (QA correctness)

- **Problem:** stats were read before the frame rendered, so after client-side navigation they described the environment prefilter pass (1 draw call).
- **Evidence:** lifecycle probe.
- **Change:** `queueMicrotask(publishStats)`.
- **Before → after:** after navigation 1 → 9 draw calls, 13 → 21 geometries (correct).
- **Regression check:** E2E ×2.

## 28. Optimizations Rejected

| Candidate | Result | Decision |
|---|---|---|
| Parallel warm-up of the PMREM environment program (private three API) | Looked like a ~0.5 s win in an isolated test, but only with a warm GPU program cache. Cold, there was no benefit: ANGLE finalises the program at draw time. | **Rejected**: no cold evidence; private API. |
| Direct `aria-expanded` update in the mobile menu (skip a React render) | Menu tap 136–160 ms either way; the cost is native `showModal()` style recalculation. | **Reverted** (file identical to HEAD). |
| AVIF derivatives | Not evaluated. No image-bound LCP problem was found except under simulated slow 3G. | **Deferred** (NOT MEASURED). |
| Arabic font preload (R-31) | No publishable Arabic page to measure. | **Deferred** until Arabic is published. |
| Smaller PMREM prefilter / precomputed environment | Would remove the ~0.7 s cold compile but changes the metal reflections. | **Not applied**: visible change and a frozen design. Recorded as R-59 options. |
| Merging or removing client islands | No island showed a measurable cost. | **Not applied.** |
| Switching Low → static tier on phones | A product decision (R-43), not a performance fix. No real-device data. | **Not applied.** |

## 29. Remaining Risks

- **R-06** (3D vs CWV/mobile): updated with the Phase 8 measurements. OPEN — measured on a real laptop.
- **R-31:** deferred until Arabic is published.
- **R-41:** 167,430 B; ~2.5 KB headroom.
- **R-43:** physical phones NOT MEASURED.
- **R-54:** blocked by the Arabic gate.

New:
- **R-59:** cold-visit PMREM compile, ~0.7 s long task (~1.4 s at 4× CPU), after the page is painted. LOW.
- **R-60:** a production build made after `pnpm test:e2e` in the same working copy can prerender content routes as 404 (poisoned `.next/cache/fetch-cache`). HIGH until fixed. Clean CI/Docker builds are not affected.
- **R-61:** Tailwind v4 automatic source detection scans `docs/`, so prose in documentation can add unused utilities to the public CSS. Observed in this phase: one doc sentence added an unused filter utility (+1.4 KB raw), and it was reworded. LOW. Fix later with an explicit `@source not` for `docs/`.

## 30. Deferred Work

- Physical-device measurement: mid/low-end Android and an iPhone (R-43), plus a desktop PC and a low-power laptop.
- Field data (RUM/CrUX) and Lighthouse CI once deployed (Phase 9 / deployment).
- R-60: give the E2E build its own output (`distDir` or a cache reset in `tests/e2e/prepare-e2e.mjs`).
- R-61: exclude `docs/` from Tailwind sources.
- R-59: decide on the environment approach, with art review.
- R-31 and R-54 once Arabic is approved.
- AVIF evaluation.

## 31. Final Verification Matrix

All checks were run on the final code.

| Check | Result |
|---|---|
| `pnpm typecheck` | ✅ 0 errors |
| `pnpm lint` | ✅ 0 problems |
| `pnpm format:check` | ✅ all files formatted |
| `pnpm test` (unit) | ✅ **87 / 87** (86 + 1 new demand-render test) |
| `pnpm test:cms` | ✅ **49 / 49** |
| `pnpm build` (production) | ✅ every public route HTTP 200 |
| `pnpm test:e2e` run 1 / run 2 | ✅ **164 passed, 33 skipped, 0 failed** — twice |
| `pnpm cms:verify-legacy` | ✅ 0 errors, 0 unreachable, 0 published fixtures |
| `pnpm seo:audit` (production) | ✅ 22 pages, 0 errors |
| a11y (axe, 30 checks) | ✅ 0 violations, 0 overflow |
| Cinematic regression (2 runs) | ✅ acts ≤ 0.43; transitions = migration run; one disclosed transient header difference |
| Build-vs-build captures (60) | ✅ 30 identical, the rest ≤ 0.034 |
| Critical JS ≤ 170 KB | ✅ `/` 167,430 B |
| Admin/CMS code in public chunks | ✅ none |
| `portrait.jpg` SHA-256 | ✅ `1c00fa07…323fca` unchanged |
| `.env` | ✅ untouched (mtime 2026-09-27, before Phase 8); never read into output |
| Arabic gate | ✅ `/ar` 404; hreflang EN + x-default only; no Arabic content approved or published |
| Public CSS | ✅ baseline + 225 B raw / + 23 B gzip (the header change only) |

After the last two E2E runs, only wording changed: one CSS comment and two report phrases, so that Tailwind generates no unused utilities (R-61). Production build, route status, critical JS, bundle, SEO and a11y were all re-run on that final build.

## 32. Git State

- Branch `main`, HEAD `af32158` (unchanged). **No commit, push, deploy, reset, rebase or branch operation was performed.**
- Tracked-file status set: identical to the start of the phase (38 M, 3 D). Phase 8 edits fall on files that were already modified or untracked.
- Untracked entries: 67, versus 65 at the start.
  - `docs/reports/PHASE_8_REPORT.md` is this report.
  - `photos/` holds image files dated 2026-09-28 17:14–17:15 that **were not created by this phase** (not produced by any script I ran). It was left untouched.

Files changed by Phase 8:
- `src/app/globals.css`: header opacity layer.
- `src/scene/CinematicCanvas.tsx`: demand frame loop, warm gate, marks.
- `src/scene/parts/Director.tsx`: demand rendering, parallel compile, snap, post-render stats.
- `src/scene/parts/Portrait.tsx`: invalidate on texture.
- `src/scene/progress.ts`: `onChange` hook, update only on change.
- `tests/unit/cinematic.test.ts`: +1 test.
- `docs/architecture/ARCHITECTURE_DECISIONS.md`: Phase 8 amendments.
- `docs/architecture/RISK_REGISTER.md`: R-06/31/41/43/54 updated; R-59/60/61 added.
- `docs/reports/PHASE_8_REPORT.md`: this report.

`src/components/shell/MobileMenu.tsx` was changed and then reverted to be identical to HEAD.

Not touched: `.env`, credentials, other Docker containers or databases (only `yazan-portfolio-postgres` and its `_e2e` test database were used), other projects, and the running dev server.

## 33. Final Verdict

**Achieved, with evidence:**
- The three measured bottlenecks of the cinematic home page were removed: an idle GPU/CPU burn of 0.3–0.5 of a core, 0.5 s shader stalls mid-scroll, and a continuous header repaint.
- The approved visuals are preserved (one disclosed transient header difference).
- Critical JS is unchanged at 167,430 B, and no CMS code leaks into public bundles.
- CLS is 0, LCP is text-first and within budget, and the lab INP proxy is ≤ 136 ms.
- Fallback tiers were verified (reduced motion, Save-Data, low memory, no WebGL2).
- Resource lifecycle was verified.
- There is no functional, SEO or accessibility regression.

**Not achieved:**
- Physical phones, a desktop PC and a lower-power laptop were **not measured**: no device was available. Mobile results are simulations.
- Lighthouse and field Core Web Vitals were **not measured**.
- The ~0.7 s cold-visit PMREM long task remains (R-59).

Because real-device mobile measurement is a major Phase 8 requirement that was not performed, the phase cannot be called complete.

PHASE 8 PARTIALLY COMPLETE
