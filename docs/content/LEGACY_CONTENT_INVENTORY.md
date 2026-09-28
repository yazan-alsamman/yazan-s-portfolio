# Legacy Content Inventory

**Captured:** 2026-09-27 (Phase 0) · **Reconciled:** 2026-09-27 (Phase 0.1, after owner confirmation)
**Legacy source:** `https://yazan-alsamman.github.io` — **owner-confirmed** as Yazan Al Samman's personal website.
**Canonical identity:** `docs/content/OWNER_PROFILE.md` (overrides anything below).

> **Migration status (2026-09-28):** the owner designated the legacy site as the authoritative source for his existing portfolio content, and the content has been migrated into the CMS. See `docs/reports/REAL_CONTENT_MIGRATION_REPORT.md` for what was migrated, normalised, excluded (with reasons) and left for owner review. The re-crawl on 2026-09-28 found the same 21 pages and content recorded below. Categories B and C below remain the rules the migration applied.

The legacy site is a **content source only**. Nothing here authorizes reuse of its design, layout, typography, colors, animations, visual identity or component structure.

"The site is the owner's" ≠ "every statement on it is correct". Items are therefore sorted into three categories:

| Category | Meaning | May become CMS source content? |
|---|---|---|
| **A. VERIFIED / OWNER-CONFIRMED** | Explicitly confirmed by the owner | Yes |
| **B. LEGACY — REQUIRES CLEANUP** | Appears to describe the owner, but is inconsistent, unsupported, badly worded or unconfirmed. Includes **INVALID / PLACEHOLDER — DO NOT PUBLISH** items | Only after the owner corrects/confirms each item |
| **C. DO NOT REPUBLISH** | Personal data the owner has not requested | No |

---

## 1. Source Resolution (historical record)

| URL | Result (2026-09-27) |
|---|---|
| `https://yazan-alsaman.github.io` — **historical typo** in the original spec (one "m") | HTTP 404 "Site not found · GitHub Pages". GitHub user `yazan-alsaman` does not exist. No Wayback snapshot. **Corrected across the spec in Phase 0.1.** |
| `https://yazan-alsamman.github.io` | HTTP 200. 5 main pages + 16 project pages. **Owner-confirmed.** Source repo: `github.com/yazan-alsamman/yazan-alsamman.github.io`. |
| GitHub user `yazan-alsamman` | Exists. Display name "Yazan-Alsamman", `blog` → the legacy site, bio "Informatics Technology Engineer \| …", company "Code Machine", location "Syria", 35 public repos. It is linked from the owner-confirmed site as the home of his projects. **Using it as `sameAs` still requires owner confirmation** (OWNER_PROFILE pending list). |
| `https://yazanalsamman.com` | Hostinger parked page (`noindex`). The new production domain. |

Method: `curl` to the session scratchpad (outside the repo), then text extraction with markup/scripts stripped. No legacy CSS, markup or images were copied. The legacy portrait (`assets/img/yazan.jpg`) was never downloaded; the official portrait is `portrait.jpg` in the project root.

Legacy page map: `index.html` (home/about/skills/counters), `resume.html`, `services.html` (titled "certificates"), `portfolio.html`, 16 × `portfolio-details_*.html`, `contact.html` (non-functional PHP form).

---

## 2. Category A — VERIFIED / OWNER-CONFIRMED

| Field | Value | Legacy source | New field | Notes |
|---|---|---|---|---|
| Name (EN) | Yazan Al Samman | legacy uses "Yazan AL Samman" / "Yazan Al Samman" | `Profile.name_en` | Owner-confirmed spelling. It matches the legacy "Yazan Al Samman" except for capitalization. |
| Name (AR) | يزن السمان | — (not on legacy site) | `Profile.name_ar` | Owner-confirmed. |
| Professional title | Artificial Intelligence Engineer | — (legacy says "Mobile Applications & Full Stack Developer", "IT Engineer", "Programmer") | `Profile.title_en` | Owner-confirmed. It supersedes all legacy titles. |
| Legacy website ownership | `https://yazan-alsamman.github.io` | — | `SiteSettings` (not published as a link by default) | Owner-confirmed. |
| Production domain | `https://yazanalsamman.com` | — | `SITE_URL` | Owner-confirmed. |
| Official portrait | `portrait.jpg` | — (legacy `yazan.jpg` not used) | `Profile.portrait` | Owner-confirmed asset. Audit in the Phase 0.1 report. |

**No other legacy fact is owner-confirmed yet.**

---

## 3. Category B — LEGACY BUT REQUIRES CLEANUP

### 3.1 Identity & wording

| Field | Legacy value | Legacy source | New field | Problem | Required action |
|---|---|---|---|---|---|
| Name spellings | "Yazan AL Samman", "Yazan Al Samman", "Yazan-Alsamman" (GitHub) | titles, resume, GitHub | — | Inconsistent | **Resolved:** use "Yazan Al Samman" only. Variants are recorded here for migration only. |
| Titles | "Mobile Applications & Full Stack Developer.", "IT Engineer", "Skilled IT Engineer", "Programmer", "Informatics Technology Engineer" (GitHub) | index, contact, footer, resume, GitHub | — | Conflict with the confirmed title | **Resolved:** superseded by "Artificial Intelligence Engineer". Do not publish the legacy titles. |
| Summary: "Programmer with 3+ years of experience" | as quoted | resume | — | Unverified years-of-experience claim | Owner supplies a new bio. Do not migrate. |
| About paragraphs ("Dedicated and detail-oriented developer…", "Let's build the future together!") | as quoted | index, footer | `Profile.bio_*` | Generic template marketing copy | Owner writes a new bio (EN + AR). |
| "Freelance: Available" | as quoted | index | `SiteSettings.availability` | Current status unknown | Owner confirms, or omit. |

### 3.2 Contact & social

| Field | Legacy value | Legacy source | New field | Problem | Required action |
|---|---|---|---|---|---|
| Email | `yazanalsaamman@gmail.com` | index | `Profile.contactLinks` | **Two different emails** on the legacy site | Owner chooses the public email (OWNER_PROFILE pending). Neither is published until then. |
| Email | `yalsammangpt@gmail.com` | contact, resume | `Profile.contactLinks` | Same as above | Same as above |
| LinkedIn | follow-intent URL containing `yazan-alsamman-7541a4349` | all footers | `Profile.socialLinks.linkedin` | Not a canonical profile URL; unverified | Owner supplies the canonical `linkedin.com/in/…` URL. |
| GitHub | `github.com/yazan-alsamman` | project links | `Profile.socialLinks.github` | Linked from the confirmed site; `sameAs` not yet confirmed | Owner confirms. |
| Facebook | `facebook.com/share/19pN6t6Upb/` | all footers | — | Share link, not a profile; personal network | Owner decides whether it appears on a professional site (default: no). |
| Instagram | `yazan_al_samman` | all footers | — | Personal network | Owner decides (default: no). |

### 3.3 Education

| Field | Legacy value | New field | Problem | Required action |
|---|---|---|---|---|
| Degree | "Bachelor of Information Technology"; index says "Degree: bacalorious" | `Education.degree_*` | Misspelling; official EN/AR name unknown | Owner confirms the exact degree title and completion status. |
| Institution | "European Internaional University, EIU" | `Education.institution_*` | Typo ("Internaional"); Arabic name unknown | Owner confirms the official EN/AR name. |
| Dates | 2021 – 2025 | `Education.start/end` | Conflicts with the "Under Graduation Project" dated January 2026 (project P1) | Owner clarifies. |

Education is excluded from OWNER_PROFILE until confirmed.

### 3.4 Professional experience — INVALID / PLACEHOLDER — DO NOT PUBLISH (as written)

| Legacy entry | Problem |
|---|---|
| "Junior Development specialist", 2020 – Present — "Led the design…", "Collaborated with a team of 7 developers…", "Conducted code reviews…" | No employer named. Unverifiable team-size metric. Template-style bullets. |
| "informatics technologie specialist", 2017 – 2018 — "Managed up to 5 projects…", "4+ technical presentations … monthly" | No employer named. Unverifiable metrics. The dates are implausible against the legacy profile's own dates. Reads as template text. |
| "Code Machine" (GitHub `company` field only) | Not mentioned on the legacy site; unconfirmed employer |

Required action: the owner provides a real experience list (organization, role, dates, description), or confirms that the site launches without an Experience section.

### 3.5 Skills

| Item | Classification | Rule |
|---|---|---|
| Names: HTML, CSS, JavaScript, Java, Arduino, Python, PHP, Flutter, C++, SQL database engineering, ASP.NET, Cyber Security, Problem Solving | Requires cleanup (owner confirms the list) | May migrate as **names + categories + linked project evidence** only |
| **Percentages (60–90%)** | **INVALID — DO NOT PUBLISH** | Numerical proficiency scores are never migrated, and no replacement numbers are invented. A future proficiency scale needs explicit owner approval **and** a documented methodology (CONTENT_MODEL: "Do not create fake proficiency percentages"). |
| Interests: Web Development, Mobile Applications, Cloud & DevOps, AI & Machine Learning, Database Management, System Analysis, Data Modeling, Robotics, Cyber Security | Requires cleanup | These are **interests**, not expertise claims. Keep them separate or drop them. |
| GitHub language evidence (Dart/Flutter, TypeScript, Java/Spring Boot, C#/ASP.NET Core MVC, PHP, Jupyter) | Supporting evidence | Used only to link skills → projects |

**Note:** the confirmed title "Artificial Intelligence Engineer" should be backed by AI project evidence (P1, P2, P3 below). This is a content priority (RISK_REGISTER R-22).

### 3.6 Counters — INVALID / PLACEHOLDER — DO NOT PUBLISH

| Legacy counter | Value (from `data-purecounter-end`) | Reason |
|---|---|---|
| Happy Clients | 30 | Fabricated/unverifiable metric |
| Projects | 40 | Contradicts the 16 projects actually listed |
| Hours Of Support | 463 | Fabricated/unverifiable metric |
| Hard Workers | 15 | Meaningless template counter |

### 3.7 Certificates (legacy `services.html`)

All 29 lines are "<topic> license from <issuer>", with no dates, credential IDs, verification URLs or files. **Each needs the certificate file before publication.** The word "license" must not be published as a professional licence claim (e.g. "A+ license" must not imply CompTIA A+ certification unless the file shows that). Issuer spellings are recorded verbatim; the owner confirms the official names.

| # | Legacy wording (verbatim) | Issuer (as written) | Group | Status |
|---|---|---|---|---|
| 1 | Html license | chyiar academy | Front-end | Needs file |
| 2 | Css license | chyiar academy | Front-end | Needs file |
| 3 | bootstrap license | chyiar academy | Front-end | Needs file |
| 4 | JavaScript license | chyiar academy | Front-end | Needs file |
| 5 | Front-end Devloper license | X-academy focalX | Front-end | Needs file; typo |
| 6 | React license | X-academy focalX | Front-end | Needs file |
| 7 | php license | chyiar academy | Back-end | Needs file |
| 8 | MySql license | chyiar academy | Back-end | Needs file |
| 9 | ASP.net license | chyiar academy | Back-end | Needs file |
| 10 | Nodejs license | X-academy focalX | Back-end | Needs file |
| 11 | mangoDB license | X-academy focalX | Back-end | Needs file; likely "MongoDB" |
| 12 | Back-end license | X-academy focalX | Back-end | Needs file |
| 13 | Dart license | Wael abo hamzeh INC | Mobile | Needs file |
| 14 | Flutter license | Wael abo hamzeh INC | Mobile | Needs file |
| 15 | Firebase license | Wael abo hamzeh INC | Mobile | Needs file |
| 16 | State Management license | Wael abo hamzeh INC | Mobile | Needs file |
| 17 | SQFlite license | Wael abo hamzeh INC | Mobile | Needs file |
| 18 | Arduino license | Syrian Scientific Society for Informatics | Robotics | Needs file |
| 19 | Arduino ARC license | Syrian Scientific Society for Informatics | Robotics | Needs file |
| 20 | WRO license | Syrian Scientific Society for Informatics | Robotics | Needs file |
| 21 | A+ license | Syrian Scientific Society for Informatics | Networking | Needs file; wording risk |
| 22 | Computer Network ARC license | Syrian Scientific Society for Informatics | Networking | Needs file |
| 23 | Networking license | Syrian Scientific Society for Informatics | Networking | Needs file |
| 24 | Osint license | Security Blue Team Academy | Cyber Security | Needs file |
| 25 | penetration testing license | Security Blue Team Academy | Cyber Security | Needs file |
| 26 | threat Hunting license | Security Blue Team Academy | Cyber Security | Needs file |
| 27 | Incident Response license | Security Blue Team Academy | Cyber Security | Needs file |
| 28 | Cyber Security license | Security Blue Team Academy | Cyber Security | Needs file |
| 29 | Cyber Security license | Security Blue Team Academy | Cyber Security | **Duplicate of #28?** |

### 3.8 Projects (16)

Every legacy detail page shares boilerplate intro text ("a mobile application developed…"), including web and desktop projects, and every image has `alt=''`. That boilerplate is **INVALID / PLACEHOLDER — DO NOT PUBLISH**. Screenshots live in the legacy repo and were not downloaded. The owner confirms they may be reused (and that any client screens may be shown).

| # | Legacy title | Category (legacy) | Client (legacy) | Date (legacy) | Repo (legacy link) | Repo exists? | Status | Cleanup needed |
|---|---|---|---|---|---|---|---|---|
| P1 | AI Intelligence Project Management System | Web App | "Under Graduation Project" | Jan 2026 | profile link only | — | Requires cleanup — **flagship AI candidate** | The richest description: RBAC, Node/Express + MongoDB, Next.js, Flutter, FastAPI, LLM task generation (Groq API, Mistral 7B, Qwen 2.5), custom NN + FAISS, greedy assignment, expert system, JWT/Argon2/Helmet, Tauri. Owner confirms the role and the repo (possibly `project-hub*`), and resolves the date vs education conflict. |
| P2 | Breast Tumor Diagnosis System | Desktop App | "Not for any one" | — | `Breast-Tumor-Diagnosis-System-AI-Powered-Medical-Diagnosis-Tool` | Yes (Jupyter) | Requires cleanup — **AI candidate** | Category mismatch (notebook). No clinical accuracy claims without evidence. |
| P3 | Robot Obstacles Avoidance System (Fuzzy System, Neural Networks) | Desktop App | "Not for any one" | — | **Wrong link** (points to P2's repo) | Likely `Robot_obstocle_AI_Powerd_Fuzzy_System` | Requires cleanup — **AI/robotics candidate** | Owner confirms the correct repo. |
| P4 | Student Management Distributed System | Desktop App | "Not for any one" | — | `Distributed-System-Student-Management` | Yes (Java, Spring Boot/Cloud) | Requires cleanup | The portfolio card reuses P2's title and description (copy-paste error). |
| P5 | Services Provider Application | Desktop App | "Not for any one" | — | `ServicesProvider` | Yes (C#, ASP.NET Core MVC) | Requires cleanup | Category says Desktop; the repo is a web MVC app. |
| P6 | Taxi Elite Application | Mobile App | "Elite" | — | `Taxi-app-Elite-` | Yes | Requires cleanup | Client "Elite": the owner confirms it is real and may be named. 28 UI screens. |
| P7 | Car rending Application | Desktop App | "Not for any one" | — | `car-rending` | Yes (Dart) | Requires cleanup | "rending" is likely a typo for "renting"; category mismatch. |
| P8 | Car Rental Mobile Application | Mobile App | "Free lancing" | 17 Oct 2023 | placeholder `github.com/` | — | **Detail text INVALID / PLACEHOLDER — DO NOT PUBLISH** | The body describes an unrelated product ("Enhance… Cybertruck"). |
| P9 | Project Hub Application | Mobile App | "Free lancing" | — | `project-hub` | Yes (Dart) | Requires cleanup | May overlap with P1. |
| P10 | Fitness Mobile Application | Mobile App | "Free lancing" | 22 May 2023 | `fitness-App` | Yes (Dart) | Requires cleanup | The card description "Useful smart Home" is a copy-paste error. |
| P11 | SmartHome Mobile Application | Mobile App | "Free lancing" | 15 Feb 2023 | placeholder | — | Requires cleanup | Marketing text; no repo. |
| P12 | System Management (HR) | Web App | "Free lancing" | 1 Mar 2024 | placeholder | — | Requires cleanup | Image folder "galaxico" may be a client name — owner confirms. |
| P13 | E-commerce | Mobile App | "ASU Company" | — | `ecommerce` | Yes (Dart) | **INVALID / PLACEHOLDER — DO NOT PUBLISH** | **The detail page body is lorem ipsum** ("Exercitationem repudiandae officiis…"). The client claim "ASU Company" is unsupported. It can only be re-created from owner-supplied facts. |
| P14 | Basic Online E-Commerce Platform | Web App | "Not for any one" | 20 Jan 2018 | placeholder | — | Requires cleanup | Card: "basic web project for training". Archive candidate. |
| P15 | Basic Python Compiler | Desktop App | "Not for any one" | 27 Jul 2022 | placeholder | — | Requires cleanup | "for training". Archive candidate. |
| P16 | Basic University Management System | Desktop App | "Not for any one" | 24 Jul 2024 | placeholder | — | Requires cleanup | "for training". Archive candidate. |

Other public repos under `yazan-alsamman` (e.g. `clinic`, `tavola*`, `vegacore-system`, `doctors-system`, `almacosmotics`, `yalla-media-*`, `portfolio`) are **not** inventoried as projects. Being on the account does not establish role, authorship or client permission.

**Unsupported client claims — DO NOT PUBLISH until confirmed:** "ASU Company" (P13), "Elite" (P6), "galaxico" (P12, inferred from a folder name only), "Free lancing" labels. There were no testimonials on the legacy site.

---

## 4. Category C — DO NOT REPUBLISH

The owner has not requested any of the following. They stay recorded here as audit evidence only, and are **excluded from the CMS seed, the public site, metadata and structured data**.

| Item | Legacy source | Why excluded |
|---|---|---|
| Date of birth (legacy "Birthday") | index | Not requested by the owner; privacy (identity-theft vector); not in the content model. The value is deliberately not repeated in this document. |
| Age (derivable from the birth date) | index | Same as above |
| Neighbourhood-level home address (legacy "Address") | contact | Not requested; physical-safety/privacy risk. Value deliberately not repeated. |
| City / country as a home location | index, contact | Not requested; content model says location "only if explicitly supplied". Revisit only on owner request. |
| Personal phone number (appears in 3 inconsistent formats) | index, contact, resume | Not requested; spam and scraping risk. Value deliberately not repeated. |
| Legacy portrait `assets/img/yazan.jpg` | index | Superseded by the owner-supplied `portrait.jpg`; CONTENT_MIGRATION forbids web-found substitutes. |
| Legacy logo `assets/img/logo.png` | header | The new identity uses the text wordmark (BRAND_IDENTITY). |

**Note (Phase 0.1):** the Phase 0 version of this inventory quoted the birth date and phone number, and that version is in the local baseline commit `889d6c7`. The repository has **no remote and has never been pushed**. The values are public on the owner's own legacy site anyway. If the owner wants them out of the git history before the first push, squash or re-create the baseline commit (see the Phase 0.1 report).

---

## 5. Missing Inputs (updated)

| ID | Input | Status |
|---|---|---|
| M-01 | Portrait | **Supplied** (`portrait.jpg`). A higher-resolution original is **recommended** — see the Phase 0.1 report |
| M-02 | Legacy ownership confirmation | **Resolved** |
| M-03 | Canonical name EN/AR | **Resolved** — Yazan Al Samman / يزن السمان |
| M-04 | Professional title | **Resolved** — EN "Artificial Intelligence Engineer", AR "مهندس ذكاء صنعي" (owner, pre-Phase 2) |
| M-05 | CV file(s) | Pending |
| M-06 | Certificate files | Pending |
| M-07 | Real experience list | Pending |
| M-08 | Education confirmation | Pending |
| M-09 | Featured projects + case-study material (recommended: P1, P2, P3 first, to support the AI title) | Pending |
| M-10 | Public contact channels | Pending |
| M-11 | Arabic copy reviewer | Pending |
