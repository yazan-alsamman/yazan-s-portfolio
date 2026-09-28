import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isCopyReviewComplete, computePublicationBlockers } from '@/lib/i18n/publishability';
import { buildSitemap } from '@/lib/seo/sitemap';
import { homeStructuredData } from '@/lib/seo/structured-data';
import { NO_ROUTES } from '@/config/navigation';

const SITE = 'https://yazanalsamman.com';

describe('Arabic copy-review gate (D-9)', () => {
  it('is complete only when approved by a named reviewer on a recorded date', () => {
    expect(isCopyReviewComplete(undefined)).toBe(true); // no review required (English original)
    expect(isCopyReviewComplete({ status: 'pending', reviewer: null, reviewedOn: null })).toBe(false);
    expect(isCopyReviewComplete({ status: 'approved', reviewer: null, reviewedOn: '2026-10-01' })).toBe(
      false,
    );
    expect(isCopyReviewComplete({ status: 'approved', reviewer: '  ', reviewedOn: '2026-10-01' })).toBe(
      false,
    );
    expect(isCopyReviewComplete({ status: 'approved', reviewer: 'Reviewer', reviewedOn: 'soon' })).toBe(
      false,
    );
    expect(isCopyReviewComplete({ status: 'approved', reviewer: 'Reviewer', reviewedOn: '2026-10-01' })).toBe(
      true,
    );
  });

  it('keeps Arabic unpublishable today (review pending) even with an approved profile', () => {
    expect(computePublicationBlockers('ar', { hasApprovedProfile: true })).toContain('copyReview');
    expect(computePublicationBlockers('en', { hasApprovedProfile: true })).toEqual([]);
  });
});

describe('default share images', () => {
  it('are 1200 × 630 PNGs per locale, small enough for every social network', async () => {
    for (const locale of ['en', 'ar']) {
      const file = readFileSync(`src/assets/share/share-${locale}.png`);
      const meta = await sharp(file).metadata();
      expect([meta.format, meta.width, meta.height]).toEqual(['png', 1200, 630]);
      expect(file.length).toBeLessThan(1_000_000);
      expect(meta.exif).toBeUndefined();
    }
  });

  it('never required touching the approved portrait', () => {
    expect(createHash('sha256').update(readFileSync('portrait.jpg')).digest('hex')).toBe(
      '1c00fa075b97e2ef8a3460b3d62155052533729994041bd7f562ed5177323fca',
    );
  });
});

describe('robots.txt by environment', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function robotsFor(env: Record<string, string>) {
    for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
    vi.resetModules();
    return (await import('@/app/robots')).default();
  }

  it('production: allows the site, blocks CMS/API/internal routes, advertises the HTTPS sitemap', async () => {
    const robots = await robotsFor({ SITE_ENV: 'production', SITE_URL: SITE });
    expect(robots.rules).toEqual([
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/design-system', '/ar/design-system'] },
    ]);
    expect(robots.sitemap).toBe(`${SITE}/sitemap.xml`);
    expect(robots.host).toBe(SITE);
  });

  it('any non-production deployment disallows everything', async () => {
    const robots = await robotsFor({ SITE_ENV: 'preview', SITE_URL: 'https://preview.example.com' });
    expect(robots.rules).toEqual([{ userAgent: '*', disallow: '/' }]);
    expect(robots.sitemap).toBeUndefined();
  });
});

describe('sitemap locale strategy', () => {
  const live = { ...NO_ROUTES, projects: true, about: true };

  it('lists only publishable locales: gated Arabic is absent and has no hreflang', () => {
    const map = buildSitemap(SITE, [
      {
        locale: 'en',
        available: live,
        projects: [{ slug: 'vision', updatedAt: '2026-09-01T00:00:00.000Z' }],
      },
    ]);
    const urls = map.map((e) => e.url);
    expect(urls).toEqual([SITE, `${SITE}/projects`, `${SITE}/about`, `${SITE}/projects/vision`]);
    expect(urls.every((u) => u.startsWith('https://') && !u.includes('/ar'))).toBe(true);
    expect(JSON.stringify(map)).not.toContain('"ar"');
    expect(JSON.stringify(map)).not.toMatch(/admin|\/api\/|localhost|draft/);
  });

  it('once Arabic is publishable, pairs only pages that exist in both languages', () => {
    const map = buildSitemap(SITE, [
      {
        locale: 'en',
        available: live,
        projects: [
          { slug: 'shared', updatedAt: '2026-09-01T00:00:00.000Z' },
          { slug: 'english-only', updatedAt: '2026-09-02T00:00:00.000Z' },
        ],
      },
      {
        locale: 'ar',
        available: { ...NO_ROUTES, projects: true },
        projects: [{ slug: 'shared', updatedAt: '2026-09-03T00:00:00.000Z' }],
      },
    ]);
    const entry = (url: string) => map.find((e) => e.url === url)!;
    expect(entry(`${SITE}/projects/shared`).alternates?.languages).toEqual({
      en: `${SITE}/projects/shared`,
      ar: `${SITE}/ar/projects/shared`,
      'x-default': `${SITE}/projects/shared`,
    });
    expect(entry(`${SITE}/projects/english-only`).alternates?.languages).toEqual({
      en: `${SITE}/projects/english-only`,
      'x-default': `${SITE}/projects/english-only`,
    });
    expect(map.find((e) => e.url === `${SITE}/ar/about`)).toBeUndefined(); // no Arabic About content
    expect(entry(`${SITE}/about`).alternates?.languages).not.toHaveProperty('ar');
  });
});

describe('WebSite structured data', () => {
  it('carries the site description only when one is given; no invented properties', () => {
    const facts = { entityName: 'Yazan Al Samman', jobTitle: 'Artificial Intelligence Engineer', sameAs: [] };
    const without = homeStructuredData(SITE, 'en', facts);
    const withDesc = homeStructuredData(SITE, 'en', { ...facts, siteDescription: 'Official website.' });
    expect(without['@graph'][1]).not.toHaveProperty('description');
    expect(withDesc['@graph'][1]).toMatchObject({ '@type': 'WebSite', description: 'Official website.' });
    const json = JSON.stringify(withDesc);
    for (const invented of ['worksFor', 'alumniOf', 'address', 'award', 'potentialAction', 'image']) {
      expect(json).not.toContain(invented);
    }
  });
});
