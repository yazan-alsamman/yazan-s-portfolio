/**
 * Owner-confirmed portfolio decisions (2026-09-28) — applied on top of the legacy migration by
 * `pnpm cms:apply-owner` (after `pnpm cms:import-legacy`). This is OWNER data, kept apart from the
 * legacy-site data (src/cms/legacy/legacy-content.ts): where they differ, the owner wins.
 * Recorded in docs/content/OWNER_PROFILE.md. Nothing here is inferred; unstated facts (dates,
 * employers, metrics) are deliberately absent. English only — Arabic stays gated.
 */

export const OWNER_DECISIONS_DATE = '2026-09-28';

export const ownerProfile = {
  /** Official public email chosen by the owner (resolves the legacy two-email conflict). */
  email: 'yazanalsaamman@gmail.com',
  /**
   * Public profiles, in display order. GitHub: legacy (validated HTTP 200). LinkedIn: owner-supplied
   * URL without its Android share parameters (LinkedIn blocks automated checks; the owner verified
   * it). Instagram: the legacy site's profile link without its `igsh` share parameter (owner: yes).
   * Facebook: owner decision NO — never published.
   */
  socialLinks: [
    { network: 'github' as const, url: 'https://github.com/yazan-alsamman' },
    { network: 'linkedin' as const, url: 'https://www.linkedin.com/in/yazan-alsamman-7541a434' },
    { network: 'instagram' as const, url: 'https://www.instagram.com/yazan_al_samman' },
  ],
};

/**
 * Experience, from the owner's statements only: "more than 4 years of experience in the labor
 * market, including systems analysis, requirements analysis, and building solutions using
 * appropriate technology" and "CTO of VegaCORE". No dates were given, so none are stored
 * (the start date is optional; no period is displayed).
 */
export const ownerExperience = [
  {
    organization: 'VegaCORE',
    title: 'Chief Technology Officer (CTO)',
    description: [
      'More than four years of professional experience in the technology market, with a focus on systems analysis, requirements analysis, evaluating appropriate technologies, and designing and building technology solutions.',
      'Currently serving as Chief Technology Officer at VegaCORE.',
    ],
  },
];

/** Education correction (overrides the legacy institution and dates). Year only — no month. */
export const ownerEducation = {
  /** Matches the migrated record by degree (the degree itself is unchanged). */
  degree: 'Bachelor of Information Technology',
  institution: 'Arab International University (AIU)',
  graduationYear: 2026,
};

/** The owner authorised publishing the 28 migrated certificates without certificate files. */
export const publishCertificatesWithoutFiles = true;

/** The owner wants the CV published as web content without a file (no PDF is fabricated). */
export const publishWebCv = true;

/* -------------------------------------------------------------------------------------------- *
 * Phase 13 — owner-approved content authority decisions (2026-09-29, approved by the owner in
 * the Phase 13 working session; docs/reports/PHASE_13_CONTENT_REVIEW.md). Every statement below
 * is sourced from content the owner had already published in the CMS; nothing is new fact.
 * -------------------------------------------------------------------------------------------- */

export const PHASE13_DECISIONS_DATE = '2026-09-29';

/**
 * Profile short bio (replaces "Dedicated and detail-oriented developer … mobile and web
 * applications …"). Sources: Profile title; Experience (CTO, VegaCORE); project texts — AI project
 * management architecture (LLM task generation, greedy assignment), Breast Tumor Diagnosis
 * ("AI-powered medical diagnosis tool"), Robot Obstacles Avoidance ("fuzzy system and neural
 * networks"), and the full-stack architecture of the AI project management system.
 */
export const ownerShortBio =
  'Artificial Intelligence Engineer and CTO at VegaCORE. I build intelligent systems — LLM-driven task generation and assignment, AI-assisted medical diagnosis, and fuzzy-logic and neural-network robot navigation — together with the software infrastructure around them.';

type OwnerSkill = {
  name: string;
  category: 'ai-ml' | 'backend' | 'frontend' | 'databases';
  displayOrder: number;
  /** Where the owner's own published text names it. */
  source: string;
};

const AI_PM = 'ai-intelligence-project-management-system';
const ROBOT = 'robot-obstacles-avoidance-system';
const AI_PM_ARCH = 'AI Intelligence Project Management System — architecture text';

/** AI techniques named in the owner's project texts (created only if missing; never ratings). */
export const ownerAiSkills: OwnerSkill[] = [
  {
    name: 'Large language models',
    category: 'ai-ml',
    displayOrder: 1,
    source: `${AI_PM_ARCH} (Groq API, Mistral 7B, Qwen 2.5)`,
  },
  {
    name: 'Neural networks',
    category: 'ai-ml',
    displayOrder: 2,
    source: `${AI_PM_ARCH} (custom neural network); Robot Obstacles Avoidance title/summary`,
  },
  {
    name: 'Fuzzy logic',
    category: 'ai-ml',
    displayOrder: 3,
    source: 'Robot Obstacles Avoidance System — title/summary ("fuzzy system")',
  },
  {
    name: 'FAISS vector retrieval',
    category: 'ai-ml',
    displayOrder: 4,
    source: `${AI_PM_ARCH} (FAISS retrieval system)`,
  },
  {
    name: 'Expert systems',
    category: 'ai-ml',
    displayOrder: 5,
    source: `${AI_PM_ARCH} (expert system for task classification)`,
  },
  {
    name: 'Algorithm design',
    category: 'ai-ml',
    displayOrder: 6,
    source: `${AI_PM_ARCH} (greedy algorithm for optimal task assignment)`,
  },
];

/** Technologies named in the AI project management architecture text ("Key technologies: …"). */
export const ownerTechnologies: OwnerSkill[] = [
  { name: 'Node.js', category: 'backend', displayOrder: 140, source: AI_PM_ARCH },
  { name: 'Express.js', category: 'backend', displayOrder: 150, source: AI_PM_ARCH },
  { name: 'FastAPI', category: 'backend', displayOrder: 160, source: AI_PM_ARCH },
  { name: 'MongoDB', category: 'databases', displayOrder: 170, source: AI_PM_ARCH },
  { name: 'Next.js', category: 'frontend', displayOrder: 180, source: AI_PM_ARCH },
  { name: 'React', category: 'frontend', displayOrder: 190, source: AI_PM_ARCH },
];

/**
 * Project → technologies, in display order (techniques first). Existing links are kept; these are
 * added. A project's technologies are what makes it appear as a skill's evidence.
 */
export const ownerProjectTechnologies: Record<string, string[]> = {
  [AI_PM]: [
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
  ],
  [ROBOT]: ['Fuzzy logic', 'Neural networks'],
};
