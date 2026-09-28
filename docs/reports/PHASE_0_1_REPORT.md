# Phase 0.1 Report

## 1. Phase

**Phase:** 0.1 — Repository, Content & Specification Reconciliation
**Date:** 2026-09-27
**Status:** COMPLETE WITH KNOWN LIMITATIONS

## 2. Objective

Before Phase 1:
- establish an independent git repository and remove the dangerous parent-repository situation,
- apply the owner's confirmed decisions (identity, legacy site, domain, VPS hosting, portrait),
- create the missing `PRODUCT_REQUIREMENTS.md`,
- reconcile every specification reference,
- sanitize the legacy content inventory,
- audit the portrait,
- update the architecture documentation.

No Phase 1 implementation.

## 3. Starting State

- Specification folder with the Phase 0 deliverables. No application code.
- The folder resolved to a git repo rooted at `C:/Users/Lenovo` (no commits; `.ssh/` and `.git-credentials` untracked).
- `docs/PRODUCT_REQUIREMENTS.md` was missing.
- The legacy URL typo `yazan-alsaman.github.io` appeared in `README.md`, `docs/CONTENT_MIGRATION.md` and `prompts/00_DISCOVERY_AND_AUDIT.md`.
- The primary display name across the spec was "Yazan Alsamman", and the title was "Information Technology Engineer specializing in Artificial Intelligence" or "AI & Technology Engineer".
- `portrait.jpg` had appeared at the project root (it was not present during the Phase 0 audit).

## 4. What Was Implemented

1. **Independent git repository** at the project root (`git init -b main`), with a stack-specific `.gitignore` and a `.gitattributes` (LF normalization for Windows → Linux VPS, binary asset rules).
2. **Pre-commit secret scan**: file-name and content patterns. Clean.
3. **Local baseline commit** `889d6c7` of the pre-reconciliation state (40 files), so every Phase 0.1 change is reviewable with `git diff`. **All Phase 0.1 edits are left uncommitted for owner review.** No remote, nothing pushed.
4. **Specification reconciliation**: legacy URL fixed; canonical name/title propagated; SEO documents extended with the `/` + `/ar` scheme and the rule that the legacy site is never canonical; README index and asset status updated.
5. **New `docs/content/OWNER_PROFILE.md`**: confirmed facts only, plus pending/excluded lists.
6. **New `docs/PRODUCT_REQUIREMENTS.md`**: Must / Should / Future, each requirement citing its source document, with no new requirements.
7. **`LEGACY_CONTENT_INVENTORY.md` restructured** into A. Verified/Owner-confirmed · B. Requires cleanup (with **INVALID / PLACEHOLDER — DO NOT PUBLISH** items) · C. Do Not Republish. Historical evidence is kept, and personal values (birth date, phone, address) are no longer repeated.
8. **ADRs updated**: ADR-001 (implemented), ADR-003 (**Payload → CANDIDATE** with a 14-point Phase 2 trial matrix and a switch rule), ADR-006 (URL scheme confirmed), ADR-007 (unchanged, loading order restated), ADR-008 (portrait facts), ADR-012 (**VPS** topology), new ADR-017 (canonical identity source).
9. **Risk register updated**: R-03, R-09, R-17 closed; R-01, R-04, R-21 downgraded; R-12 reclassified; R-22 to R-26 added.
10. **Portrait audit**: read-only, see the dedicated section.

## 5. Files Created

```text
.gitignore
.gitattributes
docs/PRODUCT_REQUIREMENTS.md
docs/content/OWNER_PROFILE.md
docs/reports/PHASE_0_1_REPORT.md
(.git/ — project-local repository)
```

## 6. Files Modified

```text
README.md                                   identity, legacy URL, hosting, asset status, spec index
docs/AGENT_ENGINEERING_RULES.md             Rule 3: canonical name/title, variant ban
docs/BRAND_IDENTITY.md                      title, wordmark YAZAN AL SAMMAN + يزن السمان, monogram note
docs/CONTENT_MIGRATION.md                   legacy URL fixed, owner confirmation, verification caveat
docs/PROJECT_CHARTER.md                     name
docs/SEO_AND_DISCOVERABILITY.md             brand search targets, alternateName rule
docs/SEO_CHECKLIST.md                       name
docs/SEO_CONTENT_STRATEGY.md                pillar A targets, §8 entity consistency, §9 author
docs/SEO_MASTER_REQUIREMENTS.md             name, title examples, targets, §3 legacy-not-canonical, §19 /ar scheme
docs/architecture/ARCHITECTURE_DECISIONS.md ADR-001/003/006/007/008/012 revised, ADR-017 added
docs/architecture/INFORMATION_ARCHITECTURE.md  H1 contract with confirmed identity
docs/architecture/RISK_REGISTER.md          see §4 item 9
docs/content/LEGACY_CONTENT_INVENTORY.md    restructured into categories A/B/C
prompts/00_DISCOVERY_AND_AUDIT.md           legacy URL, name
prompts/01_BRAND_AND_DESIGN_FOUNDATION.md   name
```

**Intentionally not modified:** `docs/reports/PHASE_0_REPORT.md`. It is a historical record of what was true at Phase 0, so its references to the typo URL and to "Yazan Alsamman" describe the state at that time. Unrelated specs (CONTENT_MODEL, DASHBOARD_SPEC, DESIGN_SYSTEM, I18N, LANDING, PERFORMANCE, ROADMAP, SECURITY, TECHNICAL_ARCHITECTURE, REPORT_TEMPLATE, prompts 02–10) contained no incorrect identity or legacy information and were left untouched.

## 7. Architecture Decisions

### Decision: Payload CMS is a CANDIDATE, not approved (ADR-003)
**Reason:** owner instruction; a real trial is needed. **Alternatives:** custom dashboard (fallback). **Consequences:** the Phase 2 report must fill in the T1–T14 matrix (bilingual, projects, certificates, media, CV, publishing, authn, authz, SEO metadata, relationships, validation, PostgreSQL, maintainability, VPS deployment). Any FAIL on T1, T6, T7, T8 or T12, or three or more FAIL/PARTIAL results overall, switches to the custom dashboard.

### Decision: Production target is a VPS (ADR-012)
**Reason:** owner decision. **Alternatives:** Vercel + managed services (dropped). **Consequences:** topology Internet → reverse proxy/TLS → Next.js (with Payload in-process) → PostgreSQL, with media on a persistent volume (S3-compatible as an optional seam). Provider and OS are not selected. Ops burden recorded as R-23. Nothing provisioned.

### Decision: Canonical identity source (ADR-017)
**Reason:** a single source of truth for the name/title. **Consequences:** `OWNER_PROFILE.md` → CMS Profile → metadata, JSON-LD, wordmark and footers. No hard-coded name/title in components.

### Decision: URL scheme confirmed (ADR-006)
English at `/`, Arabic at `/ar/...`, per the owner's Phase 0.1 instructions.

### Decision: 3D architecture unchanged (ADR-007)
Three.js + R3F; HTML/identity → content → 3D enhancement; phones and reduced-motion users do not download the full scene.

## 8. Content Verification

| Fact | Source | Verified |
|---|---|---|
| Name EN "Yazan Al Samman" | Owner (Phase 0.1 instruction) | YES |
| Name AR "يزن السمان" | Owner | YES |
| Title "Artificial Intelligence Engineer" | Owner | YES |
| Production domain `https://yazanalsamman.com` | Owner | YES |
| Legacy site `https://yazan-alsamman.github.io` is the owner's | Owner | YES |
| Hosting: VPS | Owner | YES |
| Portrait `portrait.jpg` is the official asset | Owner; file inspected | YES |
| Everything else from the legacy site | Legacy site | NO — Category B/C in the inventory |

Owner input still required: Arabic title, bio, public email, social links, education, experience, certificates + files, CV, featured projects, the `alternateName` decision and the monogram (full list in `OWNER_PROFILE.md` → Pending).

## 9. Visual Work

Not applicable. No UI or design-system work was done, per the phase scope.

## 10. Tests

### Typecheck
Result: **NOT APPLICABLE** — no code or `package.json` exists.

### Lint
Result: **NOT APPLICABLE** — no code.

### Unit / Integration
Result: **NOT APPLICABLE** — no code.

### E2E
Result: **NOT APPLICABLE** — no application.

### Production Build
Result: **NOT APPLICABLE** — nothing to build.

### Checks actually run
| Check | Result |
|---|---|
| Referenced spec files exist; internal doc references resolve (27 markdown files, 62 path references) | **PASS**. The only unresolved reference at check time was this report itself (`README.md` → `docs/reports/PHASE_0_1_REPORT.md`), which is resolved by creating it. |
| Markdown table structure (architecture/content/reports docs) | **PASS** — 0 errors (this report was authored to the same structure after the check) |
| Obsolete legacy URL `yazan-alsaman.github.io` | **PASS** — 5 remaining occurrences, all intentionally historical: RISK_REGISTER R-03 (closed, labelled "historical"), inventory §1 (labelled "historical typo"), CONTENT_MIGRATION (labelled typo), PHASE_0_REPORT ×2 (historical record) |
| Canonical identity consistency | **PASS** — "Yazan Al Samman" in 17 spec files; "يزن السمان" in 11. Non-canonical spellings remain only in explicit "avoid/variant/historical" lists and the historical Phase 0 report |
| Git root = project root | **PASS** — `C:/Users/Lenovo/Downloads/yazan-alsamman-portfolio-project-spec/yazan-alsamman-portfolio-spec` |
| Parent repository not used / not modified | **PASS** — `C:/Users/Lenovo` repo still has no commits; no git command was run against it except read-only checks |
| `.gitignore` effectiveness (`git check-ignore`) | **PASS** — `.env`, `.env.local`, `node_modules/`, `.next/`, `media/`, `*.sql.gz`, `coverage/`, `id_ed25519`, `.git-credentials` ignored; `.env.example` trackable |
| Sensitive paths tracked | **PASS** — none |
| Secret scan, working tree (API-key/token/private-key/DB-URL-with-password/password patterns) | **PASS** — 0 hits |
| Secret scan, git history | **PASS** — 0 hits |
| `portrait.jpg` exists and is readable | **PASS** — PIL `verify()` OK, JPEG 538×661 |
| Portrait unmodified | **PASS** — SHA-256 unchanged; `git diff HEAD -- portrait.jpg` empty |

## 11. Performance

Not applicable (no application). Portrait-weight notes are in the Portrait section.

## 12. Accessibility

Not applicable in this phase. The identity/H1 contract (IA §4) keeps the name and title in semantic HTML.

## 13. Security

See **Git Repository Safety**. Additional notes:
- R-26: the 21st.dev MCP API key (configured earlier in this session) sits in plaintext in `~/.claude.json`, **outside** the project repo (confirmed by the scan), and was visible in chat. Rotation is recommended if the transcript may be shared.
- R-24: the local baseline commit contains the Phase 0 inventory, which quoted the legacy birth date and phone number. It has never been pushed; the owner decides before the first push.

## Git Repository Safety

| Item | Result |
|---|---|
| Previous repository root | `C:/Users/Lenovo` (home directory; no commits; `.ssh/`, `.git-credentials` untracked) |
| New project repository root | `C:/Users/Lenovo/Downloads/yazan-alsamman-portfolio-project-spec/yazan-alsamman-portfolio-spec` (branch `main`) |
| Parent repo modified? | **No.** Not deleted, not staged, not committed. `.ssh` and `.git-credentials` were not touched |
| `.gitignore` | Stack-specific: env files (with `!.env.example`), keys/credentials, `node_modules/`, `.pnpm-store/`, `.next/`, `out/`, `dist/`, `build/`, `*.tsbuildinfo`, Payload runtime `/media/` + `/uploads/`, DB dumps/backups/`pgdata/`, test artifacts (`coverage/`, Playwright, Lighthouse CI), logs, OS/editor files, `.claude/settings.local.json`, generated image derivatives |
| `.gitattributes` | `* text=auto eol=lf`; binary rules for images, fonts, PDF, glb/ktx2 |
| Secret scan | Clean (working tree + history) |
| Commit | One local baseline commit `889d6c7` (spec + Phase 0 deliverables + portrait + ignore files). Phase 0.1 edits are **uncommitted**, for review |
| GitHub remote | **Not configured.** The GitHub CLI (`gh`) is not installed (checked in both Git Bash and PowerShell). **GitHub remote creation requires owner authentication.** No credentials were requested or invented. The preferred repository name is `yazan-alsamman` (the `yazan-alsamman` account's public repo list contains no repo of that name) |
| Pushed? | **No.** Nothing has been pushed anywhere |
| Residual risk | The parent `C:/Users/Lenovo/.git` still exists. Running git from any folder outside this project resolves to it (R-01 residual). Owner action recommended |

## Owner Identity

```text
English:
Yazan Al Samman

Arabic:
يزن السمان

Professional Title:
Artificial Intelligence Engineer
```

Recorded in `docs/content/OWNER_PROFILE.md` and enforced by ADR-017 and AGENT_ENGINEERING_RULES Rule 3.

## Legacy Website

```text
Confirmed owner:
YES
URL:
https://yazan-alsamman.github.io
```

Content source only. Its design, layout, typography, colors, animations, identity and components are not reused. It is never used as a canonical URL (SEO_MASTER §3). Confirmed ownership does not validate its statements: skill percentages, counters (30 / 40 / 463 / 15), the lorem-ipsum project (P13), unrelated template text (P8), placeholder boilerplate and unsupported client claims are marked **INVALID / PLACEHOLDER — DO NOT PUBLISH**. The birth date, home/neighbourhood address and personal phone number are **DO NOT REPUBLISH**.

## Portrait

| Property | Value |
|---|---|
| Found | **YES** |
| Path | `portrait.jpg` (project root) |
| Format | JPEG, baseline (SOF0), JFIF 1.01, RGB 8-bit, 72 dpi, no ICC profile |
| Dimensions | **538 × 661 px** (portrait orientation, ~0.81:1) |
| File size | 71,666 bytes (~70 KB) |
| Metadata | EXIF: Windows Photo Editor 10, timestamp 2026-09-14, orientation 1; **no GPS** |
| SHA-256 | `1c00fa075b97e2ef8a3460b3d62155052533729994041bd7f562ed5177323fca` |
| Content | Candid three-quarter profile facing left; black leather jacket; warm beige wood-panel background; own hands clasped at bottom-left; **another person's hand holding a blue pen at the bottom-right edge** |
| Desktop suitability | **Limited.** Adequate for an About portrait or a card up to ~540 CSS px at 1× (~270 CSS px on 2× displays). **Not sufficient** for a full-bleed desktop hero or a large 2.5D scene layer without visible softness |
| Mobile derivative required | **Yes** — a cropped mobile variant (tight head-and-shoulders crop) will be needed, and it is also where the current resolution works best |
| Compression recommended | Not for size (already ~70 KB). Delivery derivatives (AVIF/WebP at 1×/2× widths, EXIF stripped) are still recommended in the Phase 6 pipeline |
| Required treatment | Crop out the third-party hand/pen; background separation/matte for the dark identity; conventional resampling only. **No generative upscaling or AI facial alteration** |
| Derivatives created in this phase | **None.** Crop and treatment depend on Phase 1/3 design decisions, and the pipeline is Phase 6. The original is untouched |
| Recommendation | Ask the owner for the **original, full-resolution photo** from the same shoot (ideally ≥ 2400 px on the long edge), before the Phase 3 visual sign-off |

## Specification Integrity

| Item | Result |
|---|---|
| Missing files fixed | `docs/PRODUCT_REQUIREMENTS.md` created (consolidation of README, charter, dashboard, landing, SEO ×3, performance/accessibility, i18n; Must / Should / Future) |
| Broken references fixed | README → PRODUCT_REQUIREMENTS now resolves; README index extended with the SEO, owner-profile, inventory, architecture and report documents |
| Inconsistent identity fixed | "Yazan Alsamman" → "Yazan Al Samman" across README, agent rules, brand identity (incl. wordmark), charter, SEO docs ×4, IA, prompts 00/01. Titles "Information Technology Engineer specializing in AI" / "AI & Technology Engineer" → "Artificial Intelligence Engineer". Arabic name added where identity is defined |
| Obsolete URL fixed | `yazan-alsaman.github.io` → `yazan-alsamman.github.io` in README, CONTENT_MIGRATION, prompts/00; remaining mentions are labelled historical |

**SEO documents now explicitly support:** Person entity (SM §21–22) · Website entity (SM §23) · bilingual SEO (SM §19–20) · English `/` + Arabic `/ar` (SM §19, added) · project-level SEO (SM §13, §24) · canonical URLs (SM §11) · sitemap (SM §17) · robots (SM §18) · hreflang (SM §19) · Open Graph (SM §8, §35) · structured data (SM §21–25) · Core Web Vitals (SM §29–30) · crawlable HTML (SM §5, §32) · 3D progressive enhancement (SM §28, §31) · production domain `https://yazanalsamman.com`, with the legacy site never canonical (SM §3, added).

## SEO Audit

### Indexability
NOT APPLICABLE — no deployed site. The strategy is unchanged (IA §1).

### Metadata
NOT APPLICABLE — title examples updated to "Yazan Al Samman — Artificial Intelligence Engineer".

### Canonicals
NOT APPLICABLE — the canonical host is fixed as `https://yazanalsamman.com`; the legacy host is excluded explicitly.

### Internal Linking
NOT APPLICABLE.

### Structured Data
NOT APPLICABLE — the Person entity name is now canonical; `alternateName` is pending owner approval.

### International SEO
PASS (specification level) — `/` + `/ar` scheme documented in SEO_MASTER §19 and ADR-006.

### Performance
NOT APPLICABLE.

### Accessibility
NOT APPLICABLE.

### SEO Issues
- The domain handle `yazanalsamman` differs from the display name "Yazan Al Samman". This is not an error, but the `alternateName` decision is pending.

### SEO Risks
R-21 (entity consistency, now MEDIUM), R-22 (AI title needs AI evidence).

### Required Follow-up
Owner: the `alternateName` decision; align GitHub/LinkedIn display names with "Yazan Al Samman" over time.

## 14. Known Issues

1. No GitHub remote: `gh` is not installed and owner authentication is required.
2. Phase 0.1 documentation changes are uncommitted, pending owner review.
3. The portrait is low-resolution and includes a third party's hand; a higher-resolution original is requested.
4. The parent `C:/Users/Lenovo/.git` still exists (not modified by instruction).
5. The baseline commit contains legacy personal values in the Phase 0 inventory version (local only, R-24).
6. Arabic professional title not yet supplied.
7. There is still no application code, so there are no typecheck, lint, test or build results.

## 15. Risks

Open, highest first: **R-02** content accuracy (CRITICAL), **R-05** thin verified content (CRITICAL), **R-04** portrait quality (HIGH), **R-22** title vs AI evidence (HIGH), **R-23** VPS operations (HIGH), R-06/R-07/R-08/R-10 (HIGH), R-01 residual, R-21, R-24, R-25 (MEDIUM), R-26 (LOW). Closed: R-03, R-09, R-17. Full register: `docs/architecture/RISK_REGISTER.md`.

## 16. Assumptions

1. The owner's Phase 0.1 instruction listing "English `/`, Arabic `/ar`" constitutes approval of ADR-006's URL scheme.
2. "AI Engineer" is an acceptable short form only where space is constrained, always expanding to the full title in H1/metadata (OWNER_PROFILE usage rules). If the owner disagrees, the full title is used everywhere.
3. A local baseline commit is acceptable. It was not pushed, and it lets the owner review this phase as a diff.
4. The monogram "YA" is retained until the owner decides.

## 17. Owner Decisions Required

| ID | Decision | Consequence | Recommended default |
|---|---|---|---|
| D-1 | Review and approve the Phase 0.1 diff (`git diff`), then commit it | Documentation baseline for Phase 1 | Approve and commit |
| D-2 | GitHub remote: install `gh` and authenticate yourself (or create `yazan-alsamman` on github.com), plus visibility | Off-machine backup (R-25); enables push | Private repository named `yazan-alsamman` |
| D-3 | Before the first push: keep or re-create the baseline commit (it contains legacy personal values in the old inventory) | Privacy of history (R-24) | Re-create the baseline without them |
| D-4 | The parent `C:/Users/Lenovo/.git`: delete or keep | R-01 residual | Delete it (it has no commits) — owner action only |
| D-5 | Provide a higher-resolution original of the portrait | Phase 3 hero quality (R-04) | ≥ 2400 px long edge, same shoot |
| D-6 | Arabic professional title wording | Arabic H1/metadata | Owner-written, not machine-translated |
| D-7 | `Person.alternateName` "Yazan Alsamman" (matches the domain) | Search matching | Approve as alternateName only |
| D-8 | Keep the "YA" monogram? | Brand mark | Decide during Phase 1 review |

Content inputs (bio, email, socials, education, experience, certificates, CV, featured projects) remain listed in `OWNER_PROFILE.md` → Pending. They are needed from Phase 2 onward, not for Phase 1.

## Phase 1 Readiness

**READY FOR PHASE 1**

Basis:
- The repository boundary is safe: independent repo at the project root, secret scan clean, sensitive paths ignored, nothing pushed.
- The canonical identity is confirmed and propagated (EN name, AR name, EN title).
- The specification set is complete and consistent (PRODUCT_REQUIREMENTS created, references resolve, no obsolete URL).
- The architecture is updated (VPS, Payload as candidate, 3D unchanged).
- The portrait exists and is readable. Its limitations do not affect Phase 1, which builds no hero.

Conditions and non-blocking items for Phase 1: D-1 (commit the reviewed diff) should happen before Phase 1 code lands. The Arabic title (D-6) and the monogram (D-8) can use clearly marked `TODO: OWNER INPUT REQUIRED` placeholders in Phase 1. D-2 to D-5 do not block Phase 1.

## 19. Recommended Next Prompt

Phase 1 (unchanged from the Phase 0 recommendation, with the identity updated): in this repository, scaffold Next.js 16 + TypeScript (strict) + pnpm + Tailwind v4 + next-intl (ADR-001/002/006/015). Implement dark/light design tokens and self-hosted fonts (Space Grotesk / Inter / IBM Plex Sans Arabic, per-script scales), the `[locale]` layout with `lang`/`dir`, the header/footer/mobile-nav/language-switcher shell, the wordmark **YAZAN AL SAMMAN / يزن السمان**, base primitives, and CSS motion with reduced-motion handling. Add `SITE_URL` env validation and CI gates. No Payload, no three.js, no personal content beyond OWNER_PROFILE.

## 20. Final Verdict

**COMPLETE WITH KNOWN LIMITATIONS**

STOP — Phase 1 has not been started.
