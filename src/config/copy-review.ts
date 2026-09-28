import type { Locale } from '@/i18n/routing';

/**
 * Editorial review state of each locale's UI/metadata copy.
 *
 * I18N_AND_LOCALIZATION ("no machine-generated Arabic without review for important professional
 * copy") and SEO_MASTER §20 ("do not create Arabic pages by machine-translating metadata without
 * review") make human review a publication requirement for Arabic. The Arabic catalog
 * (messages/ar.json) and the Arabic portrait alt text were drafted by the implementation agent
 * and have NOT been reviewed. Only the owner-supplied identity (name + title) is confirmed.
 *
 * Set `status: 'approved'` ONLY when a real, owner-appointed reviewer has reviewed the copy,
 * and record who and when. Never mark approved on the agent's own judgement.
 *
 * Review workflow (Phase 7) — what the reviewer checks before approval:
 *   1. messages/ar.json (all UI, metadata and cinematic copy) — natural Arabic, correct terms;
 *   2. the Arabic home description and page descriptions (search results and share previews);
 *   3. the Arabic share image (src/assets/share/share-ar.png: confirmed name + title only);
 *   4. RTL rendering of every public page on desktop and mobile.
 * CMS content has its own per-document review (Translation status → Approved).
 * The gate requires `reviewer` and `reviewedOn` (YYYY-MM-DD); "approved" without them is
 * ignored. When approved, `/ar` goes live in production on the next deployment: hreflang,
 * sitemap, language switcher and indexing follow automatically.
 */
export type CopyReview = {
  status: 'approved' | 'pending';
  reviewer: string | null;
  reviewedOn: string | null;
};

export const copyReview: Partial<Record<Locale, CopyReview>> = {
  // English copy is original (not a translation); no translation-review gate applies.
  ar: { status: 'pending', reviewer: null, reviewedOn: null }, // D-9: pending owner-provided reviewer
};
