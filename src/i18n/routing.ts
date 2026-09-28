import { defineRouting } from 'next-intl/routing';

/**
 * ADR-006 — English at `/`, Arabic at `/ar/...`.
 * - `as-needed`: the default locale has no prefix; `/en/...` redirects to `/...`.
 * - No Accept-Language / cookie detection: `/` is always English, so crawlers
 *   and users get stable, predictable URLs. Switching language is explicit.
 */
export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: false,
  localeCookie: false,
  alternateLinks: false, // hreflang is emitted by our own metadata layer (src/lib/seo)
});

export type Locale = (typeof routing.locales)[number];

export const localeDirection: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
};
