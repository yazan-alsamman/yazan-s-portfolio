import { describe, expect, it } from 'vitest';
import { absoluteUrl, canonicalUrl, languageAlternates, localizedPath } from '@/lib/seo/urls';
import { homeStructuredData, serializeJsonLd } from '@/lib/seo/structured-data';

const SITE = 'https://yazanalsamman.com';

describe('localizedPath', () => {
  it('keeps English unprefixed and prefixes Arabic with /ar', () => {
    expect(localizedPath('en', '/')).toBe('/');
    expect(localizedPath('en', '/projects')).toBe('/projects');
    expect(localizedPath('ar', '/')).toBe('/ar');
    expect(localizedPath('ar', '/projects/example')).toBe('/ar/projects/example');
  });

  it('normalizes: lowercase, no trailing slash, no query/hash', () => {
    expect(localizedPath('en', 'Projects/Example/?utm=x#top')).toBe('/projects/example');
  });
});

describe('canonicalUrl', () => {
  it('produces HTTPS canonical URLs on the configured domain without trailing slashes', () => {
    expect(canonicalUrl(SITE, 'en', '/')).toBe('https://yazanalsamman.com');
    expect(canonicalUrl(SITE, 'ar', '/')).toBe('https://yazanalsamman.com/ar');
    expect(canonicalUrl(SITE, 'en', '/projects/example')).toBe('https://yazanalsamman.com/projects/example');
    expect(absoluteUrl(SITE, '/sitemap.xml')).toBe('https://yazanalsamman.com/sitemap.xml');
  });
});

describe('languageAlternates', () => {
  it('includes both locales and x-default when both are publishable', () => {
    expect(languageAlternates(SITE, '/about', ['en', 'ar'])).toEqual({
      en: 'https://yazanalsamman.com/about',
      ar: 'https://yazanalsamman.com/ar/about',
      'x-default': 'https://yazanalsamman.com/about',
    });
  });

  it('omits an unpublishable locale (no hreflang to incomplete Arabic pages)', () => {
    expect(languageAlternates(SITE, '/about', ['en'])).toEqual({
      en: 'https://yazanalsamman.com/about',
      'x-default': 'https://yazanalsamman.com/about',
    });
  });
});

describe('structured data', () => {
  const facts = { entityName: 'Yazan Al Samman', jobTitle: 'Artificial Intelligence Engineer', sameAs: [] };

  it('emits only the facts it is given (no alternateName, image, employer…)', () => {
    const person = homeStructuredData(SITE, 'en', facts)['@graph'][0] as Record<string, unknown>;
    expect(person).toEqual({
      '@type': 'Person',
      '@id': 'https://yazanalsamman.com#person',
      name: 'Yazan Al Samman',
      url: 'https://yazanalsamman.com',
      jobTitle: 'Artificial Intelligence Engineer',
    });
  });

  it('uses the Arabic title on Arabic pages, keeps one canonical entity name', () => {
    const person = homeStructuredData(SITE, 'ar', { ...facts, jobTitle: 'مهندس ذكاء صنعي' })[
      '@graph'
    ][0] as Record<string, unknown>;
    expect(person.jobTitle).toBe('مهندس ذكاء صنعي');
    expect(person.name).toBe('Yazan Al Samman');
  });

  it('omits jobTitle when the locale has no approved title (never another language)', () => {
    const person = homeStructuredData(SITE, 'ar', { ...facts, jobTitle: null })['@graph'][0] as Record<
      string,
      unknown
    >;
    expect(person).not.toHaveProperty('jobTitle');
  });

  it('emits sameAs only for supplied profiles', () => {
    const person = homeStructuredData(SITE, 'en', { ...facts, sameAs: ['https://example.com/p'] })[
      '@graph'
    ][0] as Record<string, unknown>;
    expect(person.sameAs).toEqual(['https://example.com/p']);
  });

  it('escapes < to prevent script injection', () => {
    expect(serializeJsonLd({ a: '</script><script>' })).not.toContain('</script>');
  });
});
