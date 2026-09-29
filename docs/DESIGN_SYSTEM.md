# Design System

## Layout

Use a responsive 12-column desktop grid where appropriate.

Desktop:
- generous outer margins,
- large typographic scale,
- controlled content width.

Tablet:
- 8-column conceptual grid.

Mobile:
- 4-column conceptual grid,
- no horizontal overflow,
- touch targets >= 44px.

## Spacing

Use a consistent spacing scale, preferably based on 4px or 8px increments.

Do not create arbitrary one-off spacing values unless necessary.

## Radius

Prefer restrained geometry:

- Small: 8px
- Medium: 14px
- Large: 24px
- Display surfaces: 32px

Avoid excessive rounded cards.

## Surfaces

Use:
- solid surfaces,
- subtle borders,
- controlled translucency,
- depth through lighting and shadow.

Do not make every element glassmorphic.

## Buttons

Primary:
- high contrast,
- clear action,
- subtle motion.

Secondary:
- outline or quiet surface.

Text links:
- restrained underline or animated line.

## Cards

Project cards must prioritize:
1. image,
2. project identity,
3. concise technical summary,
4. technology indicators,
5. action.

Do not overload cards with paragraphs.

## Navigation

Desktop:
- minimal fixed navigation or intelligently transforming navigation.

Mobile:
- accessible menu,
- language switcher,
- clear CTA.

Navigation must remain usable when the 3D scene is active.

## Scroll

The page may use scroll as a cinematic timeline.

However:
- users must be able to jump/skip,
- content must remain reachable without the animation,
- reduced-motion users must receive a non-cinematic but complete experience.

## Accessibility

All visual effects must have:
- semantic alternatives,
- keyboard support,
- readable contrast,
- reduced-motion behavior.

## Instrument language (design evolution + Phase 12)

The portfolio reads as an engineering document. Implemented in `src/app/globals.css` §12–13.

- **Technical voice:** `font-mono` / `text-meta` (system monospace, 12 px floor) for indices, counts, dates, stacks.
- **Figures:** `.fig-marks` registration corners instead of rounded cards; covers and schematics sit inside them.
- **Case files** (`ProjectRow`): rail (index, discipline, year) → title link → summary → stack → dossier line (source, figures, documented sections). Every fact is derived from the CMS document (`ProjectSummary.dossier`).
- **Schematics** (`ProjectSchematic`): deterministic, discipline-specific drawings for projects without published imagery; always captioned "Schematic · no published imagery". Never a fake screenshot.
- **Capability stack** (`SkillGroups`): CMS categories placed in architecture layers (`src/lib/disciplines.ts`), numbered L1… from the foundation; no ratings or bars.
- **Registers:** `.matrix` hairline cells; certificates grouped by issuer with measured counts.
- **Hero sheet:** identity lower-left, Inference Core upper-right, title block (figure caption + CMS counts) beneath the core, registration marks at the frame corners.
- **Motion:** feedback only (hairline draw, mark widening, ≤ 6 px magnetic pull on primary buttons, press scale); all static under reduced motion; nothing depends on hover.
