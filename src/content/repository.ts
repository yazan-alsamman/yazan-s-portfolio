import { unstable_cache } from 'next/cache';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Locale } from '@/i18n/routing';
import { CMS_TAG_ALL, cmsTag } from './cache-tags';
import { dataSourceScope } from './cache-scope';
import {
  fetchCertificates,
  fetchCv,
  fetchEducation,
  fetchExperience,
  fetchHomeSectionAvailability,
  fetchProfile,
  fetchProjectBySlug,
  fetchProjects,
  fetchRedirect,
  fetchRouteAvailability,
  fetchSiteSettings,
  fetchSkills,
} from './payload-adapter';

/**
 * Public content repository — the only entry point pages/components use for CMS data.
 * Server-only (it imports the Payload Local API; importing it into a client component would
 * fail the build). Results are cached with tags; CMS publishes revalidate exactly those tags
 * (src/cms/hooks.ts), so pages stay statically generated and update on publish.
 */

const payload = () => getPayload({ config });

/** Keys are scoped to the data source: an entry cached from another database is never reused (R-60). */
const scope = dataSourceScope();

/**
 * R-45: publishes revalidate by tag immediately; this window only bounds how long a lost
 * invalidation (kept in memory by Next, so gone after a restart) can keep data stale.
 * Pages use the same window (`revalidate` in src/app/[locale]/layout.tsx and sitemap.ts).
 */
export const CMS_REVALIDATE_SECONDS = 1800;

const cached = <A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string, sources: string[]) =>
  unstable_cache(fn, [key, scope], {
    tags: [...sources.map(cmsTag), CMS_TAG_ALL],
    revalidate: CMS_REVALIDATE_SECONDS,
  });

export const getProfile = cached(
  async (locale: Locale) => fetchProfile({ payload: await payload(), locale }),
  'profile',
  ['profile', 'media'],
);

export const getSiteSettings = cached(
  async (locale: Locale) => fetchSiteSettings({ payload: await payload(), locale }),
  'site-settings',
  ['site-settings', 'media'],
);

export const getProjects = cached(
  async (locale: Locale) => fetchProjects({ payload: await payload(), locale }),
  'projects',
  ['projects', 'skills', 'media'],
);

export const getProjectBySlug = cached(
  async (locale: Locale, slug: string) => fetchProjectBySlug({ payload: await payload(), locale }, slug),
  'project-by-slug',
  ['projects', 'skills', 'media'],
);

export const getRedirect = cached(async (path: string) => fetchRedirect(await payload(), path), 'redirect', [
  'redirects',
]);

export const getCv = cached(async (locale: Locale) => fetchCv({ payload: await payload(), locale }), 'cv', [
  'cv',
  'documents',
]);

export const getExperience = cached(
  async (locale: Locale) => fetchExperience({ payload: await payload(), locale }),
  'experience',
  ['experience', 'skills', 'projects'],
);

export const getEducation = cached(
  async (locale: Locale) => fetchEducation({ payload: await payload(), locale }),
  'education',
  ['education', 'documents'],
);

export const getCertificates = cached(
  async (locale: Locale) => fetchCertificates({ payload: await payload(), locale }),
  'certificates',
  ['certificates', 'media', 'documents'],
);

export const getSkills = cached(
  async (locale: Locale) => fetchSkills({ payload: await payload(), locale }),
  'skills',
  ['skills', 'projects'],
);

/** Every source a public page's existence depends on (navigation, sitemap, route gating). */
const ROUTE_SOURCES = [
  'profile',
  'projects',
  'skills',
  'experience',
  'certificates',
  'cv',
  'media',
  'documents',
];

export const getRouteAvailability = cached(
  async (locale: Locale) => fetchRouteAvailability({ payload: await payload(), locale }),
  'route-availability',
  ROUTE_SOURCES,
);

export const getHomeSectionAvailability = cached(
  async (locale: Locale) => fetchHomeSectionAvailability({ payload: await payload(), locale }),
  'home-sections',
  ROUTE_SOURCES,
);
