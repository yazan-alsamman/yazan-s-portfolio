# Phase 2 — Content Model & CMS Architecture

Read:
- Phase 0 report
- Phase 1 report
- `docs/CONTENT_MODEL.md`
- `docs/DASHBOARD_SPEC.md`
- `docs/SECURITY.md`

## Mission

Implement the content architecture that will power both the public portfolio and the admin dashboard.

## Tasks

- define project, experience, education, certificate, skill, CV, media and settings models
- define validation
- define publication states
- define localization strategy
- define media relationships
- implement migrations/schema where appropriate
- implement repository/service boundaries
- establish authenticated dashboard architecture without polishing every screen yet
- ensure content has a single source of truth

## Rules

Do not populate the database with invented personal information.

Use fixtures only for clearly marked development/test data.

Do not expose admin functionality publicly.

## Verification

Test content creation, validation, localization fields and publication state behavior.

## Report

Create:

`docs/reports/PHASE_2_REPORT.md`

Include schema decisions, migration status, security considerations, tests and remaining blockers.

STOP.
