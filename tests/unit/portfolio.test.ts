import { describe, expect, it } from 'vitest';
import { hasRichText, richTextOrNull, safeHref } from '@/content/rich-text';
import { fileUrl } from '@/content/files';
import { buildSitemap } from '@/lib/seo/sitemap';
import { breadcrumbStructuredData, projectStructuredData } from '@/lib/seo/structured-data';
import { formatMonthYear, formatPeriod } from '@/lib/format';
import { NO_ROUTES } from '@/config/navigation';

const SITE = 'https://yazanalsamman.com';
const paragraph = (text: string) => ({ type: 'paragraph', children: text ? [{ type: 'text', text }] : [] });
const doc = (...children: object[]) => ({ root: { type: 'root', children } });

describe('rich text (Phase 4)', () => {
  it('treats a cleared editor (empty paragraph) as no content', () => {
    expect(hasRichText(doc(paragraph('')))).toBe(false);
    expect(hasRichText(doc(paragraph('   ')))).toBe(false);
    expect(richTextOrNull(doc(paragraph('')))).toBeNull();
    expect(hasRichText(null)).toBe(false);
    expect(hasRichText({ foo: 1 })).toBe(false);
  });

  it('detects real text and non-text blocks (uploads)', () => {
    expect(hasRichText(doc(paragraph('Verified content')))).toBe(true);
    expect(hasRichText(doc({ type: 'upload', value: { url: '/x.png' } }))).toBe(true);
  });

  it('only allows safe link targets', () => {
    expect(safeHref('https://example.com/a')).toBe('https://example.com/a');
    expect(safeHref('mailto:someone@example.com')).toBe('mailto:someone@example.com');
    expect(safeHref('/projects/x')).toBe('/projects/x');
    expect(safeHref('javascript:alert(1)')).toBeNull();
    expect(safeHref('data:text/html,<b>x</b>')).toBeNull();
    expect(safeHref('//evil.example')).toBeNull();
    expect(safeHref('')).toBeNull();
  });
});

describe('CMS file URLs', () => {
  it('keeps same-app file URLs site-relative (works behind any host/port)', () => {
    expect(fileUrl('http://localhost:3000/api/media/file/Cover.webp')).toBe('/api/media/file/Cover.webp');
    expect(fileUrl('/api/documents/file/cv.pdf')).toBe('/api/documents/file/cv.pdf');
    expect(fileUrl('https://cdn.example.com/x.png')).toBe('https://cdn.example.com/x.png');
  });
});

describe('sitemap assembly', () => {
  it('with no CMS content lists only the homepage', () => {
    const map = buildSitemap(SITE, [{ locale: 'en', available: NO_ROUTES, projects: [] }]);
    expect(map.map((e) => e.url)).toEqual([SITE]);
  });

  it('adds live routes and published projects; hreflang pairs only pages that exist in both locales', () => {
    const map = buildSitemap(SITE, [
      {
        locale: 'en',
        available: { ...NO_ROUTES, projects: true, about: true },
        projects: [
          { slug: 'vision', updatedAt: '2026-09-01T00:00:00.000Z' },
          { slug: 'en-only', updatedAt: '2026-09-02T00:00:00.000Z' },
        ],
      },
      {
        locale: 'ar',
        available: { ...NO_ROUTES, projects: true },
        projects: [{ slug: 'vision', updatedAt: '2026-09-05T00:00:00.000Z' }],
      },
    ]);
    const urls = map.map((e) => e.url);
    expect(urls).toContain(`${SITE}/projects`);
    expect(urls).toContain(`${SITE}/ar/projects`);
    expect(urls).toContain(`${SITE}/about`);
    expect(urls).not.toContain(`${SITE}/ar/about`);
    const enOnly = map.find((e) => e.url === `${SITE}/projects/en-only`)!;
    expect(enOnly.alternates?.languages).toEqual({
      en: `${SITE}/projects/en-only`,
      'x-default': `${SITE}/projects/en-only`,
    });
    const vision = map.find((e) => e.url === `${SITE}/ar/projects/vision`)!;
    expect(vision.alternates?.languages).toMatchObject({ ar: `${SITE}/ar/projects/vision` });
    expect(vision.lastModified).toBe('2026-09-05T00:00:00.000Z');
    expect(urls).not.toContain(`${SITE}/cv`);
  });
});

describe('structured data (project pages)', () => {
  it('builds a BreadcrumbList with localized absolute URLs', () => {
    const data = breadcrumbStructuredData(SITE, 'ar', [
      ['الرئيسية', '/'],
      ['المشاريع', '/projects'],
    ]);
    expect(data.itemListElement.map((i) => i.item)).toEqual([`${SITE}/ar`, `${SITE}/ar/projects`]);
    expect(data.itemListElement[1]!.position).toBe(2);
  });

  it('describes a case study as a CreativeWork by the site Person (not SoftwareSourceCode)', () => {
    const data = projectStructuredData(SITE, 'en', {
      path: '/projects/vision',
      name: 'Vision',
      description: 'desc',
      dateModified: '2026-09-01',
    });
    expect(data['@type']).toBe('CreativeWork');
    expect(data.author).toEqual({ '@id': `${SITE}#person` });
    expect('image' in data).toBe(false);
  });
});

describe('date formatting (ADR-006: Western digits in both locales)', () => {
  it('formats month/year per locale with 0–9 digits', () => {
    expect(formatMonthYear('2024-03-01T00:00:00.000Z', 'en')).toMatch(/Mar 2024/);
    const ar = formatMonthYear('2024-03-01T00:00:00.000Z', 'ar');
    expect(ar).toMatch(/2024/);
    expect(ar).not.toMatch(/[٠-٩]/);
  });

  it('formats open and closed periods', () => {
    expect(formatPeriod('2024-03-01', null, 'en', 'Present')).toMatch(/2024 – Present$/);
    expect(formatPeriod(null, null, 'en', 'Present')).toBeNull();
    expect(formatPeriod('2022-01-01', '2023-06-01', 'en', null)).toMatch(/2022 – .*2023/);
  });
});
