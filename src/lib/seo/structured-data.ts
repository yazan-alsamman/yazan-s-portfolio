import type { Locale } from '@/i18n/routing';
import { canonicalUrl } from './urls';

/**
 * JSON-LD built exclusively from confirmed, published CMS fields (SEO_MASTER §21–23, ADR-017).
 * Pure: callers pass the facts (from the content repository). Emitted only when present:
 *   jobTitle — the locale's approved title (never another language's),
 *   sameAs   — owner-confirmed social profiles,
 *   knowsAbout — published verified skill names (Phase 13; exploration skills excluded in Phase 14),
 *   keywords — a project's linked technologies,
 *   isBasedOn — a verified project's public source repositories (Phase 14),
 *   creativeWorkStatus — "Concept" for a concept system (never presented as delivered work).
 * Deliberately absent until owner-confirmed: alternateName (D-7), image, worksFor, alumniOf, address.
 */
export type PersonFacts = {
  /** Canonical entity name — the English profile name, identical on every locale. */
  entityName: string;
  /** Approved title in the page's locale, or null (then omitted). */
  jobTitle: string | null;
  sameAs: string[];
  /** Phase 13: published CMS skill names (AI techniques first) — what the Person demonstrably works with. */
  knowsAbout?: string[];
  /** The home page description in this locale (reviewed catalog copy or the owner's Site Settings). */
  siteDescription?: string;
};

export function homeStructuredData(siteUrl: string, locale: Locale, facts: PersonFacts) {
  const url = canonicalUrl(siteUrl, 'en', '/');
  const personId = `${url}#person`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: facts.entityName,
        url,
        ...(facts.jobTitle ? { jobTitle: facts.jobTitle } : {}),
        ...(facts.sameAs.length ? { sameAs: facts.sameAs } : {}),
        ...(facts.knowsAbout?.length ? { knowsAbout: facts.knowsAbout } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${url}#website`,
        name: facts.entityName,
        url,
        ...(facts.siteDescription ? { description: facts.siteDescription } : {}),
        inLanguage: locale,
        publisher: { '@id': personId },
      },
    ],
  };
}

/** Serialize for a <script type="application/ld+json"> — escapes `<` to prevent tag injection. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** BreadcrumbList for deeper pages (IA §3, SEO_MASTER §16). `items` are [label, path] from the root. */
export function breadcrumbStructuredData(siteUrl: string, locale: Locale, items: [string, string][]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: canonicalUrl(siteUrl, locale, path),
    })),
  };
}

export type ProjectFacts = {
  path: string;
  name: string;
  description: string;
  dateModified: string;
  image?: string;
  /** Phase 13: the project's linked technologies (CMS relations), emitted as CreativeWork keywords. */
  keywords?: string[];
  /** Phase 14: a concept system is marked `creativeWorkStatus: "Concept"` and never gets repositories. */
  concept?: boolean;
  /** Phase 14: public source repositories of a verified project (CMS links of kind "repository"). */
  repositories?: { name: string; url: string }[];
};

/**
 * A project case study page (SEO_MASTER §24): `CreativeWork` authored by the site's Person —
 * deliberately not `SoftwareSourceCode` (the page describes work; it is not the code).
 * Only verified CMS fields; no dates of creation, awards or metrics are asserted.
 */
export function projectStructuredData(siteUrl: string, locale: Locale, facts: ProjectFacts) {
  const personId = `${canonicalUrl(siteUrl, 'en', '/')}#person`;
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: facts.name,
    description: facts.description,
    url: canonicalUrl(siteUrl, locale, facts.path),
    inLanguage: locale,
    dateModified: facts.dateModified,
    author: { '@id': personId },
    ...(facts.image ? { image: facts.image } : {}),
    ...(facts.keywords?.length ? { keywords: facts.keywords.join(', ') } : {}),
    ...(facts.concept ? { creativeWorkStatus: 'Concept' } : {}),
    // The case study is based on the public code — each repository as SoftwareSourceCode.
    ...(!facts.concept && facts.repositories?.length
      ? {
          isBasedOn: facts.repositories.map((r) => ({
            '@type': 'SoftwareSourceCode',
            name: r.name,
            codeRepository: r.url,
            author: { '@id': personId },
          })),
        }
      : {}),
  };
}

/** About page (Phase 14): a ProfilePage whose main entity is the site's Person. */
export function profilePageStructuredData(siteUrl: string, locale: Locale, path: string, name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name,
    url: canonicalUrl(siteUrl, locale, path),
    inLanguage: locale,
    mainEntity: { '@id': `${canonicalUrl(siteUrl, 'en', '/')}#person` },
  };
}
