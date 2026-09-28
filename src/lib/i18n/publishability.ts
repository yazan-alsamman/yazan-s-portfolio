import { findPlaceholders, messagesByLocale } from '@/i18n/messages';
import type { Locale } from '@/i18n/routing';
import { copyReview, type CopyReview } from '@/config/copy-review';

/**
 * ADR-006 "no silent fallback" — the locale publication gate (pure part).
 *
 * A locale is publishable only when ALL hold:
 *   1. its UI catalog contains no owner-input placeholders,
 *   2. its identity (CMS Profile: name + title) is published and approved in that locale,
 *   3. its copy review — where one is required (Arabic) — is approved by a named reviewer on a
 *      recorded date (src/config/copy-review.ts).
 *
 * The CMS-dependent input (2) is supplied by src/lib/i18n/publication.ts (server-only).
 */
export function computePublicationBlockers(locale: Locale, input: { hasApprovedProfile: boolean }): string[] {
  const blockers = findPlaceholders(messagesByLocale[locale]);
  if (!input.hasApprovedProfile) blockers.push('profile');
  if (!isCopyReviewComplete(copyReview[locale])) blockers.push('copyReview');
  return blockers;
}

/**
 * The human-review record (D-9): no review required → complete; otherwise complete only when it
 * is approved AND names the reviewer and the review date (ISO `YYYY-MM-DD`). An "approved"
 * without a named reviewer is treated as not reviewed.
 */
export function isCopyReviewComplete(review: CopyReview | undefined): boolean {
  if (!review) return true;
  return (
    review.status === 'approved' &&
    Boolean(review.reviewer?.trim()) &&
    /^\d{4}-\d{2}-\d{2}$/.test(review.reviewedOn ?? '')
  );
}
