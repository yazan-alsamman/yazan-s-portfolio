import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import type { ContentRouteKey } from '@/content/types';
import { getProfile, getRouteAvailability } from '@/content/repository';
import { OWNER_INPUT_PLACEHOLDER } from '@/i18n/messages';
import { publishableLocales } from '@/lib/i18n/publication';
import { localesWithRoute } from '@/lib/route-gate';
import { buildPageMetadata } from './metadata';

/** Identity used in page copy and metadata (CMS Profile, no cross-locale fallback). */
export async function pageIdentity(locale: Locale) {
  const profile = await getProfile(locale);
  return { name: profile?.name ?? OWNER_INPUT_PLACEHOLDER, title: profile?.title ?? OWNER_INPUT_PLACEHOLDER };
}

/**
 * Metadata for a content route (About, Projects, …): localized title + description built from
 * the confirmed identity, self-canonical, hreflang only to locales where the page exists,
 * and `noindex` whenever the route has no content (development/preview only — production 404s).
 */
export async function contentRouteMetadata(locale: Locale, key: ContentRouteKey): Promise<Metadata> {
  const [t, identity, available, publishable] = await Promise.all([
    getTranslations({ locale, namespace: `pages.${key}` }),
    pageIdentity(locale),
    getRouteAvailability(locale),
    publishableLocales(),
  ]);
  return buildPageMetadata({
    locale,
    path: `/${key}`,
    title: t('title'),
    description: t('description', identity),
    noindex: !available[key],
    availableIn: await localesWithRoute(key, publishable),
  });
}
