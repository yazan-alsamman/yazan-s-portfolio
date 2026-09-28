# Product Requirements

**Product:** Yazan Al Samman — personal technology portfolio + private content dashboard
**Owner identity:** see `docs/content/OWNER_PROFILE.md` (Yazan Al Samman · يزن السمان · Artificial Intelligence Engineer)
**Production domain:** `https://yazanalsamman.com` · **Hosting:** VPS
**Created:** Phase 0.1 (2026-09-27). This document was referenced by README but missing until now.

This document **consolidates** existing requirements. It introduces no new ones. Each requirement cites its source:

| Code | Source document |
|---|---|
| RD | `README.md` |
| PC | `docs/PROJECT_CHARTER.md` |
| DS | `docs/DASHBOARD_SPEC.md` |
| LC | `docs/LANDING_CINEMATIC_SPEC.md` |
| SM | `docs/SEO_MASTER_REQUIREMENTS.md` (§ = section) |
| SC | `docs/SEO_CONTENT_STRATEGY.md` |
| SG | `docs/SEO_PHASE_GATE.md` |
| PA | `docs/PERFORMANCE_ACCESSIBILITY.md` |
| IL | `docs/I18N_AND_LOCALIZATION.md` |

Priority definitions:
- **Must Have** — required for the initial production launch.
- **Should Have** — important; may be delivered in a later phase or iteration without blocking launch.
- **Future / Optional** — not required for initial production; build only when the stated condition is met.

Where the source documents allow a choice, the resolved decision from `docs/architecture/ARCHITECTURE_DECISIONS.md` is noted.

---

## 1. Content integrity (cross-cutting)

### Must Have
| ID | Requirement | Source |
|---|---|---|
| CI-1 | No fabricated biography, education, employment, certificates, project metrics, clients, awards or technology claims | RD #9, PC §2, SM §2 |
| CI-2 | Every public factual claim has one identifiable source of truth; no duplicated hard-coded facts | RD DoD, SC §11 |
| CI-3 | Unverifiable information is marked missing and requested from the owner, never invented | RD #9, SM §2 |
| CI-4 | No fake proficiency percentages, fake metrics or invented client logos | PC §2 |
| CI-5 | Consistent entity identity: "Yazan Al Samman" everywhere (site, metadata, structured data, CV, author) | SC §8–9, SM §21 |
| CI-6 | The legacy site is used as a content source only; its design is not reused | RD, CONTENT_MIGRATION |

---

## 2. Public site

### Must Have
| ID | Requirement | Source |
|---|---|---|
| PS-1 | Public routes: Home (cinematic landing), About, Projects, Project detail, Experience, Skills, Certificates, CV, Contact | PC §4, SM §4 |
| PS-2 | A first-time visitor quickly understands: who Yazan Al Samman is, that he is an AI-oriented engineer, that he builds real projects, that the site is crafted, and that there is substantial evidence beyond the hero | PC §6 |
| PS-3 | Premium, restrained, editorial and futuristic visual language — not a generic developer portfolio. Avoid the listed clichés (terminal animations, code rain, stock robots, neon overload) | RD #7, PC §2, §5 |
| PS-4 | Project pages support case-study content (context, problem, approach/architecture, technologies, role, timeline, results, media, links, related projects). A section is shown only when verified content exists | SM §13, SC §4 |
| PS-5 | Responsive: narrow phones, touch, mobile browsers, low-memory devices | RD #8, PA |
| PS-6 | Useful 404 and 500 pages with navigation back to Home, Projects, About and Contact | SM §34 |
| PS-7 | Stable, readable, lowercase, hyphenated project URLs; slugs are stable once published, and changes redirect | SM §12 |

### Should Have
| ID | Requirement | Source |
|---|---|---|
| PS-8 | Breadcrumbs on deeper pages (e.g. project detail) | SM §16 |
| PS-9 | Related-project links on project pages | SM §15, SC §7 |

### Future / Optional
| ID | Requirement | Condition | Source |
|---|---|---|---|
| PS-10 | `/lab`, `/experiments`, `/insights` or `/articles` section | Only if the owner has genuine material to publish | PC §4, SC §5, §10 |
| PS-11 | Topic clusters (AI / Software Engineering / Robotics) | Only when enough verified content exists | SC §6 |

---

## 3. Cinematic 3D landing

### Must Have
| ID | Requirement | Source |
|---|---|---|
| LC-1 | A cinematic, scroll-driven 3D experience on the landing page, conveying human → computation → AI → robotics → systems → identity → portfolio | RD #3, LC |
| LC-2 | The supplied portrait is integrated professionally (not pasted flat); no fake 3D face without approval; no distortion | RD #4, LC "Portrait Integration" |
| LC-3 | Deterministic scroll → timeline mapping with smoothing; touch, keyboard and page navigation supported | LC "Scroll Architecture" |
| LC-4 | Performance tiers: High, Medium, Low/mobile fallback, Reduced motion | LC "Performance" |
| LC-5 | Reduced motion: no mandatory camera travel; all information still accessible | LC, PA |
| LC-6 | No layout instability, no console errors, no GPU/resource leaks, no blocking of primary navigation | LC acceptance |
| LC-7 | The scene transitions naturally into portfolio content | LC §7, acceptance |
| LC-8 | Important identity text lives in HTML, outside the canvas; the site works without WebGL or JavaScript | SM §5, §28, §31, SG Phase 3 |
| LC-9 | Users can skip/jump past the cinematic sequence | DESIGN_SYSTEM "Scroll" |
| LC-10 | Every dependency has a documented purpose | LC "Technical Guidance" |

Resolved (ADR-007): Three.js + React Three Fiber; the scene loads after text content; phones/Low tier and reduced-motion users do not download the full 3D scene.

---

## 4. Admin dashboard / CMS

### Must Have
| ID | Requirement | Source |
|---|---|---|
| DB-1 | Private, authenticated dashboard to maintain content without editing code | RD #5, DS |
| DB-2 | Secure auth: password/session handling, rate limiting, CSRF where applicable, secure cookies, logout/revocation, no credentials in source | DS "Authentication", SECURITY |
| DB-3 | CRUD: Projects (all DS fields incl. EN/AR, problem, solution, architecture, media, featured, status, order), Experience, Education, Certificates, Skills (categorized), CV | DS |
| DB-4 | Media library: upload, preview, metadata, alt text EN/AR, usage tracking, delete/archive, optimization status | DS |
| DB-5 | Site settings: profile identity, SEO defaults, social links, contact, locale settings, featured content | DS |
| DB-6 | Explicit publishing states. Resolved: `DRAFT → PUBLISHED → ARCHIVED` (single admin, ADR-005) | DS "Publishing Model" |
| DB-7 | Delete requires confirmation; soft-delete/archive preferred; public-content changes are auditable | DS "Safety" |
| DB-8 | Fast, clean, keyboard-accessible, desktop-first but responsive; does not visually compete with the public site | DS "Dashboard UX" |
| DB-9 | Dashboard changes appear safely on the public site | RD DoD |
| DB-10 | SEO fields (localized title/description), slug strategy, and alt text in the CMS; drafts can never become indexable | SG Phase 2, Phase 5 |

### Should Have
| ID | Requirement | Source |
|---|---|---|
| DB-11 | Overview: content counts, published/draft counts, recent changes, media summary, system status | DS "Overview" |

### Future / Optional
| ID | Requirement | Condition | Source |
|---|---|---|---|
| DB-12 | `REVIEW` publishing state | Only if more than one editor | DS |
| DB-13 | Landing scene configuration in settings | "Where safely configurable" | DS "Site Settings" |

---

## 5. Internationalization

### Must Have
| ID | Requirement | Source |
|---|---|---|
| IL-1 | English (`en`) and Arabic (`ar`), both first-class | RD #1, IL |
| IL-2 | RTL applied at the document level (`dir="rtl"` for Arabic) | RD #2, IL |
| IL-3 | One consistent URL strategy. Resolved: English at `/`, Arabic at `/ar/...` (ADR-006) | IL "URL Strategy" |
| IL-4 | Centralized UI strings in namespaces; no Arabic hard-coded in components | IL |
| IL-5 | Explicit EN/AR content fields; no blind translation of proper names, technology names or certificate titles | IL, CONTENT_MODEL |
| IL-6 | No unreviewed machine-translated Arabic for important professional copy | IL, SM §20 |
| IL-7 | Arabic typography verified: shaping, line height, punctuation, numerals, mixed Arabic/Latin, URLs, code, dates | IL |

---

## 6. SEO

### Must Have
| ID | Requirement | Source |
|---|---|---|
| SE-1 | Production domain `https://yazanalsamman.com`, configured via env (`SITE_URL`), never hard-coded | SM §3 |
| SE-2 | Public pages indexable; admin, auth, preview, drafts and dev routes not indexable; no global `noindex` shortcut | SM §4 |
| SE-3 | Meaningful server-rendered HTML; the 3D scene is progressive enhancement only | SM §5, §28, §31 |
| SE-4 | Semantic HTML; one descriptive H1 per page; logical heading hierarchy | SM §6–7 |
| SE-5 | Unique title, unique human-written meta description, canonical and Open Graph on every indexable page | SM §8–11 |
| SE-6 | Canonical URLs: HTTPS, production domain, self-referencing per locale, no query duplication | SM §11, §33 |
| SE-7 | Every published project is independently indexable with crawlable content | SM §13 |
| SE-8 | Deliberate internal linking; no orphan pages | SM §15, SC §7 |
| SE-9 | XML sitemap: canonical, indexable, public URLs only, updated on publish | SM §17 |
| SE-10 | Correct `robots.txt` (allow public, disallow admin/login/API as appropriate, do not block required assets) | SM §18 |
| SE-11 | International SEO: `lang`, `dir`, localized metadata, hreflang, x-default where appropriate | SM §19–20 |
| SE-12 | Structured data: `Person` and `WebSite`, with verified properties only; project schema where accurate; no misleading certificate schema | SM §21–25 |
| SE-13 | Meaningful alt text, responsive/optimized images, priority-loaded hero image | SM §26–27 |
| SE-14 | Open Graph + Twitter/X metadata and a default social image | SM §35, SEO_AND_DISCOVERABILITY |
| SE-15 | 404 not indexed | SM §34 |
| SE-16 | Repeatable SEO checks (SM §38 list) | SM §38 |
| SE-17 | Every phase report includes the SEO Audit section; the full launch checklist runs before deployment | SG, SEO_CHECKLIST |
| SE-18 | Never claim indexing or healthy Core Web Vitals without external/measured evidence | SM §30, §36 |

### Should Have
| ID | Requirement | Source |
|---|---|---|
| SE-19 | Project-specific share images | SM §35 |
| SE-20 | Search Console readiness documentation | SM §36 |
| SE-21 | `BreadcrumbList` structured data | SM §16 |

---

## 7. Performance

### Must Have
| ID | Requirement | Source |
|---|---|---|
| PF-1 | No avoidable layout shift; fast first meaningful content; optimized hero | PA "Budgets" |
| PF-2 | 3D assets loaded progressively; no large unnecessary JS bundles | PA, SM §29 |
| PF-3 | No persistent CPU/GPU load when the scene is not visible | PA |
| PF-4 | Mobile devices never forced to render the full desktop scene | PA "Mobile" |
| PF-5 | Measured LCP, CLS, INP, TTFB on desktop and mobile; budgets established from measurement | PA, SM §29–30 |

---

## 8. Accessibility

### Must Have
| ID | Requirement | Source |
|---|---|---|
| AC-1 | Keyboard navigation, visible focus, semantic headings, accessible names, sufficient contrast, alt text | PA "Accessibility" |
| AC-2 | `prefers-reduced-motion` respected; content and navigation fully preserved | PA "Reduced Motion" |
| AC-3 | Screen-reader-compatible navigation; no information available only through animation | PA |
| AC-4 | Touch targets ≥ 44 px; no horizontal overflow on mobile | DESIGN_SYSTEM |

---

## 9. Security & operations (summary)

The full detail lives in `docs/SECURITY.md`; it is listed here for completeness.

### Must Have
| ID | Requirement | Source |
|---|---|---|
| SO-1 | Safe uploads (type/signature/size validation, non-executable), sanitized rendering, audit logging | SECURITY |
| SO-2 | Secrets never committed; `.env.example` provided | SECURITY, TECHNICAL_ARCHITECTURE |
| SO-3 | Security headers evaluated against the real 3D/media architecture | SECURITY |
| SO-4 | Documented database + media backup, restore procedure and retention | SECURITY |
| SO-5 | Production deployment documented (VPS): build, env, DNS, TLS, reverse proxy, database, media storage, backups, rollback | prompts/10, owner decision |

### Future / Optional
| ID | Requirement | Condition | Source |
|---|---|---|---|
| SO-6 | Analytics | Only with a documented purpose, provider, data and privacy implications | TECHNICAL_ARCHITECTURE, SM §37 |

---

## 10. Definition of Done (from README)

Content verified · both languages correct · cinematic scene performs acceptably · portrait integration intentional · dashboard changes appear safely on the public site · SEO metadata and structured data valid · accessibility tested · security checks pass · production build succeeds · deployment documented · known limitations recorded.
