/**
 * Phase 14 — portfolio authority content (2026-09-29). Applied by `pnpm cms:apply-phase14`
 * (idempotent), English only; Arabic stays gated (copy-review D-9).
 *
 * Provenance rules (docs/content/PORTFOLIO_CONTENT_MATRIX.md):
 * - `verified` projects are written ONLY from (a) text the owner already published in the CMS and
 *   (b) the owner's public GitHub repositories (README / repository metadata), with repository-
 *   reported figures attributed as such. The owner approved publishing Tavola, VegaCore OS,
 *   Saree'e, Tabkha & More and the Zina website as verified work (Phase 14 session).
 * - `concept` projects are design studies the owner approved as clearly labelled concepts: their
 *   "results" are design objectives, they carry no metrics, users or deployments, and every public
 *   surface labels them (card, page banner, filter, structured data `creativeWorkStatus`).
 * - Skills are `verified` only when a verified project or certificate evidences them; otherwise
 *   `exploration` (shown apart, never as professional experience).
 */

export const PHASE14_DATE = '2026-09-29';

type Paragraphs = string[];

export type Phase14Project = {
  slug: string;
  /** Omitted for existing projects whose owner-authored title stays. */
  title?: string;
  summary?: string;
  category?:
    | 'artificial-intelligence'
    | 'machine-learning'
    | 'computer-vision'
    | 'robotics'
    | 'software-engineering'
    | 'web'
    | 'mobile'
    | 'data';
  provenance: 'verified' | 'concept' | 'experimental';
  tier: 'flagship' | 'strong' | 'supporting';
  featured: boolean;
  sortOrder: number;
  schematic?:
    | 'network'
    | 'vision'
    | 'kinematic'
    | 'modules'
    | 'device'
    | 'browser'
    | 'pipeline'
    | 'agents'
    | 'events'
    | 'tenancy';
  /** Sections to write; an omitted section is left exactly as it is in the CMS. */
  sections?: Partial<
    Record<
      | 'description'
      | 'problem'
      | 'constraints'
      | 'solution'
      | 'architecture'
      | 'intelligence'
      | 'decisions'
      | 'challenges'
      | 'results',
      Paragraphs
    >
  >;
  /** Technology/skill names, in display order (created by the skills list below if missing). */
  technologies?: string[];
  /** Replaces the project's links when present. */
  links?: { label: string; url: string; kind: 'repository' | 'demo' | 'article' | 'other' }[];
  /** Link the project to an experience entry (organization + title). */
  experience?: { organization: string; title: string };
  seo?: { title: string; description: string };
  /** Where every statement comes from (stored in the admin-only source note). */
  source: string;
  /** Phase 15: genuine screenshots (src/cms/content/media) — cover and gallery, in order. */
  cover?: { file: string; alt: string; source: string };
  gallery?: { file: string; alt: string; source: string }[];
};

export type Phase14Skill = {
  name: string;
  category:
    | 'ai-ml'
    | 'architecture'
    | 'programming'
    | 'backend'
    | 'frontend'
    | 'mobile'
    | 'devops-infrastructure'
    | 'databases'
    | 'security'
    | 'practice'
    | 'tools'
    | 'other';
  provenance: 'verified' | 'exploration';
  displayOrder: number;
  source: string;
};

const GH = 'https://github.com/yazan-alsamman';
const REPO = (name: string) => `${GH}/${name}`;

/* ============================================================================================== */
/* Profile                                                                                         */
/* ============================================================================================== */

/** Long bio — from the confirmed title, the VegaCORE experience, education and verified projects. */
export const phase14LongBio: Paragraphs = [
  'I am an Artificial Intelligence Engineer and the Chief Technology Officer at VegaCORE, with more than four years of professional experience in systems analysis, requirements analysis, evaluating appropriate technologies, and designing and building technology solutions.',
  'My work sits where intelligent components meet production software. In the AI Intelligence Project Management System I combined LLM-based task generation, a custom neural network with FAISS retrieval, a greedy assignment algorithm with time-conflict detection and an expert system for task classification. I have built a K-nearest-neighbours breast-tumour classifier served through a Flask API, and a neuro-fuzzy (FIS and ANFIS) controller for obstacle-aware robot navigation.',
  'Around those components I design the platforms they run in: a multi-tenant restaurant-reservation SaaS on NestJS, PostgreSQL, Redis and BullMQ with real-time updates and token-family authentication; the VegaCore Operating System; a documented architecture for a trading-analysis backend with a model registry and explainable signals; and a microservice system on Spring Cloud.',
  'I studied Information Technology at the Arab International University (AIU), graduating in 2026.',
];

/** Engineering principles (About). Statements of practice visible across the verified repositories. */
export const phase14Principles: { title: string; body: string }[] = [
  {
    title: 'Documentation before code',
    body: 'Architecture, domain model and decision records come first; implementation follows accepted decisions instead of guessing unresolved ones.',
  },
  {
    title: 'Deterministic where it matters',
    body: 'Probabilistic components propose; deterministic, testable logic decides — assignment, scheduling, pricing and state transitions stay verifiable.',
  },
  {
    title: 'Explicit boundaries',
    body: 'Domain, application and infrastructure are separated; external providers sit behind adapters so they can be replaced and tested in isolation.',
  },
  {
    title: 'Security in the definition of done',
    body: 'Authentication, authorisation, rate limiting, validation and audit logging are part of a feature, not a later hardening pass.',
  },
  {
    title: 'Measured, not estimated',
    body: 'Performance and quality claims come from measurements and test suites; where a number is unknown it is reported as unknown.',
  },
  {
    title: 'Graceful degradation',
    body: 'Every enhanced experience has a complete fallback — an intelligent component failing must never take the product down with it.',
  },
];

/* ============================================================================================== */
/* Skills                                                                                          */
/* ============================================================================================== */

export const phase14Skills: Phase14Skill[] = [
  // Intelligence — verified by the ML / neuro-fuzzy repositories.
  {
    name: 'Machine learning',
    category: 'ai-ml',
    provenance: 'verified',
    displayOrder: 7,
    source: 'Breast Tumor Diagnosis repository (KNN classifier, scikit-learn)',
  },
  {
    name: 'Neuro-fuzzy systems (ANFIS)',
    category: 'ai-ml',
    provenance: 'verified',
    displayOrder: 8,
    source: 'Robot navigation repository (custom ANFIS, gradient-descent training)',
  },
  {
    name: 'Model evaluation',
    category: 'ai-ml',
    provenance: 'verified',
    displayOrder: 9,
    source: 'Both ML repositories (hold-out metrics, 5-fold cross-validation, ROC-AUC)',
  },
  // Intelligence — exploration (concept systems only).
  {
    name: 'Retrieval-augmented generation',
    category: 'ai-ml',
    provenance: 'exploration',
    displayOrder: 20,
    source: 'Concept: Enterprise RAG Platform',
  },
  {
    name: 'AI agents & multi-agent orchestration',
    category: 'ai-ml',
    provenance: 'exploration',
    displayOrder: 21,
    source: 'Concept: Multi-Agent Engineering System',
  },
  {
    name: 'Computer vision',
    category: 'ai-ml',
    provenance: 'exploration',
    displayOrder: 22,
    source: 'Concept: Vision Inspection Pipeline',
  },
  {
    name: 'LLM evaluation & observability',
    category: 'ai-ml',
    provenance: 'exploration',
    displayOrder: 23,
    source: 'Concept: LLM Observability & Evaluation Platform',
  },
  // Systems / architecture — verified by Tavola, Saree'e, Trading AI, Student Management, VegaCore OS.
  {
    name: 'System design & ADRs',
    category: 'architecture',
    provenance: 'verified',
    displayOrder: 30,
    source: "Tavola backend, Saree'e and Trading AI repositories (architecture docs, accepted ADRs)",
  },
  {
    name: 'Multi-tenant SaaS architecture',
    category: 'architecture',
    provenance: 'verified',
    displayOrder: 31,
    source: 'Tavola backend (tenancy design, per-tenant context)',
  },
  {
    name: 'Microservices',
    category: 'architecture',
    provenance: 'verified',
    displayOrder: 32,
    source: 'Student Management Distributed System (gateway, registry, tracing)',
  },
  {
    name: 'Asynchronous processing & queues',
    category: 'architecture',
    provenance: 'verified',
    displayOrder: 33,
    source: "Tavola (BullMQ), Trading AI (worker app), Saree'e (BullMQ)",
  },
  {
    name: 'Real-time systems (WebSockets)',
    category: 'architecture',
    provenance: 'verified',
    displayOrder: 34,
    source: 'Tavola backend (Socket.IO with Redis adapter, through Nginx)',
  },
  {
    name: 'REST API design',
    category: 'architecture',
    provenance: 'verified',
    displayOrder: 35,
    source: "Tavola /api/v1, Breast Tumor Diagnosis Flask API, Saree'e /api/v1",
  },
  // Application engineering.
  {
    name: 'TypeScript',
    category: 'programming',
    provenance: 'verified',
    displayOrder: 40,
    source: "Tavola, VegaCore OS, Trading AI, Saree'e, this portfolio",
  },
  {
    name: 'Dart',
    category: 'programming',
    provenance: 'verified',
    displayOrder: 41,
    source: 'Tavola customer app, Project Hub, Fitness and Car Renting repositories',
  },
  {
    name: 'NestJS',
    category: 'backend',
    provenance: 'verified',
    displayOrder: 42,
    source: "Tavola backend, VegaCore OS, Trading AI, Saree'e",
  },
  {
    name: 'Flask',
    category: 'backend',
    provenance: 'verified',
    displayOrder: 43,
    source: 'Breast Tumor Diagnosis repository',
  },
  {
    name: 'Spring Boot & Spring Cloud',
    category: 'backend',
    provenance: 'verified',
    displayOrder: 44,
    source: 'Student Management Distributed System',
  },
  {
    name: 'Payload CMS',
    category: 'backend',
    provenance: 'verified',
    displayOrder: 45,
    source: 'This portfolio (yazan-s-portfolio)',
  },
  {
    name: 'Tailwind CSS',
    category: 'frontend',
    provenance: 'verified',
    displayOrder: 46,
    source: 'Tavola dashboard, VegaCore OS, Tabkha & More, this portfolio',
  },
  {
    name: 'Three.js / WebGL',
    category: 'frontend',
    provenance: 'verified',
    displayOrder: 47,
    source: 'This portfolio (React Three Fiber cinematic scene)',
  },
  // Data.
  {
    name: 'PostgreSQL',
    category: 'databases',
    provenance: 'verified',
    displayOrder: 50,
    source: "Tavola, VegaCore OS, Saree'e, Tabkha & More (Neon), this portfolio",
  },
  {
    name: 'Prisma',
    category: 'databases',
    provenance: 'verified',
    displayOrder: 51,
    source: "Tavola, VegaCore OS, Trading AI, Saree'e",
  },
  {
    name: 'Redis',
    category: 'databases',
    provenance: 'verified',
    displayOrder: 52,
    source: 'Tavola (rate limiting, Socket.IO adapter), VegaCore OS, Trading AI',
  },
  // Infrastructure.
  {
    name: 'Docker',
    category: 'devops-infrastructure',
    provenance: 'verified',
    displayOrder: 60,
    source: 'Tavola stack, VegaCore OS, Student Management, this portfolio',
  },
  {
    name: 'Nginx',
    category: 'devops-infrastructure',
    provenance: 'verified',
    displayOrder: 61,
    source: 'Tavola (API and WebSocket reverse proxy), VegaCore OS, this portfolio',
  },
  {
    name: 'BullMQ',
    category: 'devops-infrastructure',
    provenance: 'verified',
    displayOrder: 62,
    source: "Tavola, Trading AI worker, Saree'e",
  },
  {
    name: 'Object storage (S3 / MinIO)',
    category: 'devops-infrastructure',
    provenance: 'verified',
    displayOrder: 63,
    source: 'Tavola and VegaCore OS (MinIO)',
  },
  {
    name: 'CI/CD',
    category: 'devops-infrastructure',
    provenance: 'verified',
    displayOrder: 64,
    source: 'Tabkha & More (GitHub Actions: typecheck, lint, test, build)',
  },
  // Engineering discipline.
  {
    name: 'Authentication & session security',
    category: 'security',
    provenance: 'verified',
    displayOrder: 70,
    source: 'Tavola (JWT, refresh-token families, sessions, rate-limited auth)',
  },
  {
    name: 'Authorization (RBAC)',
    category: 'security',
    provenance: 'verified',
    displayOrder: 71,
    source: 'Tavola (RBAC, policies, scope guards), VegaCore OS, AI project management system',
  },
  {
    name: 'Automated testing',
    category: 'practice',
    provenance: 'verified',
    displayOrder: 72,
    source: 'Tavola (strict E2E suite), this portfolio (unit, CMS and E2E suites)',
  },
  {
    name: 'Web accessibility',
    category: 'practice',
    provenance: 'verified',
    displayOrder: 73,
    source: 'This portfolio (axe WCAG 2.2 AA checks, reduced-motion fallbacks)',
  },
  {
    name: 'Performance engineering',
    category: 'practice',
    provenance: 'verified',
    displayOrder: 74,
    source: 'This portfolio (JS and 3D budgets, demand rendering, measured frame times)',
  },
  {
    name: 'Internationalization & RTL',
    category: 'practice',
    provenance: 'verified',
    displayOrder: 75,
    source: 'Tavola dashboard, Tabkha & More, this portfolio (Arabic RTL / English LTR)',
  },
];

/** Existing skills re-homed into the richer taxonomy (category only; names unchanged). */
export const phase14SkillCategories: Record<string, Phase14Skill['category']> = {
  'Cyber Security': 'security',
  'Problem Solving': 'practice',
};

/* ============================================================================================== */
/* Projects                                                                                        */
/* ============================================================================================== */

export const phase14Projects: Phase14Project[] = [
  /* --------------------------------------------- Flagship ---------------------------------------- */
  {
    slug: 'ai-intelligence-project-management-system',
    provenance: 'verified',
    tier: 'flagship',
    featured: true,
    sortOrder: 10,
    schematic: 'pipeline',
    source: 'Owner-authored CMS overview and architecture (unchanged); new sections restate that text.',
    sections: {
      problem: [
        'Project work across several companies and five roles (Super Admin, Admin, Project Manager, Developer, Client) turns on two recurring decisions: how a goal becomes concrete tasks, and who should do each task without creating time conflicts. The platform brings both decisions — together with delay tracking — into one system.',
      ],
      constraints: [
        'Multi-company tenancy with role-based access control; real-time collaboration; delivery across a Next.js web client, a Flutter mobile client and a Tauri desktop build; and an assignment step that must respect existing schedules.',
      ],
      intelligence: [
        'The intelligence layer is split into four stages. Task generation uses several large language models (Groq API, Mistral 7B, Qwen 2.5) to propose candidate tasks from project context. A custom neural network with a FAISS retrieval system brings related prior work into that context. An expert system classifies tasks. A greedy algorithm then assigns tasks to people, detecting time conflicts before a task is placed.',
      ],
      decisions: [
        'Generation and assignment are deliberately different kinds of computation: open-ended decomposition is delegated to language models, while the step that must be correct — who does what, and when — is an explicit algorithm whose output can be checked. Classification by an expert system keeps the categorisation rules inspectable rather than learned implicitly.',
        'The platform side uses JWT authentication with Argon2 password hashing, Helmet, CORS and rate limiting — security controls that sit in front of every AI-backed endpoint.',
      ],
    },
    technologies: [
      'Large language models',
      'Neural networks',
      'FAISS vector retrieval',
      'Expert systems',
      'Algorithm design',
      'Node.js',
      'Express.js',
      'FastAPI',
      'MongoDB',
      'Next.js',
      'React',
      'Flutter',
      'Authorization (RBAC)',
    ],
    seo: {
      title: 'AI Project Management System — LLM tasks and assignment',
      description:
        'Enterprise project management with LLM task generation, FAISS retrieval, an expert-system classifier and greedy, conflict-aware task assignment — by Yazan Al Samman.',
    },
  },
  {
    slug: 'tavola-restaurant-reservation-platform',
    title: 'Tavola — Multi-Tenant Restaurant Reservation Platform',
    summary:
      'A multi-tenant SaaS for restaurant reservations, tables, branches and staff: NestJS backend with real-time updates, a Flutter customer app, a React restaurant dashboard and a platform-owner console.',
    category: 'software-engineering',
    provenance: 'verified',
    tier: 'flagship',
    featured: true,
    sortOrder: 20,
    schematic: 'tenancy',
    source:
      'Public repositories tavola-backend, tavola, tavola-dashboard and Tavola-owner-dashboard (READMEs).',
    sections: {
      description: [
        'Tavola is a reservation platform for restaurants. Restaurants manage reservations, tables and floor plans, branches, employees, menus, offers, subscriptions and analytics through one backend; customers discover restaurants, book tables, join waitlists and receive notifications in a mobile app; platform operators manage the whole network from a separate console.',
      ],
      problem: [
        "A reservation system is only useful if its state is correct under concurrency: a table cannot be promised twice, a waitlist must advance in order, and staff on the floor must see changes as they happen. On top of that, one deployment has to serve many restaurants without any of them seeing another's data.",
      ],
      constraints: [
        'Tenant isolation for every request; four distinct actors (customer, restaurant staff, restaurant owner, platform admin) with separate authentication paths; multiple languages and currencies as design goals; and live operational updates that must pass through a reverse proxy.',
      ],
      solution: [
        'The work was planned documentation-first: architecture, domain model, database design and a development roadmap were completed before implementation, and binding choices are recorded as architecture decision records. Implementation then proceeded module by module — infrastructure, authentication, authorisation, tables, the reservation engine, real time, notifications — each closed with its own verification.',
      ],
      architecture: [
        'A modular NestJS application exposes a versioned REST API (`/api/v1`) behind Nginx. PostgreSQL is accessed through Prisma with a controlled migration policy; Redis provides sliding-window rate limiting and the Socket.IO adapter for live table and reservation updates; BullMQ runs durable background work; MinIO stores media. Push notifications go through OneSignal.',
        'Clients are separate applications: a Flutter customer app (GetX, feature-based MVC, a Dio client with bearer refresh and a guest mode), a React 19 + TypeScript restaurant dashboard with English/Arabic and dark/light themes, and a standalone platform-owner console that authenticates only against the platform-admin endpoints.',
      ],
      decisions: [
        'Authentication uses JWTs with refresh-token families and server-side sessions, so a stolen refresh token can be detected and a whole family revoked. Authorisation is a separate layer of RBAC policies, permission resolution and scope guards — being signed in and being allowed are different checks.',
        'Platform administration has its own login and token type rather than a privileged restaurant role, which keeps the platform-operator surface out of the tenant authentication path entirely.',
      ],
      challenges: [
        'The table module supports moving, merging and splitting tables while reservations reference them; the reservation engine covers approval, lifecycle, phone and walk-in bookings, waitlists and operational signals. Real-time delivery had to be verified end-to-end through Nginx, not only in-process.',
      ],
      results: [
        'As reported in the backend repository: the table module (including merge and split) and the reservation engine are implemented and live-verified; the WebSocket layer is verified through Nginx; and the notification system passes a strict end-to-end suite of 34 suites / 377 tests.',
      ],
    },
    technologies: [
      'NestJS',
      'TypeScript',
      'PostgreSQL',
      'Prisma',
      'Redis',
      'BullMQ',
      'Real-time systems (WebSockets)',
      'Multi-tenant SaaS architecture',
      'Authentication & session security',
      'Authorization (RBAC)',
      'Object storage (S3 / MinIO)',
      'Docker',
      'Nginx',
      'Flutter',
      'Dart',
      'React',
      'Tailwind CSS',
      'Internationalization & RTL',
      'System design & ADRs',
      'Automated testing',
    ],
    links: [
      { label: 'Backend repository', url: REPO('tavola-backend'), kind: 'repository' },
      { label: 'Customer app repository (Flutter)', url: REPO('tavola'), kind: 'repository' },
      { label: 'Restaurant dashboard repository', url: REPO('tavola-dashboard'), kind: 'repository' },
      { label: 'Platform-owner console repository', url: REPO('Tavola-owner-dashboard'), kind: 'repository' },
    ],
    seo: {
      title: 'Tavola — multi-tenant restaurant reservation SaaS',
      description:
        'Architecture of a multi-tenant reservation platform: NestJS, Prisma, Redis, BullMQ, Socket.IO, token-family auth and RBAC, with Flutter and React clients.',
    },
  },
  {
    slug: 'trading-ai-backend-architecture',
    title: 'Trading AI Assistance — Backend Architecture',
    summary:
      'The backend architecture of a trading-analysis platform: market-data ingestion, strategy execution, explainable AI signals, a model registry and leakage-safe backtesting, as a modular monolith with a Python inference service.',
    category: 'artificial-intelligence',
    provenance: 'verified',
    tier: 'flagship',
    featured: true,
    sortOrder: 30,
    schematic: 'events',
    source: 'Public repository `senior` (README and documentation map).',
    sections: {
      description: [
        'The backend for a trading-assistance platform whose specification lists 19 AI capabilities and 19 software capabilities — indicators, strategy execution, chart-image analysis, explainable signals, sentiment and news impact, risk management, backtesting and alerts. The repository turns that specification into explicit engineering boundaries and a working foundation.',
      ],
      constraints: [
        'The non-negotiable rules are written into the architecture: a trading signal is never presented as guaranteed profit; AI output is an analysis, not a command; every prediction must be traceable to model version, input snapshot, strategy configuration and timestamp; and backtesting must prevent look-ahead bias and data leakage.',
      ],
      architecture: [
        'A modular monolith with explicit domain boundaries and asynchronous workers, in a pnpm workspace: a NestJS HTTP API (`/api/v1`), a BullMQ worker, a framework-free domain package, an application package of use cases and ports, an infrastructure package (Prisma, Redis, BullMQ, logging adapters), typed configuration, and shared contracts for envelopes, error codes and queue names.',
      ],
      intelligence: [
        'ML workloads are placed in a separate Python inference/training service where Python-native tooling is required. The documented AI architecture covers a model registry with model versions, inference requests and evaluation metrics, explainable (XAI) signals, and a signal lifecycle kept separate from execution: an execution intent is not an order.',
      ],
      decisions: [
        'A modular monolith was chosen over microservices for strong consistency and simpler deployment, while leaving a clean path to extract high-load components later. External providers — market data, brokers — sit behind adapters, and domain rules are testable without infrastructure.',
      ],
    },
    technologies: [
      'NestJS',
      'TypeScript',
      'PostgreSQL',
      'Prisma',
      'Redis',
      'BullMQ',
      'Asynchronous processing & queues',
      'System design & ADRs',
      'Python',
      'Model evaluation',
    ],
    links: [{ label: 'Repository', url: REPO('senior'), kind: 'repository' }],
    seo: {
      title: 'Trading AI backend — model registry and explainable signals',
      description:
        'Modular-monolith backend for trading analysis: NestJS, BullMQ workers, a Python inference service, a model registry and explainable, traceable AI signals.',
    },
  },
  {
    slug: 'vegacore-operating-system',
    title: 'VegaCore Operating System (VOS)',
    summary:
      'An ERP / CRM / project-management platform for VegaCORE: CRM, projects, marketing, media, HR, finance, archive and AI modules on NestJS, Prisma, PostgreSQL and Next.js 15.',
    category: 'software-engineering',
    provenance: 'verified',
    tier: 'flagship',
    featured: true,
    sortOrder: 40,
    schematic: 'modules',
    source: "Public repository vegacore-system (README); linked to the owner's VegaCORE CTO role.",
    sections: {
      description: [
        'The operating system of a digital business-development company: one platform for clients and contracts, projects (kanban, sprints, milestones), marketing campaigns and content calendars, media production, HR, finance, a searchable asset archive, security reporting and an executive dashboard — plus an AI module for script generation, content planning and analysis.',
      ],
      architecture: [
        'A NestJS API over PostgreSQL through Prisma, with Redis for caching and MinIO (S3-compatible) for files; a Next.js 15 + TypeScript + Tailwind CSS front end; JWT authentication with refresh tokens and role-based access control; real-time readiness through Socket.io; and a Docker Compose + Nginx deployment documented for a VPS.',
      ],
      decisions: [
        'The platform is organised by business module rather than by technical layer, so each department — CRM, finance, media — can evolve without touching the others, while identity, permissions, storage and search are shared services.',
      ],
    },
    technologies: [
      'NestJS',
      'TypeScript',
      'PostgreSQL',
      'Prisma',
      'Redis',
      'Object storage (S3 / MinIO)',
      'Next.js',
      'Tailwind CSS',
      'Authorization (RBAC)',
      'Authentication & session security',
      'Docker',
      'Nginx',
    ],
    links: [{ label: 'Repository', url: REPO('vegacore-system'), kind: 'repository' }],
    experience: { organization: 'VegaCORE', title: 'Chief Technology Officer (CTO)' },
    seo: {
      title: 'VegaCore Operating System — ERP, CRM and AI modules',
      description:
        'Modular ERP, CRM and project-management platform with an AI content module, built on NestJS, Prisma, PostgreSQL, Redis, MinIO and Next.js 15.',
    },
  },
  {
    slug: 'breast-tumor-diagnosis-system',
    summary:
      'A K-nearest-neighbours classifier that labels a breast tumour benign or malignant from 30 diagnostic features, served through a Flask REST API with a web interface.',
    provenance: 'verified',
    tier: 'flagship',
    featured: true,
    sortOrder: 50,
    source: 'Public repository Breast-Tumor-Diagnosis-System (README: model, dataset, metrics, API).',
    sections: {
      description: [
        "A machine-learning web application that classifies a breast tumour as benign or malignant from 30 diagnostic features, with a web interface for clinicians' inputs and a REST API for integration.",
      ],
      problem: [
        'Diagnostic features extracted from tumour images — radius, texture, perimeter, area, smoothness, compactness, concavity, concave points, symmetry and fractal dimension, each as a mean, a standard error and a worst value — need to be turned into a transparent benign/malignant prediction with a probability for each class, not a bare label.',
      ],
      intelligence: [
        'The model is a K-nearest-neighbours classifier selected by hyper-parameter search (k = 3, uniform weights, Manhattan distance), trained on the Breast Cancer Wisconsin (Diagnostic) data set — 569 samples, 30 features, 357 benign and 212 malignant. Inputs are standardised with the same scaler used in training before inference.',
      ],
      architecture: [
        'A Flask API loads the serialised model and scaler at start-up and exposes `GET /health` (model and scaler status) and `POST /predict`, which validates all 30 features and returns the class, a confidence value and both class probabilities. The web interface is plain HTML, CSS and JavaScript with benign, malignant and random sample inputs for testing.',
      ],
      results: [
        'As reported in the repository for the held-out test set: 96.49 % accuracy, 91.67 % precision, 97.06 % recall, 94.29 % F1 and 98.97 % ROC-AUC (98.02 % training accuracy). These are offline evaluation figures on a public research data set — not clinical validation.',
      ],
    },
    technologies: ['Machine learning', 'Model evaluation', 'Python', 'Flask', 'REST API design'],
    seo: {
      title: 'Breast Tumor Diagnosis — KNN classifier and Flask API',
      description:
        'A K-nearest-neighbours classifier on the Wisconsin diagnostic data set (30 features) served through a Flask REST API, with reported offline evaluation metrics.',
    },
  },
  {
    slug: 'robot-obstacles-avoidance-system',
    summary:
      'Obstacle-aware robot navigation control: a 15-rule fuzzy inference system and a custom ANFIS that map obstacle distance and target angle to speed and turn.',
    provenance: 'verified',
    tier: 'flagship',
    featured: true,
    sortOrder: 60,
    schematic: 'kinematic',
    source: 'Public repository Robot_obstocle_AI_Powerd_Fuzzy_System (README: FIS, ANFIS, metrics).',
    sections: {
      description: [
        'An intelligent control system for autonomous robot navigation that decides speed and turning angle from the distance to the nearest obstacle and the angle to the target — implemented twice, as a rule-based fuzzy inference system and as an adaptive neuro-fuzzy inference system, so the two can be compared.',
      ],
      problem: [
        'Obstacle avoidance mixes competing goals — keep moving toward the target, slow down near obstacles, turn away without oscillating — that are hard to express as crisp thresholds. Fuzzy control expresses them as overlapping linguistic rules; the question is how far a learned controller can reproduce and smooth that behaviour.',
      ],
      intelligence: [
        'The fuzzy inference system maps distance (close, medium, far over 0–100 units) and angle (left, front, right over −90° to +90°) to speed (slow, medium, fast) and turn (left, straight, right) through 15 rules, triangular and Gaussian membership functions and centre-of-gravity defuzzification.',
        'The ANFIS is a custom implementation with three membership functions per input and nine rules, trained by gradient descent through input, fuzzification, rule, normalisation and output layers, and evaluated with 5-fold cross-validation.',
      ],
      architecture: [
        'A Python research implementation in a Jupyter notebook built on scikit-fuzzy, NumPy, scikit-learn and matplotlib, with test cases for close, medium and far obstacles and extreme angles, and plots of membership functions, training error and FIS-versus-ANFIS output.',
      ],
      results: [
        'As reported in the repository, the ANFIS reproduces the fuzzy controller with a speed RMSE of about 3.35 (R² 0.98) and a turn RMSE of about 13.2 (R² 0.92); 5-fold cross-validation gives a speed MAPE of about 7.4 % and a turn MAPE of about 29 %. The work is educational and research-oriented, not a deployed robot.',
      ],
    },
    technologies: [
      'Fuzzy logic',
      'Neuro-fuzzy systems (ANFIS)',
      'Neural networks',
      'Model evaluation',
      'Python',
    ],
    links: [{ label: 'Repository', url: REPO('Robot_obstocle_AI_Powerd_Fuzzy_System'), kind: 'repository' }],
    seo: {
      title: 'Robot obstacle avoidance — fuzzy and ANFIS control',
      description:
        'Fuzzy and ANFIS controllers that map obstacle distance and target angle to speed and turn, with cross-validated comparison — a Python research implementation.',
    },
  },
  {
    slug: 'yazanalsamman-com-portfolio-platform',
    title: 'yazanalsamman.com — Cinematic Portfolio Platform',
    summary:
      'This website: a bilingual, CMS-driven portfolio with a scroll-driven WebGL narrative, strict performance budgets, accessibility and SEO verification, and a containerised VPS deployment.',
    category: 'web',
    provenance: 'verified',
    tier: 'strong', // Phase 15: the clinic system took its flagship place
    featured: false,
    sortOrder: 70,
    schematic: 'browser',
    source: 'This repository (yazan-s-portfolio) and its phase reports (docs/reports).',
    sections: {
      description: [
        'The portfolio you are reading: a Next.js App Router site whose every word comes from a Payload CMS, with a scroll-driven 3D narrative — the Inference Core, neural graph, actuator and portrait — layered over server-rendered, crawlable HTML.',
      ],
      constraints: [
        'The 3D experience must never cost the reader: critical JavaScript is budgeted at 170 KB gzip and the lazily-loaded scene at 400 KB; idle and off-screen rendering must be zero; reduced-motion, Save-Data, low-memory and WebGL-less visitors get a complete static experience; Arabic must be first-class RTL but stays unpublished until a human review approves it.',
      ],
      architecture: [
        'Next.js (App Router, React Server Components) renders every page on the server from a typed content contract: a Payload CMS on PostgreSQL feeds a repository adapter, whose output is validated before any page sees it. The 3D scene is a separate, lazily imported React Three Fiber chunk behind a capability-based quality tier. Production runs as Docker containers behind Nginx with TLS, backups and a rehearsed restore.',
      ],
      decisions: [
        'Frames are rendered on demand — only while scroll progress changes — and every shader program is compiled in parallel before the first frame, which removed mid-scroll compile stalls. Content that matters is never only in WebGL: the H1, captions and portrait exist in HTML first.',
      ],
      results: [
        "Measured in the project's own verification runs: critical JavaScript about 165 KB gzip on the home page, the 3D scene about 253 KB gzip, zero draws while idle or off-screen, no frame over 33 ms in the scroll harness, zero axe WCAG violations across the audited routes, and an end-to-end suite of 164 passing tests.",
      ],
    },
    technologies: [
      'Next.js',
      'React',
      'TypeScript',
      'Payload CMS',
      'PostgreSQL',
      'Three.js / WebGL',
      'Tailwind CSS',
      'Docker',
      'Nginx',
      'Performance engineering',
      'Web accessibility',
      'Internationalization & RTL',
      'Automated testing',
    ],
    links: [{ label: 'Repository', url: REPO('yazan-s-portfolio'), kind: 'repository' }],
    seo: {
      title: 'Cinematic portfolio platform — Next.js, Payload, WebGL',
      description:
        'How this portfolio is engineered: Next.js server rendering, Payload CMS, an on-demand WebGL scene within strict budgets, accessibility and SEO checks, Docker deployment.',
    },
  },

  /* ----------------------------------------------- Strong ---------------------------------------- */
  {
    slug: 'saree-e-parts-delivery-platform',
    title: "Saree'e — Parts Delivery Dispatch Platform",
    summary:
      'A motorcycle-based automotive-parts delivery platform: dispatch, multi-order routing, driver capacity, live tracking, pricing and ledgers — designed through accepted ADRs, with a NestJS foundation.',
    category: 'software-engineering',
    provenance: 'verified',
    tier: 'strong',
    featured: false,
    sortOrder: 80,
    schematic: 'events',
    source: 'Public repository sari3 (README: status table, accepted ADRs, stack).',
    sections: {
      description: [
        "Saree'e connects automotive-parts merchants and mechanics with motorcycle delivery drivers and an operations team: dispatch, multi-order routing, driver capacity, live tracking, pricing, ratings, notifications and financial ledgers.",
      ],
      solution: [
        'Documentation first, architecture second, implementation third: product requirements, non-functional requirements, the domain model and the order lifecycle were written before code, and only accepted architecture decision records are binding. Unresolved business questions are marked explicitly rather than guessed.',
      ],
      architecture: [
        'Clean Architecture with domain, application, infrastructure and presentation separated; a REST API under `/api/v1`; NestJS with workers on Node.js and TypeScript; PostgreSQL through Prisma; Redis and BullMQ for asynchronous work. The backend is authoritative for order state, pricing, dispatch, ratings and finance; authentication, authorisation and resource scope are separate concerns.',
      ],
      results: [
        "As reported in the repository: critical ADRs are accepted, the NestJS backend's phase-1 foundation is complete with health verified, and a demo client is working; the Flutter mobile application is not implemented yet.",
      ],
    },
    technologies: [
      'NestJS',
      'TypeScript',
      'PostgreSQL',
      'Prisma',
      'Redis',
      'BullMQ',
      'System design & ADRs',
      'REST API design',
    ],
    links: [{ label: 'Repository', url: REPO('sari3'), kind: 'repository' }],
    seo: {
      title: "Saree'e — parts delivery dispatch platform",
      description:
        'A documentation-first dispatch platform for parts delivery: accepted ADRs, Clean Architecture, NestJS, Prisma, Redis and BullMQ.',
    },
  },
  {
    slug: 'student-management-distributed-system',
    summary:
      'A containerised Spring Cloud microservice system — API gateway, Eureka discovery, independent student and course services and Zipkin distributed tracing.',
    provenance: 'verified',
    tier: 'strong',
    featured: false,
    sortOrder: 90,
    source: 'Public repository Distributed-System-Student-Management (README).',
    sections: {
      description: [
        'A containerised microservice system for student and course management, built to demonstrate distributed-systems patterns: service discovery, an API gateway, inter-service communication and distributed tracing.',
      ],
      architecture: [
        'Java 21 services on Spring Boot 3.3 and Spring Cloud: a Spring Cloud Gateway routes `/api/students/**` and `/api/courses/**` to independent Student and Course services, which register with a Eureka service registry; Zipkin collects distributed traces; Docker Compose runs the whole topology with health checks.',
      ],
      decisions: [
        "The gateway gives clients one entry point while services stay independently deployable; discovery removes hard-coded addresses; tracing makes a request's path across services observable instead of reconstructed from separate logs.",
      ],
    },
    technologies: ['Spring Boot & Spring Cloud', 'Java', 'Microservices', 'REST API design', 'Docker'],
    seo: {
      title: 'Student Management — Spring Cloud microservices',
      description:
        'A containerised microservice system: Spring Cloud Gateway, Eureka discovery, independent services and Zipkin distributed tracing on Java 21.',
    },
  },
  {
    slug: 'project-hub-application',
    provenance: 'verified',
    tier: 'strong',
    featured: false,
    sortOrder: 100,
    source: 'Owner CMS text and public repository project-hub (README).',
    sections: {
      architecture: [
        'A cross-platform Flutter application (Android, iOS, web and desktop) for teams: project dashboards with status and progress, team members and assignments, task lists with filtering and sorting, productivity analytics and generated PDF reports, with multi-language support.',
      ],
    },
    technologies: ['Flutter', 'Dart'],
  },
  {
    slug: 'tabkha-and-more-digital-menu',
    title: 'Tabkha & More — Interactive Digital Menu and CMS',
    summary:
      'A bilingual interactive menu and restaurant CMS: React on Vite, a Hono API with Neon Postgres and Drizzle, session-authenticated admin, media uploads and a CI pipeline.',
    category: 'web',
    provenance: 'verified',
    tier: 'strong',
    featured: false,
    sortOrder: 110,
    schematic: 'browser',
    source: 'Public repository tabkha-menu (README).',
    sections: {
      description: [
        "A premium interactive digital menu for the restaurant Tabkha & More, reached by QR code, with a restaurant CMS at `/admin` for dishes, categories and photos. Brand colours, wordmarks and dish names come from the restaurant's own printed material.",
      ],
      architecture: [
        'React 19 and TypeScript on Vite with Tailwind CSS and Motion; a Hono API deployed on Vercel; Neon Postgres through Drizzle ORM; session-authenticated admin with media uploads to Vercel Blob; Arabic RTL and English LTR with Arabic as the default.',
      ],
      decisions: [
        "The public menu falls back to a bundled seed snapshot when the API is unavailable, so a QR scan never shows a blank screen. The seed inserts missing rows only and never overwrites the restaurant's own CMS edits.",
      ],
      results: [
        'GitHub Actions runs install, typecheck, lint, tests and build on every push to the production branch (as documented in the repository).',
      ],
    },
    technologies: [
      'React',
      'TypeScript',
      'Tailwind CSS',
      'PostgreSQL',
      'CI/CD',
      'Internationalization & RTL',
    ],
    links: [{ label: 'Repository', url: REPO('tabkha-menu'), kind: 'repository' }],
    seo: {
      title: 'Tabkha & More — bilingual digital menu and CMS',
      description:
        'A QR digital menu with an offline-safe fallback and a restaurant CMS: React, Hono, Neon Postgres, Drizzle and a CI pipeline.',
    },
  },
  {
    slug: 'services-provider-application',
    summary: 'An ASP.NET Core MVC platform that connects customers with home-service providers.',
    provenance: 'verified',
    tier: 'supporting',
    featured: false,
    sortOrder: 180,
    source: 'Public repository ServicesProvider (GitHub description).',
    sections: {
      description: [
        'An ASP.NET Core MVC web platform that connects customers with home-service providers — browsing providers and their services, and managing both sides of the relationship.',
      ],
    },
    technologies: ['ASP.NET'],
  },

  /* ---------------------------------------------- Concepts --------------------------------------- */
  {
    slug: 'concept-enterprise-rag-platform',
    title: 'Enterprise RAG Platform',
    summary:
      'Concept system — a retrieval-augmented generation platform: document ingestion, chunking, embeddings, hybrid retrieval, re-ranking and grounded answers with citations and evaluation.',
    category: 'artificial-intelligence',
    provenance: 'concept',
    tier: 'strong',
    featured: false,
    sortOrder: 120,
    schematic: 'pipeline',
    source:
      'Owner-approved concept (Phase 14). Extends the verified FAISS retrieval work of the AI project management system.',
    sections: {
      description: [
        "A design for question answering over an organisation's own documents: ingestion, hybrid retrieval, re-ranking and generation constrained to cite its sources, with an offline evaluation loop. It extends the FAISS retrieval used in the AI project management system to a document-grounded setting.",
      ],
      problem: [
        'Organisations want answers from their own documents, but a language model alone invents details and cannot cite sources. The system has to retrieve the right passages, keep answers inside that evidence, respect document permissions, and show the user where each claim came from.',
      ],
      architecture: [
        "Ingestion workers parse documents, split them into structure-aware chunks and write embeddings to a vector index next to a keyword index. A query is expanded, answered by hybrid retrieval (vector and keyword), re-ranked by a cross-encoder, filtered by the caller's permissions, and passed to the generator with a strict citation contract. Every step emits traces for an evaluation store.",
      ],
      intelligence: [
        'Embeddings for semantic recall, lexical scoring for exact terms and identifiers, a re-ranker for precision, and a generator constrained to cite retrieved chunks. An offline evaluation set measures retrieval recall and answer faithfulness before any change reaches users.',
      ],
      decisions: [
        'Permissions are enforced at retrieval time, not in the prompt; answers without supporting passages are refused rather than guessed; and the index is rebuilt from source documents, never edited in place.',
      ],
      results: [
        'Design objective: grounded answers with citations for every claim, measurable retrieval recall and faithfulness on a fixed evaluation set, and no document visible to a user who could not open it directly.',
      ],
    },
    technologies: [
      'Retrieval-augmented generation',
      'Large language models',
      'FAISS vector retrieval',
      'Asynchronous processing & queues',
      'PostgreSQL',
    ],
    seo: {
      title: 'Concept: Enterprise RAG Platform',
      description:
        'A concept system design: document ingestion, hybrid retrieval, re-ranking, permission-aware search and cited answers with offline evaluation.',
    },
  },
  {
    slug: 'concept-multi-agent-engineering-system',
    title: 'Multi-Agent Software Engineering System',
    summary:
      'Concept system — planner, researcher, implementer, tester and reviewer agents coordinated by a deterministic orchestrator with tool sandboxes, budgets and human checkpoints.',
    category: 'artificial-intelligence',
    provenance: 'concept',
    tier: 'strong',
    featured: false,
    sortOrder: 130,
    schematic: 'agents',
    source: 'Owner-approved concept (Phase 14).',
    sections: {
      description: [
        'A design for coordinating several narrowly scoped language-model agents on one engineering change, with a deterministic orchestrator that owns the plan, the state and every transition between steps.',
      ],
      problem: [
        'Single-prompt coding assistants lose track of large changes. Engineering work has distinct phases — understanding, planning, implementing, verifying, reviewing — and each benefits from a different context and a different definition of done.',
      ],
      architecture: [
        "A deterministic orchestrator owns the task graph: a planner decomposes the goal into steps, a researcher gathers repository context, an implementer proposes changes in a sandboxed workspace, a tester runs the project's own checks, and a reviewer judges the diff against the plan. State lives in the orchestrator, not in agent memory, so any step can be replayed.",
      ],
      intelligence: [
        'Language-model agents with narrow roles and tool permissions; the orchestrator — not a model — decides transitions, retries and termination from test results and budgets.',
      ],
      decisions: [
        'Agents never merge their own work: a failing check or a reviewer rejection sends the step back, and consequential actions stop at a human checkpoint. Token and time budgets are enforced per step.',
      ],
      results: [
        "Design objective: every accepted change is traceable to a plan step, passes the repository's own quality gates, and can be replayed from recorded state.",
      ],
    },
    technologies: [
      'AI agents & multi-agent orchestration',
      'Large language models',
      'Asynchronous processing & queues',
      'Automated testing',
    ],
    seo: {
      title: 'Concept: Multi-Agent Software Engineering System',
      description:
        'A concept design for planner, researcher, implementer, tester and reviewer agents under a deterministic orchestrator with sandboxes and human checkpoints.',
    },
  },
  {
    slug: 'concept-vision-inspection-pipeline',
    title: 'Vision Inspection Pipeline',
    summary:
      'Concept system — a computer-vision inspection pipeline: acquisition, preprocessing, detection, classification, confidence gating and human review, with auditable reports.',
    category: 'computer-vision',
    provenance: 'concept',
    tier: 'strong',
    featured: false,
    sortOrder: 140,
    schematic: 'vision',
    source: 'Owner-approved concept (Phase 14).',
    sections: {
      description: [
        'A design for automated visual inspection that knows when it is unsure: detection and classification models behind a calibrated confidence gate, with human review for everything below it.',
      ],
      problem: [
        'Visual inspection is repetitive and inconsistent between people, but a model that is silently wrong is worse than a slow human. The pipeline has to detect defects, know when it is unsure, and leave an auditable record of every decision.',
      ],
      architecture: [
        'Image acquisition feeds a preprocessing stage (normalisation, alignment); a detector proposes regions, a classifier labels them, and a confidence gate routes low-confidence items to a human reviewer whose decisions are stored as new labelled data. Results, images and model versions are written to an inspection report store.',
      ],
      intelligence: [
        'A detection model for localisation and a classifier for defect type, each versioned; calibration of confidence thresholds on held-out data decides what the system may accept without review.',
      ],
      results: [
        'Design objective: no automated accept below a calibrated confidence threshold, every decision traceable to an image and a model version, and reviewer corrections feeding the next training set.',
      ],
    },
    technologies: ['Computer vision', 'Model evaluation', 'Python', 'Asynchronous processing & queues'],
    seo: {
      title: 'Concept: Vision Inspection Pipeline',
      description:
        'A concept design for computer-vision inspection with calibrated confidence gating, human-in-the-loop review and auditable reports.',
    },
  },
  {
    slug: 'concept-llm-observability-platform',
    title: 'LLM Observability & Evaluation Platform',
    summary:
      'Concept system — tracing, latency and token accounting, evaluation suites and failure analysis for production LLM features, built on an event pipeline.',
    category: 'artificial-intelligence',
    provenance: 'concept',
    tier: 'strong',
    featured: false,
    sortOrder: 150,
    schematic: 'events',
    source: 'Owner-approved concept (Phase 14).',
    sections: {
      description: [
        'A design for making production LLM features observable: per-call traces, cost and latency accounting, and evaluation suites that gate prompt and model changes.',
      ],
      problem: [
        'LLM features fail in ways ordinary monitoring does not see: a response can be fast, cheap and wrong. Teams need to know which prompt and model version produced an answer, what it cost, and whether quality moved after a change.',
      ],
      architecture: [
        'Applications emit spans for every model call — prompt template, model version, retrieved context, latency and token counts — into an event stream; workers aggregate them into a trace store and time series. An evaluation service replays fixed datasets against candidate prompts or models and compares scores before rollout.',
      ],
      intelligence: [
        'Rule-based checks and model-graded evaluations over curated datasets; clustering of failed traces to surface recurring failure modes.',
      ],
      results: [
        'Design objective: every production answer traceable to its prompt, model and context; cost and latency visible per feature; and no prompt or model change released without an evaluation comparison.',
      ],
    },
    technologies: [
      'LLM evaluation & observability',
      'Large language models',
      'Asynchronous processing & queues',
      'PostgreSQL',
    ],
    seo: {
      title: 'Concept: LLM Observability & Evaluation Platform',
      description:
        'A concept design for tracing LLM calls, accounting latency and tokens, and gating prompt or model changes on evaluation results.',
    },
  },

  /* --------------------------------------------- Supporting -------------------------------------- */
  {
    slug: 'car-renting-application',
    provenance: 'verified',
    tier: 'supporting',
    featured: false,
    sortOrder: 170,
    source: 'Owner CMS; GitHub language (Dart).',
    technologies: ['Dart'],
  },
  {
    slug: 'fitness-mobile-application',
    provenance: 'verified',
    tier: 'supporting',
    featured: false,
    sortOrder: 190,
    source: 'Owner CMS; GitHub language (Dart).',
    technologies: ['Dart'],
  },
  {
    slug: 'taxi-elite-application',
    provenance: 'verified',
    tier: 'supporting',
    featured: false,
    sortOrder: 200,
    source: 'Owner CMS.',
  },
  {
    slug: 'smarthome-mobile-application',
    provenance: 'verified',
    tier: 'supporting',
    featured: false,
    sortOrder: 210,
    source: 'Owner CMS.',
  },
  {
    slug: 'system-management',
    provenance: 'verified',
    tier: 'supporting',
    featured: false,
    sortOrder: 220,
    source: 'Owner CMS.',
  },
  {
    slug: 'basic-online-e-commerce-platform',
    provenance: 'verified',
    tier: 'supporting',
    featured: false,
    sortOrder: 230,
    source: 'Owner CMS (training exercise).',
  },
  {
    slug: 'basic-university-management-system',
    provenance: 'verified',
    tier: 'supporting',
    featured: false,
    sortOrder: 240,
    source: 'Owner CMS (training exercise).',
  },
  {
    slug: 'basic-python-compiler',
    provenance: 'verified',
    tier: 'supporting',
    featured: false,
    sortOrder: 250,
    source: 'Owner CMS.',
    technologies: ['Python'],
  },
];
