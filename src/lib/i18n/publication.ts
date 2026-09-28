import { routing, type Locale } from '@/i18n/routing';
import { env } from '@/lib/env';
import { getProfile } from '@/content/repository';
import { computePublicationBlockers } from './publishability';

/**
 * Server-side locale publication gate (reads the CMS through the repository).
 * Unpublishable locales still render in development/preview, but are `noindex`, omitted from
 * hreflang and the sitemap, hidden from the language switcher and return 404 in production.
 */
export async function localePublicationBlockers(locale: Locale): Promise<string[]> {
  const profile = await getProfile(locale);
  return computePublicationBlockers(locale, { hasApprovedProfile: profile !== null });
}

export async function isLocalePublishable(locale: Locale): Promise<boolean> {
  return (await localePublicationBlockers(locale)).length === 0;
}

export async function publishableLocales(): Promise<Locale[]> {
  const flags = await Promise.all(routing.locales.map(isLocalePublishable));
  return routing.locales.filter((_, i) => flags[i]);
}

/** Locales that may be served/offered: all outside production, publishable ones in production. */
export async function availableLocales(): Promise<Locale[]> {
  return env.isProduction ? publishableLocales() : [...routing.locales];
}

export async function isLocaleAvailable(locale: Locale): Promise<boolean> {
  return !env.isProduction || isLocalePublishable(locale);
}
