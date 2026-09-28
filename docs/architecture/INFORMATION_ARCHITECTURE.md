# Information Architecture

**Phase:** 0 — initial version (2026-09-27) · revised Phase 0.1 (canonical identity, VPS) · Phase 1 (implemented shell: routing, nav, footer, internal preview route)
**Depends on:** ADR-006 (locale routing), ADR-011 (SEO), `LEGACY_CONTENT_INVENTORY.md`

This defines the structure, not the content. Every section below renders only verified content. A page whose data set is empty is **not published** and does not appear in navigation or the sitemap (SEO-05: no thin pages).

---

## 1. Locale & URL scheme

Decided in ADR-006: English at the root, Arabic under `/ar`.

| Page | English URL | Arabic URL |
|---|---|---|
| Home (cinematic landing) | `/` | `/ar` |
| About | `/about` | `/ar/about` |
| Projects index | `/projects` | `/ar/projects` |
| Project detail | `/projects/{slug}` | `/ar/projects/{slug}` |
| Experience | `/experience` | `/ar/experience` |
| Skills | `/skills` | `/ar/skills` |
| Certificates | `/certificates` | `/ar/certificates` |
| CV | `/cv` | `/ar/cv` |
| Contact | `/contact` | `/ar/contact` |
| Lab (optional, deferred) | `/lab` | `/ar/lab` |

Rules:
- Slugs are lowercase ASCII, hyphen-separated, and **shared across locales** (the Arabic page uses the same slug). This keeps hreflang pairs trivial and avoids transliteration debates.
- Published slugs are immutable in practice. Changing one creates a `Redirect` record (301) — see ADR-005.
- No trailing slash (`trailingSlash: false`). Query strings are never canonical.
- Each locale page is canonical to itself, with `hreflang="en"`, `hreflang="ar"` and `x-default` pointing to the English URL.
- No automatic `Accept-Language` redirect. At most, a dismissible "عربي" suggestion that never blocks crawling.
- Education is shown as a section of **About** (and on the CV page), not as its own route, until there is enough content to justify a URL.

### Private / non-indexed routes

| Route | Purpose | Indexing |
|---|---|---|
| `/admin/**` | Dashboard (Payload CMS admin UI — implemented in Phase 2; protected, noindex) | `robots.txt` Disallow + `X-Robots-Tag: noindex, nofollow` + auth |
| `/api/**` | CMS REST endpoints (Payload; access-controlled) + signed `/api/internal/revalidate` | Disallow; `noindex` header |
| `/preview/**` or draft mode | Draft preview | `noindex`; requires an authenticated session |
| `/404`, `/500` | Error pages | `noindex` |
| `/design-system`, `/ar/design-system` | Internal design-system preview (Phase 1, ADR-019). Disabled in production | `noindex` + `X-Robots-Tag`; disallowed in robots; not in sitemap |

The login page is part of `/admin`.

---

## 2. Site map (public)

```text
/ (Home — cinematic landing)
├── [HTML identity layer: H1 name + title, intro, primary CTAs]   ← crawlable, outside canvas
├── [3D narrative: Arrival → Ignition → Intelligence → Engineering → Systems → Identity]
├── Featured projects (3–6, from CMS)
├── Capability overview (skill categories with evidence links)
├── Short about + portrait
└── Contact CTA
/about
├── Bio (long)
├── Portrait
├── Education
└── Links → projects, experience, CV
/projects
├── Filter by category (client-side filter; every project is linked in plain HTML)
└── Project cards
    └── /projects/{slug}
        ├── Overview · Problem · Constraints · Architecture · Implementation
        ├── Technologies (linked to skills) · Role · Timeline
        ├── Media gallery · Links (repo/demo)
        ├── Results / Lessons (only if verified)
        └── Related projects → Contact CTA
/experience     (only if M-07 is supplied)
/skills         (categories; each skill links to evidence projects; no percentages)
/certificates   (grouped by domain/issuer; each item links to its file/verification when present)
/cv             (HTML summary + PDF download per locale)
/contact        (channels chosen by the owner; see ADR-013)
```

Sections are omitted when empty — never shown as "coming soon".

---

## 3. Navigation

**Primary (header):** Projects · About · Experience · Certificates · CV · Contact · [EN | ع]
**Skills** appears in the header only if space allows; it is always in the footer.

- Desktop: minimal fixed header, which the landing scene must never obscure (DESIGN_SYSTEM).
- Mobile: an accessible disclosure menu (`<button aria-expanded>`, focus trap, Esc to close) with the language switcher and a CTA.
- A **"Skip intro"** control is present on the landing page (keyboard-reachable, visible on focus). It jumps to `#work`.
- The language switcher links to the equivalent page in the other locale, not the home page.

**Footer:** every public route, social links (owner-approved), a CV download, and the language switch. This gives crawlers full internal linking even if the header nav is JavaScript-enhanced.

**Breadcrumbs:** on `/projects/{slug}` only (Home → Projects → Title), with `BreadcrumbList` JSON-LD.

---

## 4. Landing page layering (SEO/a11y contract)

The landing page is two independent layers:

1. **Document layer (always present, server-rendered HTML):** `<header>`, `<main>` with the single `<h1>` — EN: "Yazan Al Samman — Artificial Intelligence Engineer"; AR: "يزن السمان — مهندس ذكاء صنعي" — taken from the Profile record (ADR-017), intro paragraph, CTAs, featured-project list, `<footer>`. Fully usable with JavaScript disabled, WebGL unavailable or reduced motion.
2. **Scene layer (progressive enhancement):** a `<canvas>` mounted client-side after first paint, `aria-hidden="true"`, positioned behind or around the document layer. Scroll sections in the document layer drive the scene timeline. **The scene never holds unique information.**

Narrative chapter markers (e.g. "Intelligence", "Engineering") are real HTML text in the document layer, so screen readers and crawlers get the same story in order.

**As built (Phase 3).** `section#cinematic` holds a sticky, `aria-hidden` stage (static CSS composition + optional canvas) and the chapters: Arrival (the `<h1>`, a scroll cue and a "Skip the intro" link to `#portfolio`), five captioned acts (`<h2>` label + one line each: Computation, Intelligence, Engineering, Systems, Human intent; the last one also carries the portrait `<img>` with alt text), an `aria-hidden` Identity display (the `<h1>` already states the name) and the Transition `<h2>` ("The work"). Chapter heights come from the same timeline table as the scene (`src/scene/timeline.ts`). The rest of the homepage lives under `#portfolio`.

---

### Route availability as built (Phase 4)

| Route | Exists when (per locale, published + approved content only) |
|---|---|
| `/about` | the Profile's long biography has text (short bio alone is not enough — thin page) |
| `/projects`, `/projects/{slug}` | ≥ 1 project / that project |
| `/experience` | ≥ 1 experience entry |
| `/skills` | ≥ 1 skill |
| `/certificates` | ≥ 1 certificate |
| `/cv` | a CV PDF with "download visible" |
| `/contact` | an owner-approved email or social profile (ADR-013: no form in v1) |

Education renders on About and CV (no route). The homepage `#portfolio` sections (introduction, selected work, expertise, experience, credentials, contact) follow the same rule and link to their full routes.

## 5. Internal-linking graph

```text
Home ─► Projects, About, Experience, Certificates, CV, Contact, featured project pages
About ─► Projects, Experience, CV, Contact
Project ─► related Projects, Skills (via technologies), Contact
Skills ─► evidence Projects, Certificates in that domain
Experience ─► Projects done in that role
Certificates ─► Skills domain
Every page ─► footer (all routes)
```

No orphan pages: the sitemap generator asserts that every published project is linked from `/projects`.

---

## 6. Dashboard IA (`/admin`)

```text
/admin/login
/admin                     Overview (counts by status, recent changes, media usage)
/admin/projects            list · create · edit · publish/archive
/admin/experience
/admin/education
/admin/certificates
/admin/skills
/admin/cv
/admin/media               library, alt text EN/AR, usage
/admin/settings            Profile, SEO defaults, social links, contact, feature flags, scene config (limited)
/admin/redirects           slug-change redirects (can be automatic)
/admin/audit               change log (read-only)
```

Single-admin workflow: `DRAFT → PUBLISHED → ARCHIVED` (ADR-005).

---

## 7. Content-to-page mapping

| Entity (CONTENT_MODEL) | Rendered on | Indexable |
|---|---|---|
| Profile | Home, About, Contact, footer, JSON-LD `Person` | yes |
| Project (published) | `/projects`, `/projects/{slug}`, Home (featured) | yes |
| Project (draft/archived) | preview only / nowhere | no |
| Experience | `/experience`, About summary, CV | yes |
| Education | About, CV | yes |
| Certificate | `/certificates` | yes (the page); certificate files are `noindex` via header |
| Skill | `/skills`, project technology chips | yes |
| CV | `/cv` (HTML) + PDF | the page yes; PDF — owner decision (default: `noindex` PDF, HTML page indexable) |
| SiteSettings | global metadata, nav, feature flags | n/a |
| Media | wherever referenced | images yes; originals private |
