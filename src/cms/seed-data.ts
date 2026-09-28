/**
 * Owner-confirmed identity — the ONLY content the seed writes (docs/content/OWNER_PROFILE.md).
 * Replaces the Phase 1 seam `src/config/profile.ts` as seed input; at runtime the CMS Profile
 * global is the source of truth (ADR-017). Never add facts here without owner confirmation.
 */
export const confirmedIdentity = {
  name: { en: 'Yazan Al Samman', ar: 'يزن السمان' },
  title: { en: 'Artificial Intelligence Engineer', ar: 'مهندس ذكاء صنعي' },
  sourceNote: 'Owner-confirmed identity (OWNER_PROFILE.md, D-6 for the Arabic title), 2026-09-27.',
} as const;
