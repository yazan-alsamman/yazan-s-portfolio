# Phase 3 Visual Review

**Date:** 2026-09-28 · **Purpose:** remote owner review of the actual Phase 3 cinematic result.
**Scope:** capture and document only. The site, the scene and the architecture were **not modified** for this review. Issues are recorded, not fixed.

**Status:** APPROVED BY OWNER — READY TO PROCEED (2026-09-28; the review below was the basis of the approval)

---

## A. Environment

| Item | Value |
|---|---|
| Build | Existing production build (`pnpm build`, BUILD_ID newer than every source change), served with `next start` on `localhost:3217` |
| Routes verified | `/` → 200, `/ar` → 200 |
| Browser | Google Chrome 153 (Playwright-driven, headless) |
| GPU / WebGL | WebGL2 available, hardware GPU: ANGLE, AMD Radeon Graphics (Direct3D 11); 16 logical cores, 16 GB |
| Quality tier | **high** on desktop/laptop viewports, **low** on the 390 px mobile viewport (touch + narrow), **static** for the reduced-motion capture |
| Scrolling | Real input: the desktop captures used mouse-wheel steps of ≤ 120 px. Mobile touch emulation has no wheel, so it used ≤ 120 px `scrollBy` steps. Each act was captured at its centre after the camera damping settled (≥ 2.6 s). |
| Device pixel ratio | Desktop 1x. Mobile 2x (canvas renders at DPR 1.5 in the Low tier). Portrait close-up 2x. |
| Theme | Dark unless marked "light" |
| Data | Local CMS (PostgreSQL container `yazan-portfolio-postgres`). The site environment is not `production`, so a yellow **development-only** "pending sections" panel appears after the Transition act. It is not rendered in production. |

Where the files are (outside the repository, session scratchpad):

- `…/scratchpad/visual-review/PHASE_3_VISUAL_REVIEW.html`: a single self-contained page for phone viewing, with all images embedded.
- `…/scratchpad/visual-review/shots/*.jpg`: 20 screenshots.
- `…/scratchpad/visual-review/video/desktop-1440-full-scroll.webm` and `mobile-390-full-scroll.webm`: continuous scroll through the whole sequence.

## B. Screenshot Index

| # | File | Viewport | Act | Progress | Mode / tier |
|---|---|---|---|---|---|
| 01 | `01-desktop-1440-arrival.jpg` | 1440×900 | Arrival | 0.05 | WebGL · high |
| 02 | `02-desktop-1440-ignition.jpg` | 1440×900 | Ignition | 0.185 | WebGL · high |
| 03 | `03-desktop-1440-intelligence.jpg` | 1440×900 | Intelligence | 0.31 | WebGL · high |
| 04 | `04-desktop-1440-engineering.jpg` | 1440×900 | Engineering | 0.46 | WebGL · high |
| 05 | `05-desktop-1440-systems.jpg` | 1440×900 | Systems | 0.589 | WebGL · high |
| 06 | `06-desktop-1440-human.jpg` | 1440×900 | Human Intent | 0.72 | WebGL · high |
| 07 | `07-desktop-1440-identity.jpg` | 1440×900 | Identity | 0.857 | WebGL · high |
| 08 | `08-desktop-1440-transition.jpg` | 1440×900 | Transition | 0.965 | WebGL · high |
| 09 | `09-mobile-390-arrival.jpg` | 390×844 @2x | Arrival | 0.05 | WebGL · low |
| 10 | `10-mobile-390-intelligence.jpg` | 390×844 @2x | Intelligence | 0.31 | WebGL · low |
| 11 | `11-mobile-390-engineering.jpg` | 390×844 @2x | Engineering | 0.46 | WebGL · low |
| 12 | `12-mobile-390-human.jpg` | 390×844 @2x | Human Intent | 0.72 | WebGL · low |
| 13 | `13-mobile-390-identity.jpg` | 390×844 @2x | Identity | 0.857 | WebGL · low |
| 14 | `14-mobile-390-transition.jpg` | 390×844 @2x | Transition | 0.965 | WebGL · low |
| 15 | `15-laptop-1280-light-arrival.jpg` | 1280×800, light | Arrival | 0.05 | WebGL · high |
| 16 | `16-laptop-1280-light-human.jpg` | 1280×800, light | Human Intent | 0.72 | WebGL · high |
| 17 | `17-laptop-1280-light-transition.jpg` | 1280×800, light | Transition | 0.965 | WebGL · high |
| 18 | `18-desktop-1440-ar-human.jpg` | 1440×900, `/ar` | Human Intent (RTL) | 0.72 | WebGL · high |
| 19 | `19-portrait-closeup-2x-human.jpg` | 1440×900 @2x, cropped | Human Intent | 0.72 | WebGL · high |
| 20 | `20-static-fallback-1440-human.jpg` | 1440×900, reduced motion | Human Intent | 0.72 | Static (no WebGL) |

**Checks on every capture:**

- Horizontal overflow was **0 px**.
- The scene's recorded progress matched the target.
- The only console message was the known upstream `THREE.Clock` deprecation warning (R-42). There were no errors.

## C. Act-by-Act Review

### 01 · Arrival (shots 01, 09, 15)

- **Intended:** the visitor enters a dark, architectural computational environment. Minimal and precise.
- **Actual:**
  - The H1 sits low over a measured floor grid with a thin cyan→violet horizon and sparse points.
  - "Scroll to enter" and "Skip the intro" are visible.
  - Typography is strong.
- **Issues:**
  - The upper ~55 % of the frame is almost empty. That is intentional restraint, but it may read as a weak or sparse first impression rather than "entering a system".
- **Owner decision:** is the quiet opening right, or should the environment carry more presence (e.g. a visible distant structure)?

### 02 · Ignition (shot 02)

- **Intended:** computation activates; scroll-driven light propagation.
- **Actual:** circuit paths are traced across the floor from the origin, and the caption is centred.
- **Issues:**
  - The circuit lines pass behind the caption (still readable).
  - The flat cyan wireframe floor is the most "generic tech" moment of the sequence, and cyan dominates.
- **Owner decision:** accept, or make the circuitry more restrained/structural.

### 03 · Intelligence (shots 03, 10)

- **Intended:** an abstract, elegant machine-intelligence topology (no brain, no head).
- **Actual:** a layered graph assembles on the side opposite the copy.
- **Issues:**
  - At the act centre the nodes read as **uniform white dots**. Edges only appear later in the act, so the frame can look like a generic constellation or particle field.
  - One node sits near the word "data." (desktop).
  - On mobile the graph is sparse and partly behind the caption, and the circuits dominate the lower half.
- **Owner decision:** approve refining the graph's visual identity (node hierarchy, earlier edges, less uniform dots).

### 04 · Engineering (shots 04, 11)

- **Intended:** a sophisticated, machined robotic actuator responding to scroll.
- **Actual:** a five-axis arm with anodized/brushed/carbon materials, cyan joint rings, assembled and articulating.
- **Issues:**
  - **Framing:** on desktop the arm is **cropped at the top** and passes under the header.
  - **Styling:** the joints are plain cylinders with **flat dark end caps** and the base is a stepped cone. It reads closer to a clean prototype than a precision-machined product.
  - **Mobile collision:** the caption sits directly over the upper arm and elbow joint.
- **Owner decision:** keep the current simplified look, or invest in more detailed machined parts (fasteners, chamfers, cable routing, end-cap detail) plus a framing fix.

### 05 · Systems (shot 05)

- **Intended:** software, data, intelligence and machine connected into one architecture.
- **Actual:** graph, connection curves and actuator are shown together, with a violet activation wave.
- **Issues:**
  - **Text collision:** the graph nodes and the dense violet edge bundle sit behind the caption, which reduces legibility.
  - The lower half is busy with cyan circuits.
  - Violet is at its most saturated here (at the edge of "controlled signal").
- **Owner decision:** approve fixing the collision and reducing saturation and density.

### 06 · Human Intent (shots 06, 12, 16, 18, 19, 20)

- **Intended:** the portrait as the human origin of the system.
- **Actual:**
  - The portrait is revealed on the left and graded (duotone + 18 % natural colour).
  - Connection curves arrive from the systems.
  - The caption is on the right.
- **Issues:** see §E. In short: the oval vignette "cameo", a visible straight top edge, softness at 2x, and on mobile the last caption line touches the top of the head.
- **Owner decision:** choose the reference portrait look (§E).

### 07 · Identity (shots 07, 13)

- **Intended:** the system simplifies and the identity is the culmination.
- **Actual:** points collapse into one horizon, and the name and title form a large typographic composition.
- **Issues:**
  - The frame is visually very close to Arrival. It is a strong frame, but it feels like a **repeat rather than a culmination**.
  - The lower half is empty.
- **Owner decision:** accept, or make the identity moment distinct (e.g. the portrait and name together, or a final assembled state).

### 08 · Transition (shots 08, 14, 17)

- **Intended:** a visual bridge. "This is the person behind the systems."
- **Actual:** the canvas fades out and "08 — The work / The person behind the systems." hands over to the page.
- **Issues:**
  - A long empty dark band.
  - A **faint dotted remnant** of the collapsed horizon stays near the top. On mobile it crosses just above the "08 — THE WORK" label.
  - In production the development panel is absent, so the sequence ends on empty space before the footer (no real portfolio sections exist yet).
  - In light mode the dark→light gradient passes through a muddy mid-grey.
- **Owner decision:** approve a stronger ending/bridge. Its final shape depends on the Phase 4+ portfolio sections.

## D. Mobile Review (390 × 844, Low tier)

| Check | Result |
|---|---|
| Clipping | None of the page content. The actuator is fully in frame on mobile. |
| Horizontal overflow | 0 px at every captured position |
| Typography | Readable. Display size scales well, and the H1 wraps to two lines cleanly. |
| Portrait sharpness | Acceptable at normal viewing but visibly soft on a 2x screen. The Low tier renders the canvas at DPR 1.5, and the source is 538 × 661. |
| Actuator framing | Centred and complete, but **the caption overlaps the arm** (shot 11) |
| Neural graph vs copy | Sparse. Some nodes sit behind the caption (shot 10); no hard collision. |
| Captions | Readable thanks to the text shadow. Collisions with the actuator (11) and the portrait (12). |
| Transition to portfolio | Works, but the horizon-remnant line sits just above the "08" label (14). The empty area before the next section is long. |

**Overall:** the mobile composition is deliberate (its own camera path, centred subjects), but on two acts the captions and subjects compete for the same vertical space. That is the main mobile problem.

## E. Portrait Review

- **Source integrity:** the original `portrait.jpg` is **unchanged**: SHA-256 `1c00fa075b97e2ef8a3460b3d62155052533729994041bd7f562ed5177323fca`, not modified in git. No upscaling, AI processing or replacement.
- **WebGL treatment** (shots 06, 12, 16, 18, 19):
  - **Cinematic:** partly. The scan reveal and connection curves make it an event in the story. The oval vignette, however, reads as a lit "cameo" or spotlight rather than a figure emerging from the environment.
  - **Authentic:** yes. The face is recognisable, and the grade keeps natural skin tone at 18 %.
  - **Integrated:** moderately. The edges dissolve well on the sides and bottom, but a **straight top edge of the image is visible**. The bright wall behind the subject makes the oval a light shape against the dark scene, so the person is dark on light instead of emerging from the dark.
  - **Premium:** not yet at the level of the typography. At real 2x density (shot 19) the source's **softness and JPEG texture are visible**. The treatment holds up at 1x desktop size.
- **Static fallback** (shot 20):
  - The original-colour image appears as a rounded card.
  - It is warm and authentic, but visually inconsistent with the WebGL look. It is the closest the site comes to "an image pasted on a page", which the brief warned against.
- **Owner decision:**
  1. Is the duotone/vignette direction right?
  2. Which of the two looks is the reference?
  3. Is a less "oval" and more atmospheric mask acceptable (still no reconstruction, upscaling or generated background)?

## F. Performance Observations

These are only what was observed during capture on this one machine; **they are not benchmarks** of any visitor device.

- Scene statistics recorded at each capture (`window.__cinematic`):
  - High tier: 9–23 draw calls, 4,646–8,344 triangles, 5,200 points.
  - Low tier: 8–20 draw calls, 2,564–5,882 triangles, 1,400 points.
- Canvas DPR stayed at 1 on desktop captures and 1.5 on mobile. Adaptive downgrading was not triggered.
- The scroll videos show continuous camera motion with no visible stutter on this hardware GPU. Recorded video frame rates are not a measure of rendering performance.
- No page errors. One console warning per WebGL page view (the upstream `THREE.Clock` deprecation, R-42).
- Transfer sizes are unchanged from `PHASE_3_REPORT.md` §8 (no code changed): critical-path JS 167,243 B; lazy 3D chunk 250,527 B.
- **Not tested:** physical phones, low-end GPUs, Safari/iOS, Firefox.

## G. Recommendation

The implementation works end to end in every captured mode:

- WebGL high and low tiers;
- the static fallback;
- EN and AR;
- dark and light themes;
- desktop, laptop and mobile.

The visual review, however, finds design-quality issues that automated tests cannot judge. **Readiness for Phase 4 is therefore not declared on the strength of the tests.**

Issues that need an owner decision before further design work:

1. **Caption–scene collisions:** Systems (desktop); Engineering and Human Intent (mobile).
2. **Actuator styling:** simplified/prototype-like; top crop on desktop.
3. **Neural graph identity:** uniform white dots at the act centre.
4. **Portrait treatment:** oval cameo, straight top edge, the fallback card's inconsistency, 2x softness.
5. **Ending:** Identity repeats Arrival; the Transition ends on empty space; horizon remnant line.
6. **Light theme seam:** grey header over the dark stage; muddy dark→light gradient.
7. **First impression:** a very quiet Arrival.

No fixes were applied. The owner's direction is required first.

**AWAITING OWNER VISUAL APPROVAL**

---

## Owner Decision (2026-09-28)

The owner formally approved the Phase 3 visual design on the basis of this review. The documented observations are accepted as part of the approved baseline, and the design decisions listed in §C–§E are resolved as "keep as approved".

**Final status:** APPROVED BY OWNER — READY TO PROCEED
