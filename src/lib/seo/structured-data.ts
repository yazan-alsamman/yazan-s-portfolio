import type { Locale } from '@/i18n/routing';
import { canonicalUrl } from './urls';

/**
 * JSON-LD built exclusively from confirmed, published CMS fields (SEO_MASTER §21–23, ADR-017).
 * Pure: callers pass the facts (from the content repository). Emitted only when present:
 *   jobTitle — the locale's approved title (never another language's),
 *   sameAs   — owner-confirmed social profiles.
 * Deliberately absent until owner-confirmed: alternateName (D-7), image, worksFor, alumniOf, address.
 */
export type PersonFacts = {
  /** Canonical entity name — the English profile name, identical on every locale. */
  entityName: string;
  /** Approved title in the page's locale, or null (then omitted). */
  jobTitle: string | null;
  sameAs: string[];
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
  };
}
