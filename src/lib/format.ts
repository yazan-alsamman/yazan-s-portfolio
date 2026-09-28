import type { Locale } from '@/i18n/routing';

/**
 * ADR-006: dates via Intl.DateTimeFormat per locale; Western Arabic digits (0–9) in both
 * locales (`-u-nu-latn`), consistent with technical content. Dates are CMS `date` values
 * (month precision in the editor) and are formatted in UTC so a month never shifts by timezone.
 */
const TAG: Record<Locale, string> = { en: 'en-GB', ar: 'ar-u-nu-latn' };

export function formatMonthYear(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(TAG[locale], { year: 'numeric', month: 'short', timeZone: 'UTC' }).format(
    new Date(iso),
  );
}

export function formatYear(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(TAG[locale], { year: 'numeric', timeZone: 'UTC' }).format(new Date(iso));
}

/** Precision of a stored date: the month is known, or only the year (e.g. "2021 – 2025"). */
export type DatePrecision = 'month' | 'year';

/**
 * "Mar 2022 – Present" / "Mar 2022 – Jun 2024" / "Mar 2022"; with `precision: 'year'`,
 * "2021 – 2025" — a month the source never stated is never displayed. `present` is localized.
 */
export function formatPeriod(
  start: string | null,
  end: string | null,
  locale: Locale,
  present: string | null,
  precision: DatePrecision = 'month',
): string | null {
  const fmt = precision === 'year' ? formatYear : formatMonthYear;
  if (!start && !end) return null;
  if (start && !end) return present ? `${fmt(start, locale)} – ${present}` : fmt(start, locale);
  if (!start) return fmt(end!, locale);
  return `${fmt(start, locale)} – ${fmt(end!, locale)}`;
}

/** Machine-readable date for <time dateTime>. */
export function isoDay(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}
