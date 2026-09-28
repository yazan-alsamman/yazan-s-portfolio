# Phase 0 — Discovery, Audit & Architecture Freeze

You are the lead engineer and technical product architect for the Yazan Al Samman personal portfolio project.

Read these documents first:

- `README.md`
- `docs/PROJECT_CHARTER.md`
- `docs/BRAND_IDENTITY.md`
- `docs/AGENT_ENGINEERING_RULES.md`
- `docs/CONTENT_MIGRATION.md`
- `docs/ROADMAP.md`

## Mission

Perform a complete discovery and architecture audit before implementing the product.

## Tasks

1. Inspect the repository from the root.
2. Identify framework, package manager, scripts, existing components and deployment assumptions.
3. Inspect all provided owner assets, especially the portrait.
4. Attempt to access `https://yazan-alsamman.github.io`.
5. If accessible, inventory its content without copying its design.
6. If inaccessible, identify what source material is available locally and record the exact missing inputs.
7. Determine the safest architecture for:
   - public site,
   - 3D scene,
   - CMS/dashboard,
   - authentication,
   - content storage,
   - media,
   - localization,
   - SEO,
   - deployment.
8. Evaluate the likely 3D stack and dependency cost.
9. Create an initial information architecture.
10. Create a risk register.
11. Identify decisions that truly require owner input.
12. Do NOT build the full site yet.

## Mandatory Deliverables

Create/update:

- `docs/architecture/ARCHITECTURE_DECISIONS.md`
- `docs/content/LEGACY_CONTENT_INVENTORY.md`
- `docs/architecture/RISK_REGISTER.md`
- `docs/architecture/INFORMATION_ARCHITECTURE.md`
- `docs/reports/PHASE_0_REPORT.md`

## Strict Rules

Do not invent personal facts.

Do not start Phase 1.

Do not create placeholder claims such as fake employers or project metrics.

## Completion

Run all meaningful available checks.

Then STOP.

Your final action for this phase must be producing the report in `docs/reports/PHASE_0_REPORT.md`.

The report is the handoff for the next phase.
