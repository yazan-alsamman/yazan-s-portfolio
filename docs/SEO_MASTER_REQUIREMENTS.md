# SEO MASTER REQUIREMENTS

## Yazan Al Samman — Personal AI Engineer Portfolio

## 1. SEO Is a First-Class Product Requirement

SEO is not a final polishing step.

Search engine discoverability, technical SEO, semantic structure, structured data, international SEO, page performance, content architecture and entity recognition must be considered throughout the entire project.

Claude Code MUST treat SEO as a cross-cutting architectural requirement.

A phase MUST NOT be considered complete if its implementation introduces avoidable SEO problems.

---

# 2. Primary SEO Objective

The website must establish a strong, technically correct and authoritative search presence for:

* Yazan Al Samman (canonical — see `docs/content/OWNER_PROFILE.md`)
* يزن السمان (canonical Arabic)
* Yazan Al Samman AI
* Yazan Al Samman Artificial Intelligence Engineer
* Yazan Al Samman AI Engineer
* Yazan Al Samman Software Engineer / Information Technology — only where supported by verified content
* Yazan Al Samman projects
* Yazan Al Samman portfolio
* Yazan Alsamman / Yazan Al-Samman — search variants only (the domain is `yazanalsamman.com`); at most a `Person.alternateName`, with owner approval, never the primary identity

Additional keywords must only be introduced when supported by verified content.

DO NOT keyword-stuff.

DO NOT create pages solely to target keywords.

DO NOT fabricate expertise, employers, clients, awards, publications, certifications or achievements.

---

# 3. Primary Domain

Production domain:

https://yazanalsamman.com

All SEO architecture must be designed around this canonical domain.

The legacy website `https://yazan-alsamman.github.io` is a content source only. It must never be used as a canonical URL, `og:url`, sitemap host or structured-data `url`. Whether it later redirects to the production domain is a separate owner decision.

The production domain must be configurable through environment variables.

Example:

`SITE_URL=https://yazanalsamman.com`

Never hardcode production URLs throughout the application.

---

# 4. Search Engine Indexability

The production public website must be indexable unless a specific page is intentionally private.

The following must NOT accidentally contain `noindex` in production:

* Homepage
* About
* Projects
* Project detail pages
* Experience
* Skills
* Certificates
* CV
* Contact

The following may legitimately be non-indexable:

* Admin dashboard
* Authentication pages
* Internal preview pages
* Draft content
* Development-only routes
* Private system routes

Implement this deliberately.

Never use a global `noindex` as a temporary shortcut in production.

---

# 5. Rendering Strategy

Search engines must receive meaningful HTML content.

Do not depend on WebGL, JavaScript animation or client-side rendering to communicate essential information.

The cinematic 3D landing experience is a visual enhancement.

The following must remain accessible to crawlers without requiring successful WebGL execution:

* Yazan's identity
* professional title
* core introduction
* primary navigation
* key calls to action
* important portfolio content

The site must remain semantically meaningful if:

* WebGL is unavailable,
* JavaScript is delayed,
* 3D assets fail,
* reduced motion is enabled,
* the device uses a low-power mode.

---

# 6. Semantic HTML

Use semantic HTML wherever appropriate:

* `<header>`
* `<nav>`
* `<main>`
* `<section>`
* `<article>`
* `<aside>`
* `<footer>`
* `<h1>` through `<h6>`
* `<figure>`
* `<figcaption>`
* `<button>`
* `<a>`

Do not use `<div>` for everything.

Every page must have a clear heading hierarchy.

---

# 7. H1 Requirements

Every indexable page must have one clear primary `<h1>`.

The H1 must describe the page.

Example concept for homepage:

"Yazan Al Samman — Artificial Intelligence Engineer"

Do not duplicate the exact same H1 blindly across every page.

Project pages should use the project title as the primary heading.

---

# 8. Metadata

Every indexable page must have:

* unique `<title>`
* unique meta description
* canonical URL
* Open Graph metadata
* appropriate social preview metadata

Do not use generic titles such as:

* Home
* Portfolio
* Website
* Yazan Website

unless accompanied by meaningful identity/context.

---

# 9. Title Strategy

Titles should prioritize:

1. Page/topic
2. Yazan Al Samman
3. relevant professional context where appropriate

Examples:

Homepage:

`Yazan Al Samman — Artificial Intelligence Engineer`

Project:

`[Project Name] — Yazan Al Samman`

Certificates:

`Certificates — Yazan Al Samman`

Do not mechanically append the brand to every title if it makes the result repetitive or excessively long.

---

# 10. Meta Description

Each important page requires a human-written meta description.

Descriptions must:

* accurately describe the page
* contain meaningful terminology naturally
* encourage qualified clicks
* avoid keyword stuffing
* avoid unsupported claims

Do not generate generic descriptions such as:

"Welcome to my website where you can learn more about me."

---

# 11. Canonical URLs

Every indexable page must have a canonical URL.

Canonical URLs must:

* use HTTPS
* use the production domain
* represent the preferred localized URL
* avoid accidental query-string duplication
* remain stable

Example:

`https://yazanalsamman.com/projects/example-project`

Do not canonicalize every localized page to the English homepage.

---

# 12. URL Architecture

URLs must be:

* readable
* stable
* descriptive
* lowercase
* hyphen-separated
* free from unnecessary IDs

Good:

`/projects/intelligent-vision-system`

Bad:

`/project?id=3928`

Project slugs must be stable once published.

If a published slug changes:

* implement a redirect strategy,
* update internal links,
* update canonical URLs,
* update sitemap references.

---

# 13. Project SEO

Every published project should be capable of being independently indexed.

A project page should contain meaningful crawlable content including, where available:

* project title
* summary
* problem
* approach
* solution
* architecture
* technologies
* Yazan's role
* timeline
* results
* media
* links
* related projects

Only display fields that contain verified information.

Do not generate artificial project descriptions solely for SEO.

---

# 14. Content Depth

Important pages must provide genuine informational value.

The goal is not to maximize word count.

Prefer:

* clear explanations
* technical case studies
* architecture descriptions
* implementation decisions
* lessons learned
* real project context
* verified outcomes

Avoid:

* repetitive keyword paragraphs
* meaningless AI-generated filler
* duplicated content
* excessive headings without substance

---

# 15. Internal Linking

Build a deliberate internal-linking structure.

Examples:

Homepage → Projects

Homepage → About

Homepage → Experience

Homepage → Certificates

Project → Related Projects

Project → Technologies/Skills

Project → Contact

About → Projects

Experience → Projects

Certificates → relevant expertise where appropriate

Important pages should not become orphan pages.

---

# 16. Breadcrumbs

Where useful, implement breadcrumbs for deeper pages.

Example:

Home
→ Projects
→ Project Name

Breadcrumbs should be semantic and may use BreadcrumbList structured data when appropriate.

---

# 17. XML Sitemap

Generate a production sitemap.

It should contain only:

* canonical
* indexable
* public URLs

Do not include:

* admin routes
* login routes
* drafts
* duplicate locale URLs
* redirects
* 404 pages
* private pages

The sitemap must update when published content changes.

---

# 18. Robots.txt

Create a correct production `robots.txt`.

Allow public content.

Disallow private administrative areas.

Example concept:

Allow:
`/`

Disallow:
`/admin`
`/login`
`/api` where appropriate

Do not blindly block JavaScript, CSS or required assets.

The final implementation must be validated against the actual application architecture.

---

# 19. International SEO

The website supports:

* English
* Arabic

URL scheme (resolved in ADR-006):

* English at `/` (e.g. `https://yazanalsamman.com/projects/example-project`)
* Arabic at `/ar/...` (e.g. `https://yazanalsamman.com/ar/projects/example-project`)
* each locale page canonical to itself; `hreflang="en"`, `hreflang="ar"` and `x-default` → English
* an Arabic URL exists only when that page's Arabic content is complete

International SEO must be implemented deliberately.

Use:

* correct `lang`
* correct `dir`
* localized metadata
* localized URLs
* canonical URLs
* `hreflang` where appropriate
* `x-default` where appropriate

Do not treat Arabic as an afterthought.

---

# 20. Arabic SEO

Arabic pages must have:

* natural Arabic titles
* natural Arabic descriptions
* correct Arabic headings
* correct RTL structure
* correct Arabic typography
* localized Open Graph content where appropriate

Do not create Arabic pages by simply machine-translating English metadata without review.

Technology names and proper names should remain accurate.

---

# 21. Person / Entity SEO

The website should clearly establish the identity of:

**Yazan Al Samman**

Use consistent identity information across:

* homepage
* About
* metadata
* structured data
* social links
* author information
* CV
* project pages

Avoid conflicting variations of the name.

Where legitimate and verified, connect official professional/social profiles through structured data.

Never claim ownership of an external profile without verification.

---

# 22. Person Structured Data

Evaluate implementing `Person` structured data for Yazan.

Potential properties may include:

* name
* alternateName
* url
* image
* jobTitle
* description
* sameAs

Only include properties supported by verified information.

Do not invent:

* employer
* location
* education
* awards
* credentials
* affiliations

---

# 23. Website Structured Data

Evaluate:

`WebSite`

Include appropriate:

* name
* url
* description

Do not add unsupported search-action structures.

---

# 24. Project Structured Data

Evaluate appropriate structured data for individual project pages.

Potential schemas may include:

* CreativeWork
* SoftwareSourceCode
* Article

Select the schema that accurately represents the actual page.

Do not mark a page as software source code simply because it discusses software.

---

# 25. Certificate Structured Data

Do not create misleading structured data for certificates.

Certificates may be represented as normal content unless an appropriate, supported schema can accurately describe them.

Never imply official verification simply because a credential ID exists.

---

# 26. Image SEO

Every meaningful image must have appropriate alt text.

Decorative images should use appropriate empty alt behavior.

Alt text must describe the image's function/content.

Do not stuff keywords into alt text.

Example:

Bad:

`Yazan Al Samman AI engineer artificial intelligence software engineer portfolio`

Better:

`Portrait of Yazan Al Samman`

For project media:

`Computer vision system developed by Yazan Al Samman`

Only use such descriptions when factually accurate.

---

# 27. Image Technical SEO

Use:

* responsive images
* modern formats where appropriate
* appropriate dimensions
* compression
* lazy loading for non-critical images
* priority loading for critical hero imagery

Do not lazy-load the primary above-the-fold image if that harms loading performance.

---

# 28. 3D SEO Rule

The cinematic 3D scene is NOT the SEO content.

Important text must exist in normal HTML.

Do not put important identity information only inside:

* canvas
* WebGL
* shaders
* textures
* 3D text
* animation frames

The search engine must be able to understand the website without understanding the 3D scene.

---

# 29. Performance SEO

Performance is part of SEO.

Monitor:

* LCP
* CLS
* INP
* TTFB
* JavaScript execution
* image weight
* 3D asset loading
* total page weight

The landing page must not become an enormous JavaScript application merely to produce a cinematic effect.

---

# 30. Core Web Vitals

The agent must measure actual performance.

Do not claim Core Web Vitals are healthy without measurements.

Test at minimum:

* desktop
* mobile

Prefer both:

* local production build
* deployed production environment

Document the results.

---

# 31. JavaScript Failure

Important content must remain available if JavaScript fails or is delayed.

The site should progressively enhance the cinematic experience.

Base:

HTML + CSS + accessible navigation + content

Enhancement:

JavaScript + motion + 3D

---

# 32. Crawlability

Verify:

* internal links are crawlable
* important pages are not hidden behind interaction-only controls
* navigation is accessible
* project pages are discoverable
* pagination/load-more behavior does not hide the entire project archive from crawlers

If content requires client-side interaction to reveal it, evaluate whether an HTML crawlable alternative is necessary.

---

# 33. Duplicate Content

Avoid duplication caused by:

* query parameters
* locale routing
* trailing slash inconsistencies
* alternate paths
* preview routes
* pagination
* tag/filter URLs

Define canonical behavior explicitly.

---

# 34. Error Pages

Create useful:

* 404
* 500

The 404 page must not be indexed.

It should provide useful navigation back to:

* Home
* Projects
* About
* Contact

---

# 35. Social SEO

Implement:

* Open Graph
* appropriate Twitter/X metadata
* default social image
* localized social metadata where appropriate

Project pages should be capable of generating project-specific share previews.

---

# 36. Search Console Readiness

The production project must be ready for Google Search Console.

Document:

* domain verification approach
* sitemap URL
* canonical domain
* internationalization strategy
* indexing expectations

Do not claim that the site is indexed until verified externally.

---

# 37. Analytics

Analytics must never replace SEO measurement.

If analytics are introduced, document:

* purpose
* provider
* events
* privacy implications

Do not add unnecessary tracking.

---

# 38. SEO Testing

Create automated or repeatable checks for:

* missing title
* duplicate title
* missing description
* duplicate description
* missing canonical
* invalid canonical
* missing H1
* multiple H1 where not justified
* broken internal links
* missing alt text
* invalid hreflang
* sitemap errors
* robots errors
* noindex on public pages
* invalid structured data

---

# 39. SEO Quality Gate

A phase cannot be marked COMPLETE if it introduces a known SEO regression without explicit documentation.

Each relevant phase report must contain:

### SEO Status

* Indexability:
* Metadata:
* Canonicals:
* Internal linking:
* Structured data:
* International SEO:
* Performance:
* Accessibility:
* Known SEO issues:

---

# 40. Final SEO Acceptance

Before launch, verify:

* [ ] production domain is correct
* [ ] HTTPS works
* [ ] canonical URLs work
* [ ] sitemap works
* [ ] robots.txt works
* [ ] public pages are indexable
* [ ] private pages are protected from indexing
* [ ] English SEO works
* [ ] Arabic SEO works
* [ ] hreflang is valid where implemented
* [ ] Person structured data is valid if implemented
* [ ] Website structured data is valid
* [ ] project structured data is valid where appropriate
* [ ] Open Graph works
* [ ] titles are unique
* [ ] descriptions are unique
* [ ] H1 structure is correct
* [ ] internal linking is complete
* [ ] important images have alt text
* [ ] 404 is correct
* [ ] no accidental duplicate URLs exist
* [ ] performance has been measured
* [ ] mobile has been tested
* [ ] 3D fallback works
* [ ] reduced motion works

SEO is considered production-ready only after these checks are completed and documented.
