import type { ContentRouteKey, RouteAvailability } from '@/content/types';

/**
 * Public information architecture (docs/architecture/INFORMATION_ARCHITECTURE.md §1–3).
 *
 * A content route is *live* only when the CMS holds verified, published, locale-approved
 * content for it (RouteAvailability, computed by the content repository). Production lists
 * live routes only — no link may point at a page without content, and empty pages are not
 * published (IA §0, SEO-05). Development also lists unavailable routes so the architecture
 * stays visible while content is pending (those pages render a development-only notice).
 */
export type NavKey = 'home' | ContentRouteKey;

export type NavItem = {
  key: NavKey;
  href: `/${string}`;
  /** Shown in the compact desktop header (footer and menu always list everything live). */
  inHeader: boolean;
};

export const primaryNav: readonly NavItem[] = [
  { key: 'home', href: '/', inHeader: false },
  { key: 'projects', href: '/projects', inHeader: true },
  { key: 'about', href: '/about', inHeader: true },
  { key: 'experience', href: '/experience', inHeader: true },
  { key: 'skills', href: '/skills', inHeader: false },
  { key: 'certificates', href: '/certificates', inHeader: true },
  { key: 'cv', href: '/cv', inHeader: true },
  { key: 'contact', href: '/contact', inHeader: true },
];

export const NO_ROUTES: RouteAvailability = {
  about: false,
  projects: false,
  experience: false,
  skills: false,
  certificates: false,
  cv: false,
  contact: false,
};

export function isLive(key: NavKey, available: RouteAvailability): boolean {
  return key === 'home' || available[key];
}

export function getPrimaryNav({
  available,
  includeUnavailable,
}: {
  available: RouteAvailability;
  includeUnavailable: boolean;
}): NavItem[] {
  return primaryNav.filter((item) => includeUnavailable || isLive(item.key, available));
}

/** Indexable static routes (sitemap source; project detail URLs are added from the CMS). */
export function getLiveRoutes(available: RouteAvailability): `/${string}`[] {
  return primaryNav.filter((item) => isLive(item.key, available)).map((item) => item.href);
}
