import type { Locale } from '@/i18n/routing';
import { primaryNav } from '@/config/navigation';
import { getProjects, getRouteAvailability } from '@/content/repository';
import { env } from '@/lib/env';

/**
 * Server side of the page-aware language switcher (R-47): for each offered locale, the pages
 * that exist there — exactly the pages that locale would serve instead of a 404:
 *   - home;
 *   - content routes with published content (outside production every content route renders,
 *     with a development notice, so it exists there);
 *   - published projects in that locale (per-locale content: an English-only project has no
 *     Arabic page);
 *   - the design-system preview where it is enabled (never in production).
 * Unpublishable locales are never offered (the switcher only receives `availableLocales()`).
 */
export async function existingPathsByLocale(
  locales: readonly Locale[],
): Promise<Partial<Record<Locale, string[]>>> {
  const entries = await Promise.all(
    locales.map(async (locale) => {
      const [available, projects] = await Promise.all([getRouteAvailability(locale), getProjects(locale)]);
      const routes = primaryNav
        .filter((item) => item.key === 'home' || available[item.key] || !env.isProduction)
        .map((item) => item.href as string);
      const paths = [
        ...routes,
        ...projects.map((p) => `/projects/${p.slug}`),
        ...(env.designPreview ? ['/design-system'] : []),
      ];
      return [locale, paths] as const;
    }),
  );
  return Object.fromEntries(entries);
}
