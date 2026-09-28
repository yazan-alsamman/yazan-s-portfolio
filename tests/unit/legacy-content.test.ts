import { describe, expect, it } from 'vitest';
import {
  legacyCertificates,
  legacyEducation,
  legacyPages,
  legacyProfile,
  legacyProjects,
  legacySkills,
} from '@/cms/legacy/legacy-content';
import { formatPeriod } from '@/lib/format';
import { frameFit, isPortrait } from '@/lib/image-fit';

/** Real-content migration: dataset integrity rules (docs/reports/REAL_CONTENT_MIGRATION_REPORT.md). */
describe('legacy content dataset', () => {
  const published = legacyProjects.filter((p) => p.status === 'published');

  it('covers every legacy page and every legacy project exactly once', () => {
    expect(legacyPages).toHaveLength(21);
    expect(legacyProjects.map((p) => p.key).sort()).toEqual(
      Array.from({ length: 16 }, (_, i) => `P${i + 1}`).sort(),
    );
    const slugs = legacyProjects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it('published projects satisfy the CMS publishing rules (SEO lengths, summary)', () => {
    for (const p of published) {
      expect(p.seo.title.length, p.slug).toBeGreaterThanOrEqual(10);
      expect(p.seo.title.length, p.slug).toBeLessThanOrEqual(70);
      expect(p.seo.description.length, p.slug).toBeGreaterThanOrEqual(50);
      expect(p.seo.description.length, p.slug).toBeLessThanOrEqual(170);
      expect(p.summary.length, p.slug).toBeLessThanOrEqual(300);
      for (const image of p.images) {
        expect(image.sha256).toMatch(/^[0-9a-f]{64}$/);
        expect(image.alt.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it('keeps legacy placeholder/invalid projects unpublished (P8 unrelated text, P13 lorem ipsum)', () => {
    expect(legacyProjects.filter((p) => p.status === 'draft').map((p) => p.key)).toEqual(['P8', 'P13']);
  });

  it('contains no private data, percentages, counters or superseded titles', () => {
    const text = JSON.stringify({
      legacyProfile,
      legacySkills,
      legacyEducation,
      legacyCertificates,
      legacyProjects,
    });
    // LEGACY_CONTENT_INVENTORY §4 (values deliberately not repeated here): no phone-number-like
    // sequences, birth date, address or home location.
    expect(text).not.toMatch(/\+\d{3}|\(\d{3}\)|\d{3}[\s-]\d{3}[\s-]\d{3}/);
    expect(text).not.toMatch(/birthday|birth date|address|city:|\bsyria\b/i);
    expect(text).not.toMatch(/\d+\s*%/); // no proficiency percentages
    expect(text).not.toMatch(/happy clients|hours of support|3\+ years/i);
    expect(text).not.toMatch(/Full Stack Developer|IT Engineer|Programmer with/);
    expect(text).not.toMatch(/lorem|exercitationem|cybertruck/i);
    expect(text).not.toMatch(/@gmail\.com/); // conflicting public emails: owner review
  });

  it('certificates never claim a professional licence and are all distinct', () => {
    expect(legacyCertificates).toHaveLength(28);
    for (const c of legacyCertificates) expect(c.name).not.toMatch(/licen[cs]e/i);
    const keys = legacyCertificates.map((c) => `${c.name}|${c.issuer}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('rendering support for the migrated content', () => {
  it('shows only the years when only the years are known', () => {
    expect(formatPeriod('2021-01-01T00:00:00.000Z', '2025-01-01T00:00:00.000Z', 'en', null, 'year')).toBe(
      '2021 – 2025',
    );
    expect(formatPeriod('2021-03-01T00:00:00.000Z', null, 'en', 'Present')).toBe('Mar 2021 – Present');
  });

  it('contains portrait screenshots instead of cropping them', () => {
    expect(isPortrait({ width: 1080, height: 2400 })).toBe(true);
    expect(frameFit({ width: 1080, height: 2400 })).toBe('object-contain');
    expect(frameFit({ width: 1920, height: 1032 })).toBe('object-cover');
  });
});
