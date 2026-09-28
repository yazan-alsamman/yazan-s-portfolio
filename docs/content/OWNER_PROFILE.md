# Owner Profile — Canonical Identity

**Status:** Owner-confirmed
**Confirmed:** 2026-09-27 (Phase 0.1 instructions from the owner)
**Rule:** This file contains **only** facts the owner has explicitly confirmed. It is the single source of truth for identity fields in the CMS (`Profile`), metadata, JSON-LD and the brand wordmark. To add a fact, record the owner's confirmation and its date. Never add facts derived from the legacy site alone.

---

## Confirmed facts

| Field | Value | Source | Confirmed |
|---|---|---|---|
| Name (English) | **Yazan Al Samman** | Owner | 2026-09-27 |
| Name (Arabic) | **يزن السمان** | Owner | 2026-09-27 |
| Professional title (English) | **Artificial Intelligence Engineer** | Owner | 2026-09-27 |
| Professional title (Arabic) | **مهندس ذكاء صنعي** | Owner (D-6) | 2026-09-27 |
| Visual default | **Dark mode is the default and primary expression**; light is opt-in (ADR-018) | Owner (D-10) | 2026-09-27 |
| Production domain | `https://yazanalsamman.com` | Owner | 2026-09-27 |
| Legacy website (content source only) | `https://yazan-alsamman.github.io` | Owner | 2026-09-27 |
| Hosting target | VPS (provider and OS not yet specified) | Owner | 2026-09-27 |
| Official portrait | `portrait.jpg` (project root; original, never modified). **D-5 resolved: this 538 × 661 image is the authoritative portrait; no higher-resolution replacement is required.** Phase 3 must design around the resolution (controlled scale, 2.5D/depth treatment, masking, restrained crop, atmospheric integration), never upscale, AI-enhance or overwrite it. | Owner (D-5) | 2026-09-27 |
| Legacy website content | **Designated by the owner as the authoritative source for his existing portfolio content** (projects, skills, education, certificates, biography, links). Migrated to the CMS under the rules in `docs/reports/REAL_CONTENT_MIGRATION_REPORT.md`: the confirmed identity above still overrides legacy titles; private data, placeholders, percentages and contradictory values are not published. | Owner (task instruction) | 2026-09-28 |
| Public email | **yazanalsaamman@gmail.com** (resolves the legacy two-email conflict) | Owner | 2026-09-28 |
| LinkedIn | **https://www.linkedin.com/in/yazan-alsamman-7541a434** (owner-verified; supplied with Android share parameters, which are not published). Note: the legacy follow link used a different ID (`…7541a4349`); the owner's URL wins | Owner | 2026-09-28 |
| Instagram | **Yes** — https://www.instagram.com/yazan_al_samman (the legacy link without its `igsh` share parameter) | Owner | 2026-09-28 |
| Facebook | **No** — never published | Owner | 2026-09-28 |
| Experience | “More than 4 years of experience in the labor market, including systems analysis, requirements analysis, and building solutions using appropriate technology.” **CTO of VegaCORE.** No dates stated — none are stored or shown | Owner | 2026-09-28 |
| Education | **Arab International University (AIU) — graduation 2026** (overrides the legacy “European International University, 2021 – 2025”); degree unchanged | Owner | 2026-09-28 |
| Certificates | Publish the 28 migrated certificates **without certificate files** | Owner | 2026-09-28 |
| CV | Publish the CV as **web content without a file** (no PDF exists) | Owner | 2026-09-28 |
| Deferred to the dashboard | P8, P13, the P3 repository, missing screenshots, project dates/categories, featured projects and the biography stay **exactly as migrated**; the owner edits them later | Owner | 2026-09-28 |

```text
Name (English): Yazan Al Samman
Name (Arabic): يزن السمان
Professional Title: Artificial Intelligence Engineer
Professional Title (Arabic): مهندس ذكاء صنعي
Production Domain: https://yazanalsamman.com
Legacy Website: https://yazan-alsamman.github.io
Hosting: VPS
```

## Usage rules

- The name is always written **"Yazan Al Samman"**: three words, "Al" capitalized, no hyphen. It is never "Yazan Alsamman", "Yazan AL Samman", "Yazan Al-Samman" or "Yaz Al-Samman" as the primary identity.
- The Arabic name is written **"يزن السمان"** and is not transliterated or re-spelled.
- The Arabic title is **"مهندس ذكاء صنعي"** exactly. Do not reword, re-translate or "correct" it.
- The title is **"Artificial Intelligence Engineer"**. The abbreviation "AI Engineer" is acceptable only where space is constrained (e.g. OG image subtitle, mobile header) and must expand to the full title in the H1/metadata. **The title must not be changed without explicit owner approval.**
- The domain `yazanalsamman.com` and GitHub handle `yazan-alsamman` are **identifiers, not display names**. Their spelling does not override the display name.

## Pending — owner input still required

These fields are empty on purpose. **Do not fill them from the legacy site without owner confirmation.**

| Field | Status | Note |
|---|---|---|
| `Person.alternateName` | **NOT CONFIRMED / DEFERRED** (pre-Phase 2 audit) | "Yazan Alsamman" appears only in the pre-0.1 spec text and as a documented candidate; the legacy site uses "Yazan AL Samman"/"Yazan Al Samman", GitHub "Yazan-Alsamman". Matching the domain is not proof of a public name. Stays unset until the owner explicitly confirms. |
| Arabic copy reviewer (D-9) | **Pending owner-provided reviewer** | Required before Arabic is published. The UI/metadata Arabic in `messages/ar.json` was drafted by the implementation agent; only the name and title above are owner-confirmed. Gate: `src/config/copy-review.ts`. |
| Short bio / long bio (EN, AR) | **EN migrated verbatim from the legacy site (2026-09-28)**; AR pending | Left as is by owner decision; edited later in the dashboard |
| Public email | **Resolved** (see confirmed facts) | |
| Social profiles to show (GitHub, LinkedIn, others) | **Resolved:** GitHub, LinkedIn, Instagram; Facebook no | |
| Location (country/city visibility) | TODO: OWNER INPUT REQUIRED | Not published by default |
| Education | **Resolved:** AIU, 2026 (owner) | |
| Experience / employers | **Resolved:** CTO of VegaCORE + the stated experience (no dates) | Dates may be added later by the owner |
| Certificates (with files) | **Published without files (owner decision)** | Files/dates may be attached later in the dashboard |
| CV file(s) | **Web CV published without a file (owner decision)** | A PDF may be added later (CV global) |
| Featured projects & case-study material | **14 projects migrated; P1–P3 featured (the inventory's AI-evidence recommendation)** | Confirm the featured set; supply screenshots and case-study detail |
| Monogram "YA" | **Deferred until explicit owner approval** | Not rendered anywhere; no asset exists; the favicon stays a neutral provisional mark |

## Explicitly excluded (not approved for publication)

Age, date of birth, home address, neighbourhood, personal phone number and awards — until separately verified **and** explicitly approved by the owner. (Public email, employer/role and education were approved on 2026-09-28 — see above.) See `LEGACY_CONTENT_INVENTORY.md` §"Do Not Republish".
