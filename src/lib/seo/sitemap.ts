import type { MetadataRoute } from 'next';
import type { Locale } from '@/i18n/routing';
import type { RouteAvailability } from '@/content/types';
import { getLiveRoutes } from '@/config/navigation';
import { canonicalUrl, languageAlternates } from './urls';

export type LocaleContent = {
  locale: Locale;
  available: RouteAvailability;
  projects: { slug: string; updatedAt: string }[];
};

/**
 * Pure sitemap assembly (SEO_MASTER §17). Input: only publishable locales and only their public
 * content. Every URL is canonical and indexable, and its hreflang alternates list exactly the
 * locales where that same page exists (an English-only project never advertises an Arabic twin).
 */
export function buildSitemap(siteUrl: string, content: LocaleContent[]): MetadataRoute.Sitemap {
  const pages = new Map<string, { locales: Locale[]; lastModified?: string }>();
  const add = (path: string, locale: Locale, lastModified?: string) => {
    const entry = pages.get(path) ?? { locales: [] };
    entry.locales.push(locale);
    if (lastModified && (!entry.lastModified || lastModified > entry.lastModified)) {
      entry.lastModified = lastModified;
    }
    pages.set(path, entry);
  };
  for (const { locale, available, projects } of content) {
    for (const path of getLiveRoutes(available)) add(path, locale);
    for (const project of projects) add(`/projects/${project.slug}`, locale, project.updatedAt);
  }
  return [...pages.entries()].flatMap(([path, { locales, lastModified }]) =>
    locales.map((locale) => ({
      url: canonicalUrl(siteUrl, locale, path),
      ...(lastModified ? { lastModified } : {}),
      alternates: { languages: languageAlternates(siteUrl, path, locales) },
    })),
  );
}
