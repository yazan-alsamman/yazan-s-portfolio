# Technical Architecture

## Architecture Goal

Build a maintainable production website rather than a one-off visual demo.

## Preferred Baseline

The implementation agent should evaluate a modern stack centered on:

- Next.js / React
- TypeScript
- Three.js / React Three Fiber for 3D
- a robust content/data layer
- authenticated dashboard
- optimized media pipeline

The final stack must be justified in the Phase 0 report.

## Architectural Boundaries

Separate:

1. Public presentation
2. 3D rendering
3. Content/domain layer
4. Admin UI
5. Authentication/authorization
6. Media handling
7. SEO generation
8. Localization
9. Infrastructure/deployment

## 3D Isolation

The 3D scene should be isolated from normal content rendering as much as practical.

Avoid:
- putting business logic inside render loops,
- fetching content directly from animation components,
- recreating heavy objects every frame,
- global mutable state for scene internals without justification.

## Data

The agent must select and document:
- database/storage,
- ORM/query layer if used,
- migrations,
- backup approach,
- validation,
- caching.

## Media

Images must be:
- optimized,
- responsive,
- lazy loaded where appropriate,
- provided with meaningful alt text,
- transformed into suitable formats when possible.

3D assets must be:
- compressed,
- loaded progressively,
- cached,
- disposed correctly.

## Environment Variables

Secrets must never be committed.

Provide:
- `.env.example`
- environment documentation
- production configuration guidance

## Testing

At minimum:
- unit tests for important content/domain logic,
- component tests for critical UI behavior where practical,
- integration tests for publishing flows,
- end-to-end tests for key public and admin paths,
- build/type/lint verification.

## Observability

Production errors should be diagnosable.

Do not introduce analytics or tracking without documenting:
- purpose,
- data collected,
- privacy implications,
- configuration.
