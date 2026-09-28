import { notFound } from 'next/navigation';
import type { Locale } from '@/i18n/routing';
import type { ContentRouteKey } from '@/content/types';
import { getRouteAvailability } from '@/content/repository';
import { env } from '@/lib/env';

/**
 * Content-route gate (IA §0). A page whose content set is empty is not published:
 * production → 404 (and it is absent from navigation and the sitemap); development → the page
 * renders with a visible "no published content" notice so the architecture can be reviewed.
 * Returns whether the route currently has content.
 */
export async function gateContentRoute(locale: Locale, key: ContentRouteKey): Promise<boolean> {
  const available = (await getRouteAvailability(locale))[key];
  if (!available && env.isProduction) notFound();
  return available;
}

/** Locales in which a content route exists (hreflang must only pair existing pages). */
export async function localesWithRoute(key: ContentRouteKey, locales: readonly Locale[]): Promise<Locale[]> {
  const flags = await Promise.all(locales.map(async (l) => (await getRouteAvailability(l))[key]));
  return locales.filter((_, i) => flags[i]);
}
