# Portfolio Content Matrix (Phases 14–15)

**Source of truth:**
- `src/cms/content/phase14-content.ts` — Phase 14 content;
- `src/cms/content/phase15-content.ts` — Phase 15 client projects and screenshots.

Both are applied by `pnpm cms:apply-content` (alias `cms:apply-phase14`). The script is idempotent and writes English only.

**Updated:** 2026-09-29 (Phase 15).

## Evidence states

| State | Meaning | Public treatment |
|---|---|---|
| **VERIFIED** | Owner-authored CMS text, the owner's own public GitHub repository (README / metadata), or the owner's project folders (Phase 15: requirements documents, proposals, code, phase reports). Any figure is attributed to its source ("as reported in the repository" / "as recorded in the project's reports"). | Normal case study. `isBasedOn` → `SoftwareSourceCode` in JSON-LD when a repository exists. |
| **CONCEPT** | A design study the owner approved as a labelled concept (Phase 14). | Badge on every row ("Concept system"); a disclosure banner on the page; "Conceptual system diagram · not a screenshot" caption; the Results section is titled "Design objective"; a separate evidence filter; `creativeWorkStatus: "Concept"`. No numbers, users, deployments, links or experience context. Never featured. |
| **EXPERIMENTAL** | Supported by the schema. No project uses it yet. | Shown as "Experimental". |
| **DRAFT** | Payload draft / translation status not approved. | Not public. `car-rental-mobile-application` and `e-commerce` are legacy drafts and remain unchanged. |
| **OWNER REVIEW** | Open factual questions. | See `docs/reports/PHASE_14_OWNER_REVIEW.md`. Nothing in that list is published as fact. |

Skills use two states:
- **verified**: evidenced by a verified project or certificate. Every skill records its evidence in the admin-only source note.
- **exploration**: appears only in concept systems. It is shown in a separate "Exploration" section and excluded from the stack, the CV, the home expertise section, the About counts and `knowsAbout`.

## Screenshots (Phase 15)

All 16 are genuine renders; none is a mock-up. Files are in `src/cms/content/media` (WebP, 1.4 MB in total). They are uploaded to the CMS media library and deduplicated by SHA-256, so re-running the script creates no duplicates. Each caption (alt text) states where the screenshot comes from.

| Project | What was captured | Why |
|---|---|---|
| Dr. Elias Dahdal clinic | The public sign-in page of the live system (1) | Everything behind the login is patient and staff data. It was never opened. |
| Zina Almokri website | The live public site: home, a chapter, reviews, method, phone (5) | The site is public. |
| NewLook, Touché Beauty | Each project's own front end and PHP API, run locally in temporary containers with the sample catalogue from its `database.sql` (4 + 5) | The production domains do not respond. Captions say "local run" and "sample catalogue". The placeholder product photos are not the client's stock. |

**Deliberately left out:**
- prices and deal terms;
- staff names and patient data;
- credentials. A screenshot in the Touché folder shows a database password; it was not used, and rotating that password is recommended.

## Projects (28 published)

| # | Project | Tier | State | Source | Schematic / imagery |
|---|---|---|---|---|---|
| 10 | AI Intelligence Project Management System | Flagship ★ | Verified | Owner CMS text (Phase 11/13) | pipeline |
| 20 | Tavola — Multi-Tenant Restaurant Reservation Platform | Flagship ★ | Verified | tavola-backend, tavola, tavola-dashboard, Tavola-owner-dashboard READMEs | tenancy |
| 25 | Dr. Elias Dahdal Clinic — Clinic Management System | Flagship ★ | Verified; in production; VegaCORE | requirements specification + code | login screenshot |
| 30 | Trading AI Assistance — Backend Architecture | Flagship ★ | Verified (architecture/foundation) | `senior` README | events |
| 40 | VegaCore Operating System (VOS) | Flagship ★ | Verified; linked to the VegaCORE CTO role | vegacore-system README (default credentials deliberately not published) | modules |
| 50 | Breast Tumor Diagnosis System | Flagship ★ | Verified (offline metrics on a public dataset, not clinical) | repository README | network |
| 60 | Robot Obstacles Avoidance System | Flagship ★ | Verified (research) | repository README; repository link added | kinematic |
| 70 | yazanalsamman.com — Cinematic Portfolio Platform | Strong (was flagship until Phase 15) | Verified | this repository and its phase reports | browser |
| 80 | Saree'e — Parts Delivery Dispatch Platform | Strong | Verified (Phase-1 foundation; Flutter app not built, stated) | sari3 README | events |
| 90 | Student Management Distributed System | Strong | Verified | repository README | modules |
| 100 | Project Hub Application | Strong | Verified | owner CMS + README | device |
| 110 | Tabkha & More — Interactive Digital Menu and CMS | Strong | Verified | tabkha-menu README | browser |
| 112 | NewLook — Branded Footwear E-Commerce Platform | Strong | Verified; VegaCORE | System Requirements Document + code | 5 local screenshots |
| 114 | Touché Beauty — Bilingual Beauty Store and Workshops | Strong | Verified; VegaCORE | VegaCORE proposal + code | 5 local screenshots |
| 116 | Zina Almokri — Personal Brand Website | Strong (was supporting) | Verified; live; VegaCORE | project docs, phase reports 0–17, repository | 5 live screenshots |
| 120 | Enterprise RAG Platform | Strong | **Concept** | owner-approved concept | pipeline |
| 130 | Multi-Agent Software Engineering System | Strong | **Concept** | owner-approved concept | agents |
| 140 | Vision Inspection Pipeline | Strong | **Concept** | owner-approved concept | vision |
| 150 | LLM Observability & Evaluation Platform | Strong | **Concept** | owner-approved concept | events |
| 170–250 | Car Renting, Services Provider, Fitness, Taxi Elite, SmartHome, System Management, Basic E-commerce, Basic University Mgmt, Basic Python Compiler | Supporting | Verified (legacy text) | owner CMS | by category |

★ = featured: the home page "Selected systems" and About/CV "Selected systems".

## Case-study sections

The order is Overview → Problem → Constraints → Approach → Architecture → Intelligence layer → Engineering decisions → Challenges → Results. For a concept, Results is shown as "Design objective".

A section appears only when it has text. Nothing was invented to fill one: NewLook and Touché, for example, have no Results section, because no live outcome could be verified.

## Skills (63: 59 verified, 4 exploration)

| Model layer | Categories | Examples |
|---|---|---|
| Intelligence | ai-ml | LLMs, neural networks, fuzzy logic, FAISS, expert systems, algorithm design, machine learning, ANFIS, model evaluation |
| Systems & architecture | architecture, backend | System design & ADRs, multi-tenant SaaS, microservices, queues, WebSockets, REST, NestJS, Flask, Spring, Payload, Node/Express/FastAPI, PHP, ASP.NET |
| Application engineering | frontend, mobile, programming | TypeScript, Dart, Python, Java, C++, React, Next.js, Astro, Tailwind, Three.js, interactive maps (Leaflet), Flutter |
| Data | databases | PostgreSQL, Prisma, Redis, MongoDB, MySQL, SQL |
| Infrastructure | devops-infrastructure | Docker, Nginx, BullMQ, object storage, CI/CD |
| Engineering discipline | security, practice | Authentication, RBAC, Cyber Security, testing, accessibility, performance, i18n/RTL, problem solving |
| Exploration (separate) | ai-ml | RAG, AI agents, computer vision, LLM evaluation & observability |

## Relationships

- Skill → project: the CMS `technologies` relation. It drives the skill evidence links, each project's stack grouped by layer, and the About systems map.
- Project → experience: these are linked to "Chief Technology Officer (CTO) · VegaCORE":
  - VegaCore OS;
  - the Dr. Elias Dahdal clinic system;
  - NewLook;
  - Touché Beauty;
  - the Zina website.
- Certificate → skill: exact name matches only (Phase 13).
