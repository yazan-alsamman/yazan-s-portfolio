# Phase 13 — Content Review

**Date:** 2026-09-29 · **Source:** the published CMS content (read anonymously through the public API) and the owner's answers in the Phase 13 session.

**Rule:** nothing in this document or on the site is inferred. Every implemented change is sourced from text the owner had already published, and each was **approved by the owner in the Phase 13 working session**. Anything still requiring owner input is marked **Not implemented**.

---

## 1. Current Content Strengths

- **Confirmed identity.** "Yazan Al Samman — Artificial Intelligence Engineer" (`docs/content/OWNER_PROFILE.md`).
- **Real role.** Chief Technology Officer at VegaCORE, with "more than four years of professional experience … systems analysis, requirements analysis, evaluating appropriate technologies, and designing and building technology solutions".
- **One genuinely deep AI case.** The **AI Intelligence Project Management System**. Its owner-authored architecture text names:
  - LLM task generation (Groq API, Mistral 7B, Qwen 2.5);
  - a custom neural network with FAISS retrieval;
  - a greedy task-assignment algorithm with time-conflict detection;
  - an expert system for task classification;
  - a full stack (Node.js/Express, MongoDB, Next.js, React, Flutter, FastAPI, …).
- **Two further AI/robotics projects** with clear technique statements: Breast Tumor Diagnosis ("AI-powered medical diagnosis tool", repository, 4 figures), and Robot Obstacles Avoidance ("fuzzy system and neural networks").
- **Evidence assets.** 7 projects link public repositories, 5 have real screenshots (covers + galleries, with descriptive alt text), and there are 28 certificates from 5 issuers.

## 2. Current Content Weaknesses (before Phase 13)

- **Bios.** The short and long bios described only "mobile and web applications": the opposite of the title. The short bio is now fixed; the long bio is still the legacy text (§10).
- **Skills.** There was no AI/ML skill category. **Fixed** (§6).
- **Technologies.** Only 1 of 14 projects linked a technology. **Improved** to 2 projects, the ones whose own text names their technologies (§5).
- **Case-study sections.** The Problem / Approach / Results fields are empty on **every** project. Architecture exists only on the AI project management system.
- **Robotics project.** It has no description, imagery or repository.
- **Training exercises.** Several projects are self-described training exercises ("Basic … for training"). They remain unfeatured, as the owner set them.

## 3. Content Audit Matrix (published projects, English)

| # | Project | AI relevance | Engineering depth (CMS text) | Technologies | Case sections present | Imagery | Year | Repo | Missing |
|---|---|---|---|---|---|---|---|---|---|
| 1 | AI Intelligence Project Management System | **High:** LLMs, neural net, FAISS, expert system, greedy assignment | **High:** detailed architecture | **12** (was 1) | Overview, Architecture | — (schematic) | 2026 | — | Problem, Approach, Results; imagery; repository/demo link |
| 2 | Breast Tumor Diagnosis System | **High:** AI-powered medical diagnosis | Low: summary only | — | — | cover + 4 | — | ✓ | Model/method, dataset, architecture, results, technologies, year |
| 3 | Robot Obstacles Avoidance System | **High:** fuzzy system, neural networks | Low: title/summary only | **2** (was 0) | — | — (schematic) | — | — | Description, approach, architecture, results, imagery, platform |
| 4 | Project Hub Application | Medium: "AI-powered" (one line) | Low | — | Overview | cover + 5 | — | ✓ | What the AI does; technologies; architecture |
| 5 | Car Renting Application | — | Low | — | — | cover + 3 | — | ✓ | Everything but the summary |
| 6 | Student Management Distributed System | — | Low: "distributed system architecture" | — | — | — | — | ✓ | Architecture detail, technologies |
| 7 | Services Provider Application | — | Low | — | — | — | — | ✓ | Description, technologies |
| 8 | Taxi Elite Application | — | Low | — | — | — | — | ✓ | Description, technologies |
| 9 | Fitness Mobile Application | — | Low (marketing text) | — | Overview | — | 2023 | ✓ | Technologies, architecture |
| 10 | SmartHome Mobile Application | — | Low (marketing text) | — | Overview | — | 2023 | — | Technologies, architecture |
| 11 | System Management | — | Low (marketing text) | — | Overview | — | 2024 | — | Technologies, architecture |
| 12 | Basic Online E-Commerce Platform | — | Training | — | Overview | cover + 7 | — | — | (training exercise) |
| 13 | Basic University Management System | — | Training | — | — | cover + 3 | 2024 | — | (training exercise) |
| 14 | Basic Python Compiler | — | Low: "defines the syntax and semantics" | — | — | — | 2022 | — | Implementation language, approach |

## 4. AI Engineer Positioning (what the site now says, and on what evidence)

| Surface | Statement | Evidence |
|---|---|---|
| Profile short bio (**implemented, owner-approved**) | "Artificial Intelligence Engineer and CTO at VegaCORE. I build intelligent systems — LLM-driven task generation and assignment, AI-assisted medical diagnosis, and fuzzy-logic and neural-network robot navigation — together with the software infrastructure around them." | Profile title; Experience; projects 1–3 |
| Skills | An "Intelligence" layer on top of the capability stack, each technique linked to its project | Projects 1 and 3 (CMS relations) |
| Project pages | Stack by architecture layer; repository as the primary action; on-page contents | CMS technologies and links |
| JSON-LD | `Person.knowsAbout` (published skills, intelligence first); `CreativeWork.keywords` (the project's technologies) | CMS |

## 5. Missing Technologies (owner input)

Implemented (owner-approved), for **AI Intelligence Project Management System** and **Robot Obstacles Avoidance**. Still missing for:

| Project | What to add (only if true) |
|---|---|
| Breast Tumor Diagnosis System | Language/libraries of the model and the UI (e.g. the ML library used) |
| Project Hub Application | The mobile framework and backend; where the "AI-powered" part lives |
| Car Renting, Taxi Elite, Fitness, SmartHome (mobile) | Framework (e.g. Flutter, if that is what was used — **not inferred from the repository**) |
| Student Management Distributed System, Services Provider | Language, framework, communication mechanism |
| System Management | Stack and hosting |
| Basic Python Compiler | Implementation language and parsing approach |

The AI project management architecture text also names Tailwind CSS, JWT authentication, Argon2, Helmet, CORS, rate limiting, Chart.js, Framer Motion, Swiper and Tauri. These were **not** linked, because the owner approved the core list only. They remain readable in the architecture section.

## 6. AI / ML Skills

**Implemented (owner-approved).** The `ai-ml` category now holds exactly the techniques the owner's own project texts name. There are no ratings.

| Skill | Evidence (CMS relation) | Source text |
|---|---|---|
| Large language models | AI project management | "task generation using multiple LLMs (Groq API, Mistral 7B, Qwen 2.5)" |
| Neural networks | AI project management; Robot navigation | "a custom neural network …"; "fuzzy system and neural networks" |
| Fuzzy logic | Robot navigation | "fuzzy system" |
| FAISS vector retrieval | AI project management | "FAISS retrieval system" |
| Expert systems | AI project management | "an expert system for task classification" |
| Algorithm design | AI project management | "a greedy algorithm for optimal task assignment with time conflict detection" |

**Still open (owner input):**
- Computer vision, machine learning or deep-learning frameworks (e.g. PyTorch/TensorFlow/scikit-learn) should be added **only if the owner has used them**.
- If the Breast Tumor Diagnosis model is ML-based, name the method (for example logistic regression, SVM, neural network) and the dataset.

## 7. Missing Case-Study Sections

The CMS has Overview, Problem, Approach, Architecture and Results. It has **no "Implementation" field**; adding one is a schema change and was not made. The page renders only fields with content.

| Project | Needed (owner-authored) |
|---|---|
| AI Intelligence Project Management System | **Problem** (what was broken in task planning), **Approach** (why LLM + neural net + greedy assignment), **Results** (only real outcomes: users, deployments, measured behaviour — or leave empty) |
| Breast Tumor Diagnosis System | Overview, Problem, Approach (model, features — the UI shows "mean", "standard error" and "worst" value inputs), Architecture, Results (e.g. evaluated accuracy **if measured**) |
| Robot Obstacles Avoidance System | Overview, Approach (fuzzy rules + neural network roles), Architecture (sensors, controller, simulation or hardware), Results |
| Project Hub Application | The AI part (what it does) |

## 8. Missing Project Imagery

- **Real imagery exists** for Breast Tumor Diagnosis, Project Hub, Car Renting, E-Commerce and University Management. It is used as covers and numbered, captioned figures.
- **No imagery:** 9 projects, including the two strongest AI projects (AI project management, robot navigation). They show the deterministic discipline schematic, always labelled "Schematic · no published imagery". **Recommended:** screenshots or diagrams of the AI project management system (task generation, assignment view) and a photo, simulation capture or diagram of the robot.

## 9. Proposed Short Bio

**Implemented (owner-approved 2026-09-29).**

| Field | `Profile.shortBio` (en) |
|---|---|
| Current value (before) | "Dedicated and detail-oriented developer with a strong passion for building scalable and efficient mobile and web applications. Committed to delivering high-quality solutions that meet user needs and business goals." |
| Proposed / applied value | "Artificial Intelligence Engineer and CTO at VegaCORE. I build intelligent systems — LLM-driven task generation and assignment, AI-assisted medical diagnosis, and fuzzy-logic and neural-network robot navigation — together with the software infrastructure around them." |
| Reason | The previous bio contradicted the confirmed title and the strongest work |
| Factual source | Profile title; Experience (CTO, VegaCORE); architecture of the AI project management system; Breast Tumor Diagnosis summary; Robot Obstacles Avoidance title/summary |
| Implemented | **Yes.** `src/cms/owner/owner-content.ts` → `pnpm cms:apply-owner` (English only) |

## 10. Proposed Long Bio

**Not implemented — owner approval required.**

| Field | `Profile.longBio` (en) |
|---|---|
| Current value | "Passionate about creating innovative mobile and web solutions that enhance user experiences and drive business success. Committed to continuous learning …" (legacy text) |
| Reason | It still positions a mobile/web developer and repeats generic phrases |
| Factual sources | Experience text; the AI project management architecture; the project summaries; Education (AIU, 2026) |
| Implemented | **No** |

Proposed value, three paragraphs:

> I am an Artificial Intelligence Engineer and the Chief Technology Officer at VegaCORE, with more than four years of professional experience in systems analysis, requirements analysis, and designing and building technology solutions.
>
> My work sits where intelligent components meet production software. In the AI Intelligence Project Management System I combined LLM-based task generation (Groq API, Mistral 7B, Qwen 2.5), a custom neural network with FAISS retrieval, a greedy algorithm for task assignment with time-conflict detection and an expert system for task classification, on a Node.js/Express, MongoDB, Next.js and Flutter stack. I have also built an AI-powered breast tumour diagnosis tool and a robot obstacle-avoidance system based on fuzzy logic and neural networks.
>
> I studied Information Technology at the Arab International University (AIU), graduating in 2026.

## 11. Owner Approval Required (open items)

| # | Field | Current | Proposed | Reason | Source | Implemented |
|---|---|---|---|---|---|---|
| 1 | Profile.longBio (en) | Legacy mobile/web text | §10 | Positioning | See §10 | **No** |
| 2 | Project 1: problem / solution / results | empty | Owner-authored | Case-study depth | — (owner only) | No |
| 3 | Project 2: description / solution / architecture / results / technologies | empty | Owner-authored | Case-study depth | — | No |
| 4 | Project 3: description / solution / architecture / results / imagery | empty | Owner-authored | Case-study depth | — | No |
| 5 | Technologies of the other 11 projects | empty | §5 | "How it was built" | — (not inferred from repositories) | No |
| 6 | Further AI/ML skills (CV, ML frameworks) | — | Only if used | Positioning | — | No |
| 7 | Experience.startDate (VegaCORE) | none | Owner's date | Timeline period | — | No |
| 8 | Certificates: dates, credential IDs, verification URLs | none | From the certificates | Evidence quality | — | No |
| 9 | Arabic copy for all new strings | Draft | Review | Arabic gate (D-9) | `messages/ar.json` | Draft only; gate closed |

**Approved and implemented in Phase 13:**
- the short bio (§9);
- six AI techniques (§6);
- six technologies: Node.js, Express.js, FastAPI, MongoDB, Next.js, React;
- the technology links of projects 1 and 3.

Applied with `pnpm cms:apply-owner` after a database backup. `pnpm cms:verify-legacy` shows 0 errors and 25 published skills.

**Deployment note:** the encrypted first-deployment content package (`deploy/content/portfolio-content.tar.enc`) predates these changes. On production, either run `pnpm cms:apply-owner` after restoring the package, or regenerate the package.
