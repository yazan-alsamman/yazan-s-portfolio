# Claude Code Engineering Rules

## Rule 1 — Evidence Before Implementation

Inspect the existing repository before changing anything.

Never assume:
- framework,
- package manager,
- database,
- existing routes,
- existing auth,
- existing deployment,
- existing content.

## Rule 2 — Do Not Invent Personal Facts

Never invent:
- jobs,
- employers,
- education,
- degrees,
- grades,
- certificates,
- awards,
- clients,
- project metrics,
- years of experience,
- locations,
- social links.

Use `TODO: OWNER INPUT REQUIRED` when needed.

## Rule 3 — Preserve the Owner's Identity

The owner is:

**Yazan Al Samman** (Arabic: **يزن السمان**)

Professional title (owner-confirmed):

**Artificial Intelligence Engineer**

Do not rewrite this into a different profession, and do not change the title, without explicit owner approval.
Historical name spellings (e.g. "Yazan Alsamman", "Yazan AL Samman", "Yazan Al-Samman") must never be used as the primary identity.
The canonical source is `docs/content/OWNER_PROFILE.md`.

## Rule 4 — Legacy Site Is Content-Only

Use the legacy site as a content source.

Do not copy:
- layout,
- colors,
- animations,
- component structure,
- typography,
- visual identity.

## Rule 5 — No Premature Implementation

Do not build Phase N+1 while Phase N is under review.

## Rule 6 — Report Everything

At the end of every phase create:

`docs/reports/PHASE_<N>_REPORT.md`

The report must include:
- objective
- starting state
- work completed
- files created/changed
- architecture decisions
- tests
- verification
- screenshots/visual evidence where relevant
- unresolved issues
- risks
- assumptions
- next-phase prerequisites

## Rule 7 — No Silent Scope Expansion

If you discover useful work outside the current phase:
- record it,
- do not implement it unless it is required for the current phase.

## Rule 8 — Prefer Measured Decisions

For performance:
- measure before optimizing.

For architecture:
- document tradeoffs.

For 3D:
- measure frame rate and resource usage.

## Rule 9 — Quality Gates

Before reporting a phase complete:
- typecheck
- lint
- tests relevant to the phase
- production build where appropriate
- check console errors
- check responsive behavior
- check accessibility implications

## Rule 10 — Never Hide Failures

If something could not be verified, say so explicitly.

A failed check is not a successful check.

## Rule 11 — Keep Documentation Synchronized

If architecture changes:
- update architecture docs,
- update ADRs when applicable,
- update roadmap,
- mention the change in the phase report.

## Rule 12 — Ask Only When Necessary

If an owner decision is genuinely required, stop and document:
- the exact decision,
- available options,
- consequences,
- your recommended technical default only when it is not a political/personal preference issue.

Do not ask unnecessary questions that can be resolved by inspecting the repository.

## Rule 13 — Production Mindset

Code should be:
- maintainable,
- typed,
- testable,
- secure,
- observable,
- deployable.

## Rule 14 — Visual Quality

The site must not settle for "works".

For visual phases, verify:
- hierarchy,
- spacing,
- typography,
- responsive behavior,
- motion,
- composition,
- visual coherence,
- perceived quality.

## Rule 15 — Stop Condition

When the current phase is complete:

STOP.

Generate the report.

Do not automatically start the next phase.
# SEO-SPECIFIC AGENT RULES

## Rule SEO-01

SEO is a product requirement, not a post-launch task.

## Rule SEO-02

Never sacrifice crawlable semantic content for a visual effect.

## Rule SEO-03

Never place critical identity/content information exclusively inside WebGL, Canvas or 3D objects.

## Rule SEO-04

Never invent facts for SEO.

## Rule SEO-05

Never create low-value pages solely to increase indexed page count.

## Rule SEO-06

Never keyword-stuff titles, descriptions, headings, alt text or body content.

## Rule SEO-07

Every new public route must receive an SEO review before the phase is completed.

## Rule SEO-08

Every new content entity must have an explicit indexability strategy.

## Rule SEO-09

Every published project must have a stable canonical URL.

## Rule SEO-10

Every localized page must have a deliberate canonical and internationalization strategy.

## Rule SEO-11

Never claim that Google has indexed the website unless this has been externally verified.

## Rule SEO-12

Never claim that Core Web Vitals are healthy without measurement.

## Rule SEO-13

Never mark a phase COMPLETE if it introduces a known SEO regression without documenting it.

## Rule SEO-14

If an SEO requirement conflicts with a visual implementation, preserve crawlability and semantic accessibility first, then redesign the visual implementation around it.

## Rule SEO-15

Before the final deployment phase, run the complete `docs/SEO_CHECKLIST.md`.
