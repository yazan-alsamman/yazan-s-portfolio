import { routing, type Locale } from '@/i18n/routing';

/**
 * URL utilities — ADR-006/011. English at `/`, Arabic at `/ar/...`.
 * All absolute URLs derive from SITE_URL; nothing else may hard-code an origin.
 */

/** Locale-prefixed path for a route (`/about` → `/ar/about`, `/` → `/ar`). */
export function localizedPath(locale: Locale, path: string): string {
  const clean = normalizePath(path);
  if (locale === routing.defaultLocale) return clean;
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`;
}

/** Absolute URL for a path on the configured origin (SITE_URL is validated to have no trailing slash). */
export function absoluteUrl(siteUrl: string, path: string): string {
  const clean = normalizePath(path);
  return clean === '/' ? siteUrl : `${siteUrl}${clean}`;
}

/** Canonical URL: HTTPS origin + localized path, no query, no trailing slash (except none at root). */
export function canonicalUrl(siteUrl: string, locale: Locale, path: string): string {
  return absoluteUrl(siteUrl, localizedPath(locale, path));
}

/**
 * hreflang alternates for a route. Only locales whose content is publishable are included
 * (ADR-006: an incomplete Arabic page is not advertised). `x-default` → English.
 */
export function languageAlternates(
  siteUrl: string,
  path: string,
  publishableLocales: readonly Locale[],
): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of routing.locales) {
    if (publishableLocales.includes(locale)) alternates[locale] = canonicalUrl(siteUrl, locale, path);
  }
  if (publishableLocales.includes(routing.defaultLocale)) {
    alternates['x-default'] = canonicalUrl(siteUrl, routing.defaultLocale, path);
  }
  return alternates;
}

function normalizePath(path: string): string {
  const withoutQuery = path.split(/[?#]/)[0] ?? '/';
  const leading = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  const trimmed = leading.length > 1 ? leading.replace(/\/+$/, '') : leading;
  return trimmed.toLowerCase();
}
