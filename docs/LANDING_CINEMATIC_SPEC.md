# Flagship Landing Page — Cinematic 3D Specification

## Objective

Create a world-class landing experience that communicates **AI + software engineering + robotics + computational technology** through a coherent cinematic 3D sequence.

This is the highest-priority visual feature of the project.

## Core Concept

Working concept:

### "FROM HUMAN INTENT TO MACHINE INTELLIGENCE"

The experience begins with the human engineer and gradually transitions into a computational world.

The supplied portrait of Yazan is the human anchor.

The environment can evolve through a sequence such as:

1. **Arrival**
   - near-black environment
   - subtle atmospheric particles
   - portrait or silhouette introduced
   - minimal identity typography

2. **Ignition**
   - geometric structures begin assembling
   - light travels through computational paths
   - interface elements remain subtle

3. **Intelligence**
   - neural/graph-like structures form
   - procedural data flows
   - AI visual metaphor appears

4. **Engineering**
   - robotic/mechanical components assemble
   - microchip / circuit / actuator motifs
   - camera passes through engineered structures

5. **Systems**
   - multiple layers connect
   - software + AI + robotics become one system
   - project categories can appear as narrative markers

6. **Identity**
   - Yazan's name and specialization become the visual focal point
   - strong CTA to explore work

7. **Transition to Portfolio**
   - the cinematic world collapses/flows into the normal site content.

The exact storyboard may change after visual prototyping.

## 3D Object Direction

Candidate object families:

### Robotics
- robotic arm segment
- servo / actuator
- mechanical joint
- sensor module
- autonomous rover component

### Computing
- custom chip
- circuit board fragments
- processor-like geometry
- memory/data modules
- fiber/data channels

### AI
- neural graph
- procedural node network
- abstract latent-space geometry
- dynamic point clouds
- volumetric data field

### Software
Represent software conceptually, not as giant floating code.

Examples:
- graph structures
- system diagrams
- API/data-flow particles
- geometric state machines

### Environment
- dark studio/lab atmosphere
- volumetric haze
- controlled lighting
- subtle depth of field
- physically coherent shadows/reflections

## Portrait Integration

The supplied portrait must not feel pasted over the scene.

Preferred approaches:
- depth-aware image plane with controlled parallax,
- masked portrait with cinematic light,
- 2.5D layered portrait,
- carefully controlled 3D treatment if technically justified.

Do not convert the portrait into a fake 3D face without explicit approval.

## Camera

The camera should feel cinematic rather than like a standard 3D demo.

Potential characteristics:
- long controlled movements,
- depth transitions,
- macro-to-wide scale changes,
- orbital movement,
- controlled focal length,
- occasional reveal through geometry.

## Scroll Architecture

Scroll controls a normalized narrative timeline.

Requirements:
- deterministic mapping from scroll progress to scene progress,
- smoothing/damping,
- no velocity-dependent chaos,
- support touch scrolling,
- support keyboard/page navigation,
- support reduced motion.

## Performance

The scene must degrade gracefully.

Define tiers:

### High
Desktop with strong GPU:
- full geometry
- shadows
- post-processing
- higher particle count

### Medium
Typical laptop/tablet:
- reduced particles
- reduced shadow resolution
- limited post-processing

### Low
Mobile:
- simplified geometry
- reduced particles
- fewer dynamic lights
- potentially 2.5D fallback

### Reduced Motion
- static/slow visual composition
- no mandatory camera travel
- all information still accessible

## Technical Guidance

Preferred stack can be evaluated by the agent, but likely candidates include:

- React / Next.js
- Three.js
- React Three Fiber
- Drei
- GSAP or a lightweight motion system
- WebGL

Do not add a library merely because it is popular. Every dependency must have a documented purpose.

## Critical Quality Rule

The 3D scene is not successful if it is merely technically impressive.

It must:
- communicate identity,
- establish narrative,
- support typography,
- preserve usability,
- remain performant,
- transition naturally into the portfolio.

## Acceptance Criteria

- cinematic at first load,
- stable scroll-driven behavior,
- portrait integrated professionally,
- no visible layout instability,
- mobile fallback exists,
- reduced-motion mode exists,
- no console errors,
- no obvious GPU/resource leaks,
- no blocking of primary navigation.
