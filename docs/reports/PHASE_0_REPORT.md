# Phase 0 Report

## 1. Phase

**Phase:** 0 — Discovery, Audit & Architecture Freeze
**Date:** 2026-09-27
**Status:** COMPLETE WITH KNOWN LIMITATIONS

## 2. Objective

Audit the repository, environment, owner assets and legacy content. Choose and document a production architecture (public site, 3D, CMS, auth, storage, media, i18n, SEO, deployment). Evaluate the 3D dependency cost. Produce an information architecture and risk register, and identify the decisions that need owner input. No product implementation.

## 3. Starting State

- **Contents:** a specification-only folder — `README.md`, 19 docs, 12 prompts. There is **no application code**: no `package.json`, framework, components, scripts, CI or deployment config.
- **Git:** the folder is **not its own repository**. `git rev-parse --show-toplevel` → `C:/Users/Lenovo` (the whole home directory, no commits, with `.ssh/` and `.git-credentials` among the untracked files). See R-01 / ADR-001.
- **Spec archive vs folder:** the `.zip` in Downloads contains 28 files. The folder additionally has `SEO_CHECKLIST.md`, `SEO_CONTENT_STRATEGY.md`, `SEO_MASTER_REQUIREMENTS.md` and `SEO_PHASE_GATE.md`, added later. `docs/PRODUCT_REQUIREMENTS.md` is referenced by README but **does not exist**.
- **Owner assets:** **none in the project** — no portrait, CV, certificates or project media. (Two unrelated "ChatGPT Image" PNGs exist in the parent Downloads folder. They are not identified as owner assets and were not used.)
- **Toolchain:** Node v24.11.1, npm 11.6.2, pnpm 11.10.0, git 2.50.1, Python 3.14, Windows 11. A Docker config dir exists; the daemon was not verified.
- **Production domain:** `https://yazanalsamman.com` → HTTP 200, **Hostinger parked-domain page** (`noindex`).
- **Legacy URL from spec:** `https://yazan-alsaman.github.io` → **HTTP 404** (GitHub Pages "Site not found"). GitHub user `yazan-alsaman` does not exist; no Wayback snapshot.
- **Probable real legacy source:** `https://yazan-alsamman.github.io` (double "m") → HTTP 200. GitHub user `yazan-alsamman` links to it. **Ownership not yet owner-confirmed.**

## 4. What Was Implemented

Documentation only. No product code (per the Phase 0 scope).

1. Repository and environment audit (above).
2. Legacy content discovery: the spec URL was tested and failed. The likely correct URL was found, and 5 pages + 16 project pages were fetched to the session scratchpad (outside the repo). Text was extracted and inventoried field by field. **No legacy design, CSS, markup or images were copied into the repo.** The legacy portrait was deliberately not downloaded.
3. GitHub cross-check of the 35 public repos to test which legacy project links resolve (see inventory §2.9).
4. **Measured 3D dependency cost:** installed three 0.186.1, @react-three/fiber 9.8.1, drei 10.7.9, postprocessing, gsap, lenis and react 19.3 in the scratchpad, bundled minimal entry points with esbuild 0.28, and measured gzip sizes (ADR-007).
5. Queried the npm registry for current versions and peer compatibility (Next 16.3.6 ↔ Payload 3.90.2 compatible).
6. Wrote 16 ADRs, the information architecture, a 21-item risk register and the legacy inventory.

## 5. Files Created

```text
docs/architecture/ARCHITECTURE_DECISIONS.md
docs/architecture/INFORMATION_ARCHITECTURE.md
docs/architecture/RISK_REGISTER.md
docs/content/LEGACY_CONTENT_INVENTORY.md
docs/reports/PHASE_0_REPORT.md
```

## 6. Files Modified

```text
(none)
```

The legacy-URL typo in `README.md` / `docs/CONTENT_MIGRATION.md` was **left unchanged** pending owner confirmation (O-01).

## 7. Architecture Decisions

Full rationale, alternatives and consequences are in `docs/architecture/ARCHITECTURE_DECISIONS.md`. Summary:

| ADR | Decision | Status |
|---|---|---|
| 001 | Dedicated git repo at the project root; pnpm; Node 24; strict TS | Accepted — **action before Phase 1** |
| 002 | Next.js 16 App Router + RSC; static generation + on-demand revalidation; standalone output | Accepted |
| 003 | **Payload CMS 3 embedded** at `/admin`, content accessed only via a repository layer; custom dashboard as fallback | Accepted — spike in Phase 2 with exit criteria |
| 004 | PostgreSQL, committed migrations, daily `pg_dump` + media backup | Accepted |
| 005 | `DRAFT → PUBLISHED → ARCHIVED`, soft delete, auto-redirect on slug change, audit log | Accepted |
| 006 | English at `/`, Arabic at `/ar`; next-intl; logical CSS; **no fallback** — Arabic page only when Arabic content is complete | Accepted (owner to confirm primary language) |
| 007 | three + R3F + selective drei; postprocessing in High tier only; no GSAP/Lenis; lazy island; Low tier/reduced motion download **zero** three.js | Accepted — validate in Phases 3/8 |
| 008 | Portrait: private original, sharp derivatives, 2.5D matte/depth parallax, no fake 3D face | Accepted — blocked on asset |
| 009 | Upload allowlist (no SVG), magic-byte sniffing, size caps, renamed files, required alt EN/AR | Accepted |
| 010 | Payload auth, single admin, lockout, secure cookies, CSRF allowlist; 2FA gap mitigated at the proxy | Accepted — hardening in Phases 5/9 |
| 011 | `SITE_URL` env; Metadata API; generated sitemap/robots from published content; JSON-LD from verified fields only | Accepted |
| 012 | Host: VPS + Docker Compose **or** Vercel + managed Postgres + object storage | **Pending owner** |
| 013 | v1: no contact form (email/social links only) | Accepted |
| 014 | No analytics at launch | Accepted |
| 015 | Tailwind v4 + CSS-variable tokens; CI quality gates; initial budgets | Accepted |
| 016 | `.env.example`, Zod-validated env, fail-fast build | Accepted |

**3D dependency cost (measured, esbuild + gzip -9, indicative):**

| Bundle | gzip |
|---|---|
| react + react-dom | 69 KB |
| three, typical tree-shaken | 137 KB |
| react + R3F (pulls full three) | 319 KB |
| + drei (6 helpers) | +43 KB |
| + postprocessing (Bloom, Vignette) | +27 KB |
| gsap + ScrollTrigger (not adopted) | 46 KB |

R3F costs ~113 KB gzip more than vanilla three. This was accepted because the scene chunk is lazy, off the LCP path, and not downloaded by Low/reduced-motion tiers. Vanilla three is the documented fallback.

## 8. Content Verification

**No factual personal content was introduced into the product** (there is no product yet). The inventory records what the legacy site claims; **every item is UNVERIFIED** until the owner confirms it.

Key findings (details in `docs/content/LEGACY_CONTENT_INVENTORY.md`):
- **Usable after confirmation:** name variants, education entry (Bachelor of IT, European International University, 2021–2025), 29 certificate lines with issuers, 16 projects (about 9 with matching public GitHub repos), social links.
- **Must not migrate:** skill percentages; "Happy Clients 30 / Projects 40 / Hours 463 / Hard Workers 15" counters; the experience section (no employer names; the 2017–2018 role conflicts with the listed birth year); lorem-ipsum e-commerce page; the legacy portrait.
- **Conflicts:** two different emails; three name spellings; the professional title differs from the spec; graduation-project date (Jan 2026) vs education end (2025); the robot project links to the wrong repo; duplicated or mismatched card text.
- **Privacy:** phone, birth date and neighbourhood address are public on the legacy site. The default is to not republish them.

## 9. Visual Work

Not applicable (no UI built). No design was taken from the legacy site. Brand tokens remain as specified in `BRAND_IDENTITY.md`. One technical constraint for Phase 1: **Space Grotesk has no Arabic glyphs**, so Arabic display type must use IBM Plex Sans Arabic with a separately tuned scale.

## 10. Tests

### Typecheck
Result: **NOT APPLICABLE** — no TypeScript code or `package.json` exists.

### Lint
Result: **NOT APPLICABLE** — no code. A documentation check was run instead (below).

### Unit / Integration
Result: **NOT APPLICABLE** — no code.

### E2E
Result: **NOT APPLICABLE** — no running application.

### Production Build
Result: **NOT APPLICABLE** — nothing to build.

### Checks actually run
| Check | Result |
|---|---|
| Legacy URL reachability (`curl`) | `yazan-alsaman.github.io` 404 (retried; also no Wayback snapshot); `yazan-alsamman.github.io` 200 on all 21 pages |
| Production domain reachability | 200, Hostinger parked page |
| GitHub API cross-check of legacy repo links | 9 of 16 projects have an existing repo; 1 wrong link; 6 placeholder links |
| npm registry version/peer compatibility | `@payloadcms/next@3.90.2` peer `next >=16.3.3 <17` ↔ `next@16.3.6` ✔; `next-intl@4.14.7` ✔ |
| 3D bundle-size measurement | see §7 |
| Doc cross-reference check (24 markdown files, 30 path references) | 1 unique missing target: `docs/PRODUCT_REQUIREMENTS.md` (pre-existing spec gap, R-17) |
| Markdown table structure check on the new deliverables | 0 errors (this report was written after the check; its tables were authored to the same structure) |
| Secret-pattern grep on the new docs | none found |

## 11. Performance

No application exists to measure. The only measured data is the dependency payload in §7. Initial **targets** (not measurements) are in ADR-015: critical-path JS for `/` ≤ 170 KB gzip excluding the scene; scene chunk ≤ 400 KB gzip; LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms on mobile; LCP image ≤ 150 KB.

## 12. Accessibility

Designed in, not yet verifiable:
- Two-layer landing contract: all text in HTML, canvas `aria-hidden`, native scroll, "Skip intro" (IA §4).
- Reduced-motion path with no three.js download (ADR-007).
- Accessible mobile nav pattern, focus management, footer with full navigation (IA §3).
- RTL via `dir` at document level plus a lint-enforced ban on physical CSS properties (ADR-006).

## 13. Security

- **CRITICAL finding:** the project resolves to a git repo rooted at the user home directory, which exposes `.ssh/` and `.git-credentials` to accidental commits (R-01). **No git write commands were run** in this phase.
- Auth, upload, secrets and header strategy defined (ADR-009/010/016). The 2FA gap is recorded (R-10).
- Legacy site publishes personal data (R-12).
- Scratchpad downloads (legacy HTML, npm packages) are outside the repository.

## SEO Audit

### SEO Architecture Baseline
- **Current repository SEO:** none (no application).
- **Current routes:** none. Legacy: 5 pages + 16 detail pages, template titles ("Home page-Yazan AL Samman"), empty meta descriptions, no canonical, no OG, all images `alt=''`.
- **Current rendering strategy:** none. Planned: server-rendered/static HTML with the 3D scene as progressive enhancement (ADR-002/007).
- **Legacy content inventory:** done, unverified.
- **Domain strategy:** `https://yazanalsamman.com` canonical, from `SITE_URL`; the www → apex redirect is to be set at the host (Phase 10). The domain is currently parked (`noindex`), so there is no existing index to preserve.
- **Localization strategy:** `/` English, `/ar` Arabic, self-canonical per locale, hreflang en/ar + x-default → English, Arabic pages only when content is complete.
- **Sitemap strategy:** generated from published, non-archived content with locale alternates only when both exist.
- **Structured-data strategy:** WebSite, Person (verified fields only), BreadcrumbList, CreativeWork per project; no certificate credential schema.
- **Performance risks:** R-06, R-07.

### Indexability
NOT APPLICABLE (nothing deployed) — strategy defined (IA §1).

### Metadata
NOT APPLICABLE — strategy defined (ADR-011).

### Canonicals
NOT APPLICABLE — strategy defined.

### Internal Linking
NOT APPLICABLE — graph defined (IA §5).

### Structured Data
NOT APPLICABLE — strategy defined.

### International SEO
NOT APPLICABLE — strategy defined (ADR-006).

### Performance
NOT APPLICABLE — budgets defined; dependency cost measured.

### Accessibility
NOT APPLICABLE — requirements designed in.

### SEO Issues
- Name inconsistency across legacy sources dilutes the entity (R-21).
- The legacy site will remain live after launch. Whether to redirect or retire it is an owner decision (O-10).

### SEO Risks
R-06, R-07, R-08, R-21.

### Required Follow-up
Confirm the canonical name spelling (M-03); decide the legacy site's fate after launch (O-10).

## 14. Known Issues

1. The spec's legacy URL is wrong (typo); the correct source is unconfirmed.
2. `docs/PRODUCT_REQUIREMENTS.md` is referenced but missing.
3. No owner assets supplied (portrait, CV, certificates, media).
4. The project folder is inside the home-directory git repo.
5. Docker daemon availability was not verified.
6. Bundle sizes were measured with esbuild on synthetic entries, not on the real Next.js build.
7. The legacy site's `robots`/sitemap and its assets (screenshots) were not audited in depth; screenshots were not downloaded.

## 15. Risks

See `docs/architecture/RISK_REGISTER.md`. Top items: **R-01** (home-dir git repo / secret leak), **R-02** (legacy content accuracy), **R-04** (no portrait), **R-05** (thin verified content), then R-06/R-07 (3D vs CWV/crawlability), R-09 (hosting), R-10 (admin 2FA), R-21 (name consistency).

## 16. Assumptions

1. `yazan-alsamman.github.io` is the intended legacy source (pending O-01).
2. There is a single admin editor, so no REVIEW state is needed.
3. English is the primary/default language (x-default).
4. The owner will be able to supply Arabic-reviewed copy for professional text.
5. A Node-capable host will be used (not shared static hosting).
6. The wordmark "YAZAN ALSAMMAN" in BRAND_IDENTITY is authoritative for the Latin spelling in the UI until the owner states otherwise.

## 17. Owner Decisions Required

| ID | Decision | Options | Consequence | Recommended default |
|---|---|---|---|---|
| O-01 | Confirm that `yazan-alsamman.github.io` and GitHub `yazan-alsamman` are yours | yes / no | Unlocks the content inventory for verification | — (factual) |
| O-02 | Create a dedicated git repository for this project (and its remote: GitHub account, repo name, public/private) | new repo at the project folder / other location | Blocks Phase 1 (R-01). Separately: review the stray `.git` in your home folder | New private repo at the project root |
| O-03 | Hosting | A: VPS + Docker (single bill, you/we maintain it) · B: Vercel + managed Postgres + object storage (low ops, multiple vendors) | Affects media storage, backups, cost; needed before Phase 5 | B for low maintenance; A for cost control — your call |
| O-04 | Canonical name spelling (EN) and Arabic name; professional title EN + AR | e.g. "Yazan Alsamman" / "يزن السمان" (**your spelling needed**) | Wordmark, metadata, JSON-LD, SEO entity | — (personal) |
| O-05 | Which projects to feature (3–6) and permission to show client names/screenshots | — | Case-study depth; legal exposure | — (personal) |
| O-06 | Public contact data: which email; show phone? birth date? city/country? which socials (Facebook/Instagram on a professional site?) | — | Privacy vs reachability | Email + LinkedIn + GitHub only; no phone/birthday/address |
| O-07 | Primary language: English at `/` with Arabic at `/ar` | confirm / Arabic-first | Changes x-default and URL scheme | Confirm English at `/` |
| O-08 | Contact form in v1? | no (links only) / yes (needs email provider + anti-spam) | Scope, privacy notice | No for v1 |
| O-09 | `docs/PRODUCT_REQUIREMENTS.md` | supply it / confirm existing docs are complete | Missing requirements | Confirm existing docs suffice |
| O-10 | Legacy site after launch | leave / replace with a redirect to `yazanalsamman.com` / take down | Duplicate identity in search | Redirect or retire after launch |

**Assets to supply** (inventory §3): M-01 portrait (≥ 3000 px, consent), M-05 CV, M-06 certificate files, M-07 real experience list, M-08 education confirmation, M-09 case-study material, M-11 Arabic reviewer.

## 18. Next Phase Readiness

**Ready for Phase 1 (Brand & Design Foundation) once O-02 is resolved:**
- Stack, styling approach, token source, font set, locale/RTL architecture, IA and navigation structure are frozen.
- Phase 1 needs **no personal content and no portrait**. It uses the "YAZAN ALSAMMAN" wordmark from BRAND_IDENTITY and clearly marked `TODO: OWNER INPUT REQUIRED` placeholders only.

**Blocked:**
- Phase 1 scaffold: **O-02** (a dedicated repo; the agent can create it immediately on approval).
- Phase 1 Arabic wordmark/navigation labels: O-04 (Arabic name) — can use a marked placeholder meanwhile.
- Phase 2 content seeding: O-01 and M-02..M-09.
- Phase 3: **M-01 portrait**.
- Phase 5/9: O-03 hosting.

## 19. Recommended Next Prompt

Phase 1: in a new dedicated git repo, scaffold Next.js 16 + TypeScript (strict) + pnpm + Tailwind v4 + next-intl per ADR-001/002/006/015. Implement design tokens (dark + light) as CSS variables and self-hosted fonts (Space Grotesk / Inter / IBM Plex Sans Arabic with per-script scales). Add the `[locale]` layout with `lang`/`dir`, the header/footer/mobile nav/language switcher shell, base buttons/links/surfaces and CSS motion primitives with reduced-motion handling. Add `SITE_URL` env validation and CI (typecheck, lint with the physical-CSS ban, Vitest, Playwright + axe for EN/AR, build). **Do not** add Payload, three.js or personal content yet. Verify desktop/tablet/mobile, EN/RTL, keyboard and reduced motion, with screenshots.

## 20. Final Verdict

**COMPLETE WITH KNOWN LIMITATIONS**

Discovery, architecture freeze, IA, risk register and legacy inventory are done. Limitations: the legacy source is unconfirmed, no owner assets exist, the project is inside the home-directory git repo (must be fixed before Phase 1), and there was no code to typecheck, lint, test or build.

STOP — Phase 1 has not been started.
