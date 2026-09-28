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
