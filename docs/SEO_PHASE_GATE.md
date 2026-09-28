# SEO PHASE GATE

## Mandatory SEO Verification for Every Claude Code Phase

This document is mandatory.

Claude Code must review this file before completing every implementation phase.

SEO is a cross-phase requirement.

---

# Phase Completion Rule

A phase MUST NOT be reported as COMPLETE until the agent has evaluated the SEO impact of its work.

This does not mean every phase must implement every SEO feature.

It means every phase must verify that its changes do not damage the SEO architecture.

---

# Phase 0 — Discovery

Verify:

* [ ] current repository SEO architecture
* [ ] current routes
* [ ] current rendering strategy
* [ ] legacy content inventory
* [ ] domain strategy
* [ ] localization strategy
* [ ] sitemap strategy
* [ ] structured-data strategy
* [ ] performance risks

Report:

`SEO Architecture Baseline`

---

# Phase 1 — Design System

Verify:

* [ ] semantic typography
* [ ] heading hierarchy
* [ ] accessible navigation
* [ ] readable content
* [ ] Arabic direction
* [ ] responsive content structure

Do not sacrifice semantic HTML for visual styling.

---

# Phase 2 — CMS

Verify:

* [ ] SEO fields exist where required
* [ ] slug strategy
* [ ] canonical strategy
* [ ] publication state
* [ ] localized metadata
* [ ] image alt text
* [ ] draft pages cannot accidentally become indexable

---

# Phase 3 — Cinematic Landing

Verify:

* [ ] important text exists outside canvas
* [ ] H1 exists in HTML
* [ ] identity is crawlable
* [ ] navigation is crawlable
* [ ] 3D does not block content
* [ ] fallback exists
* [ ] performance is measured
* [ ] mobile fallback exists

---

# Phase 4 — Public Pages

For every public route verify:

* [ ] title
* [ ] description
* [ ] canonical
* [ ] H1
* [ ] semantic HTML
* [ ] internal links
* [ ] image alt
* [ ] indexability
* [ ] localized metadata

---

# Phase 5 — Dashboard

Verify:

* [ ] admin is not indexable
* [ ] authentication pages are not indexable where appropriate
* [ ] draft content cannot leak into public sitemap
* [ ] preview routes cannot accidentally become canonical
* [ ] CMS metadata fields work

---

# Phase 6 — Media

Verify:

* [ ] alt text
* [ ] responsive images
* [ ] optimized formats
* [ ] image dimensions
* [ ] filenames where relevant
* [ ] no accidental indexing of private assets

---

# Phase 7 — International SEO

Verify:

* [ ] English
* [ ] Arabic
* [ ] `lang`
* [ ] `dir`
* [ ] canonical
* [ ] hreflang
* [ ] localized title
* [ ] localized description
* [ ] localized OG metadata
* [ ] sitemap locale strategy

---

# Phase 8 — Performance

Verify:

* [ ] Core Web Vitals
* [ ] 3D loading
* [ ] image loading
* [ ] JavaScript cost
* [ ] mobile performance
* [ ] layout stability

SEO and performance must be treated as connected.

---

# Phase 9 — Security

Verify:

* [ ] no private routes exposed to crawlers
* [ ] no secrets in public HTML
* [ ] safe uploads
* [ ] correct robots behavior
* [ ] correct HTTP headers
* [ ] no sensitive information exposed in metadata

---

# Phase 10 — Final SEO Gate

All of the following must be verified:

* [ ] domain
* [ ] HTTPS
* [ ] canonical
* [ ] sitemap
* [ ] robots
* [ ] metadata
* [ ] H1
* [ ] structured data
* [ ] Open Graph
* [ ] Arabic SEO
* [ ] English SEO
* [ ] hreflang
* [ ] internal linking
* [ ] image SEO
* [ ] 404
* [ ] performance
* [ ] mobile
* [ ] 3D fallback
* [ ] reduced motion

---

# Required Report Section

Every phase report must contain:

```text
## SEO Audit

### Indexability
PASS / FAIL / PARTIAL

### Metadata
PASS / FAIL / PARTIAL

### Canonicals
PASS / FAIL / PARTIAL

### Internal Linking
PASS / FAIL / PARTIAL

### Structured Data
PASS / FAIL / PARTIAL / NOT APPLICABLE

### International SEO
PASS / FAIL / PARTIAL / NOT APPLICABLE

### Performance
PASS / FAIL / PARTIAL / NOT APPLICABLE

### Accessibility
PASS / FAIL / PARTIAL

### SEO Issues
[List]

### SEO Risks
[List]

### Required Follow-up
[List]
```

A phase with an unresolved SEO blocker must be marked:

`BLOCKED`

rather than falsely marked complete.
