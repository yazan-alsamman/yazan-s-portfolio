# Yazan Al Samman — Personal AI Engineer Portfolio

## Project
A premium, bilingual (English/Arabic) personal portfolio and professional identity platform for **Yazan Al Samman** (**يزن السمان**), an **Artificial Intelligence Engineer**.

**Canonical identity:** see `docs/content/OWNER_PROFILE.md` (owner-confirmed; the only source for name and title).  
**Production domain:** `https://yazanalsamman.com`  
**Legacy content source (owner-confirmed):** `https://yazan-alsamman.github.io` — content only, never design  
**Production hosting:** VPS  
**Implementation agent:** Claude Code

## Core Product Vision

This is not a conventional developer portfolio.

It should feel like a **premium digital identity / technology experience** combining:

- Artificial Intelligence
- Software engineering
- Robotics
- Computer vision
- Data and intelligent systems
- 3D interactive technology
- Professional engineering work
- Projects, case studies, CV and certificates

The first impression must be an exceptional cinematic landing experience. The site must communicate technical depth through interaction and visual storytelling rather than through excessive text.

## Non-Negotiable Requirements

1. Bilingual: English + Arabic.
2. RTL support must be first-class, not a visual afterthought.
3. The landing page must contain a cinematic, scroll-driven 3D experience.
4. A real portrait of Yazan will be supplied by the owner and must be incorporated tastefully.
5. Projects, certificates, CV and professional content must be manageable through an authenticated admin dashboard.
6. The public site must be SEO-ready.
7. The visual language must be premium, futuristic, restrained and editorial—not a generic "developer portfolio".
8. The implementation must be production-grade, accessible, performant and responsive.
9. No fabricated biography, education, employment, certificate, project metric, client, award or technology claim.
10. Every implementation phase ends with a formal report before the next phase starts.

## Execution Model

Claude Code must execute one phase at a time.

After each phase it MUST create/update a report under:

`docs/reports/PHASE_<N>_REPORT.md`

The report is then reviewed externally. The next phase prompt is generated only after reviewing that report.

Do not silently proceed into later phases.

## Required Starting Assets

The owner will provide:

- Portrait photograph — **supplied**: `portrait.jpg` (see `docs/reports/PHASE_0_1_REPORT.md` for audit)
- Existing CV, if available
- Certificates
- Project screenshots/media
- Any missing professional information
- Legacy site source/export — not needed: `https://yazan-alsamman.github.io` is live and owner-confirmed

See `docs/CONTENT_MIGRATION.md`.

## Specification Index

- `docs/PROJECT_CHARTER.md` — product definition and success criteria
- `docs/BRAND_IDENTITY.md` — visual identity, colors, typography and art direction
- `docs/DESIGN_SYSTEM.md` — reusable UI and interaction rules
- `docs/PRODUCT_REQUIREMENTS.md` — functional requirements
- `docs/LANDING_CINEMATIC_SPEC.md` — flagship 3D landing experience
- `docs/DASHBOARD_SPEC.md` — CMS/admin dashboard requirements
- `docs/CONTENT_MODEL.md` — content entities and publishing model
- `docs/I18N_AND_LOCALIZATION.md` — Arabic/English architecture
- `docs/TECHNICAL_ARCHITECTURE.md` — engineering architecture
- `docs/SEO_AND_DISCOVERABILITY.md` — SEO requirements
- `docs/PERFORMANCE_ACCESSIBILITY.md` — performance/accessibility budget
- `docs/SECURITY.md` — security requirements
- `docs/CONTENT_MIGRATION.md` — legacy content extraction and verification
- `docs/ROADMAP.md` — phased delivery plan
- `docs/AGENT_ENGINEERING_RULES.md` — mandatory Claude Code rules
- `docs/REPORT_TEMPLATE.md` — mandatory phase-report structure
- `docs/SEO_MASTER_REQUIREMENTS.md` / `docs/SEO_CONTENT_STRATEGY.md` / `docs/SEO_PHASE_GATE.md` / `docs/SEO_CHECKLIST.md` — SEO requirements, strategy, per-phase gate and launch checklist
- `docs/content/OWNER_PROFILE.md` — **canonical owner identity (owner-confirmed facts only)**
- `docs/content/LEGACY_CONTENT_INVENTORY.md` — legacy site audit (verified / needs cleanup / do not republish)
- `docs/architecture/ARCHITECTURE_DECISIONS.md` — ADRs
- `docs/architecture/INFORMATION_ARCHITECTURE.md` — routes, navigation, page layering
- `docs/architecture/RISK_REGISTER.md` — risks and mitigations
- `docs/reports/` — phase reports
- `prompts/00_DISCOVERY_AND_AUDIT.md` — first execution prompt
- `prompts/01_BRAND_AND_DESIGN_FOUNDATION.md`
- `prompts/02_CONTENT_MODEL_AND_CMS_ARCHITECTURE.md`
- `prompts/03_CINEMATIC_LANDING_PROTOTYPE.md`
- `prompts/04_PUBLIC_SITE_CORE.md`
- `prompts/05_DASHBOARD_IMPLEMENTATION.md`
- `prompts/06_CONTENT_AND_MEDIA_PIPELINE.md`
- `prompts/07_BILINGUAL_SEO_ACCESSIBILITY.md`
- `prompts/08_PERFORMANCE_3D_HARDENING.md`
- `prompts/09_SECURITY_PRODUCTION_HARDENING.md`
- `prompts/10_FINAL_AUDIT_AND_DEPLOYMENT.md`

## Definition of Done

The project is not complete merely because it builds.

It is complete when:

- content is verified,
- both languages work correctly,
- the cinematic scene performs acceptably,
- the portrait integration feels intentional,
- dashboard content changes appear safely on the public site,
- SEO metadata and structured data are valid,
- accessibility is tested,
- security checks pass,
- production build succeeds,
- deployment is documented,
- all known limitations are recorded.
