import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import { getProjects, getRouteAvailability } from '@/content/repository';
import { publishableLocales } from '@/lib/i18n/publication';
import { buildSitemap } from '@/lib/seo/sitemap';

/**
 * SEO_MASTER §17. Only canonical, indexable URLs: live routes (routes with published content)
 * and published projects, for publishable locales only (Arabic stays out while its copy review
 * is pending). Revalidated with the CMS content it reads (tagged repository cache).
 */
/** R-45: bounded staleness, as the pages (src/app/[locale]/layout.tsx). */
export const revalidate = 1800;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = await publishableLocales();
  const content = await Promise.all(
    locales.map(async (locale) => ({
      locale,
      available: await getRouteAvailability(locale),
      projects: await getProjects(locale),
    })),
  );
  return buildSitemap(env.siteUrl, content);
}
