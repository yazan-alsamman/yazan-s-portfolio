# Performance & Accessibility

## Performance Philosophy

The site may be visually complex, but the user must never pay for unnecessary complexity.

## Budgets

Initial targets:

- no avoidable layout shift
- fast first meaningful content
- optimized hero loading
- responsive images
- 3D assets loaded progressively
- no large unnecessary JavaScript bundles
- no persistent high CPU/GPU workload when the scene is not visible

The agent must establish measured budgets in Phase 0/8 based on the actual implementation.

## 3D Optimization

Consider:
- instancing,
- LOD,
- compressed textures,
- Draco/Meshopt where appropriate,
- frustum culling,
- reduced shadow resolution,
- capped pixel ratio,
- object disposal,
- progressive asset loading.

Do not optimize blindly. Measure first.

## Accessibility

Minimum:
- keyboard navigation,
- visible focus states,
- semantic headings,
- accessible names,
- sufficient contrast,
- alt text,
- reduced motion,
- screen-reader-compatible navigation,
- no information available only through animation.

## Reduced Motion

Respect:

`prefers-reduced-motion: reduce`

In reduced-motion mode:
- disable or greatly simplify camera movement,
- reduce particle movement,
- remove nonessential transitions,
- preserve all content and navigation.

## Mobile

The site must be designed for:
- narrow phones,
- touch interaction,
- mobile browsers,
- lower-memory devices.

A mobile device must not be forced to render the desktop scene at full complexity.
