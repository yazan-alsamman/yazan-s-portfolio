import { describe, expect, it } from 'vitest';
import {
  phase14LongBio,
  phase14Principles,
  phase14Projects,
  phase14Skills,
} from '@/cms/content/phase14-content';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { phase15Projects, phase15Skills } from '@/cms/content/phase15-content';
import { ownerAiSkills, ownerTechnologies } from '@/cms/owner/owner-content';
import { legacySkills } from '@/cms/legacy/legacy-content';
import { profilePageStructuredData, projectStructuredData } from '@/lib/seo/structured-data';

const SITE = 'https://yazanalsamman.com';
const text = (p: (typeof phase14Projects)[number]) =>
  [p.title, p.summary, ...Object.values(p.sections ?? {}).flat()].filter(Boolean).join(' ');

describe('Phase 14 content integrity', () => {
  it('uses unique slugs and sort orders, with 18–26 projects in three tiers', () => {
    const slugs = phase14Projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const orders = phase14Projects.map((p) => p.sortOrder);
    expect(new Set(orders).size).toBe(orders.length);
    expect(phase14Projects.length).toBeGreaterThanOrEqual(18);
    const tiers = (t: string) => phase14Projects.filter((p) => p.tier === t).length;
    expect(tiers('flagship')).toBeGreaterThanOrEqual(5);
    expect(tiers('flagship')).toBeLessThanOrEqual(7);
    expect(tiers('strong')).toBeGreaterThanOrEqual(7);
  });

  it('keeps SEO copy within length budgets (the title template adds the name)', () => {
    for (const p of phase14Projects.filter((x) => x.seo)) {
      expect(p.seo!.title.length, p.slug).toBeLessThanOrEqual(60);
      expect(p.seo!.description.length, p.slug).toBeGreaterThanOrEqual(50);
      expect(p.seo!.description.length, p.slug).toBeLessThanOrEqual(170);
    }
    for (const p of phase14Projects.filter((x) => x.summary))
      expect(p.summary!.length, p.slug).toBeLessThanOrEqual(300);
  });

  it('labels concepts everywhere and gives them design objectives, never results or evidence', () => {
    const concepts = phase14Projects.filter((p) => p.provenance === 'concept');
    expect(concepts.length).toBeGreaterThanOrEqual(3);
    expect(concepts.length).toBeLessThanOrEqual(5);
    for (const c of concepts) {
      expect(c.featured, c.slug).toBe(false);
      expect(c.tier, c.slug).not.toBe('flagship');
      expect(c.links ?? [], c.slug).toEqual([]);
      expect(c.experience, c.slug).toBeUndefined();
      expect(c.seo?.title, c.slug).toMatch(/^Concept: /);
      expect(c.summary, c.slug).toMatch(/^Concept system — /);
      expect(c.sections?.results?.[0], c.slug).toMatch(/^Design objective: /);
      // No numbers in a concept (no metrics, users, latency or scale).
      expect(text(c), c.slug).not.toMatch(/\d/);
    }
  });

  it('publishes only the owner’s own public repositories, and no credentials', () => {
    for (const p of phase14Projects)
      for (const l of p.links ?? [])
        expect(l.url, p.slug).toMatch(/^https:\/\/github\.com\/yazan-alsamman\//);
    const all = JSON.stringify(phase14Projects);
    expect(all).not.toMatch(/password\s*[:=]|admin@|api[_-]?key|secret\s*[:=]/i);
  });

  it('links technologies that exist, and exploration skills only to concept systems', () => {
    const known = new Set([
      ...phase14Skills.map((s) => s.name),
      ...phase15Skills.map((s) => s.name),
      ...ownerAiSkills.map((s) => s.name),
      ...ownerTechnologies.map((s) => s.name),
      ...legacySkills.map((s) => s.name),
    ]);
    const exploration = new Set(
      phase14Skills.filter((s) => s.provenance === 'exploration').map((s) => s.name),
    );
    for (const p of [...phase14Projects, ...phase15Projects])
      for (const name of p.technologies ?? []) {
        expect(known.has(name), `${p.slug}: ${name}`).toBe(true);
        if (exploration.has(name)) expect(p.provenance, `${p.slug}: ${name}`).toBe('concept');
      }
  });

  it('names every verified skill with its evidence and keeps skill names unique', () => {
    const names = phase14Skills.map((s) => s.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
    for (const s of phase14Skills) expect(s.source.length, s.name).toBeGreaterThan(5);
  });

  it('writes principles within the CMS limits and a bio without invented dates of employment', () => {
    expect(phase14Principles.length).toBeLessThanOrEqual(8);
    for (const p of phase14Principles) {
      expect(p.title.length).toBeLessThanOrEqual(60);
      expect(p.body.length).toBeLessThanOrEqual(280);
    }
    const bio = phase14LongBio.join(' ');
    // Only the owner-confirmed graduation year appears.
    expect(bio.match(/\b(19|20)\d{2}\b/g)).toEqual(['2026']);
  });
});

describe('Phase 15 client projects and screenshots', () => {
  const all = [...phase14Projects, ...phase15Projects];

  it('keeps slugs and sort orders unique across both content sets, with at most 7 flagships', () => {
    expect(new Set(all.map((p) => p.slug)).size).toBe(all.length);
    expect(new Set(all.map((p) => p.sortOrder)).size).toBe(all.length);
    expect(all.filter((p) => p.tier === 'flagship').length).toBeLessThanOrEqual(7);
    expect(all.filter((p) => p.featured).every((p) => p.tier === 'flagship')).toBe(true);
  });

  it('ships every screenshot file with meaningful alt text and a recorded source', () => {
    for (const p of phase15Projects)
      for (const m of [p.cover, ...(p.gallery ?? [])].filter(Boolean)) {
        expect(existsSync(path.resolve('src/cms/content/media', m!.file)), m!.file).toBe(true);
        expect(m!.alt.length, m!.file).toBeGreaterThan(20);
        expect(m!.source, m!.file).toMatch(/screenshot of/);
      }
  });

  it('labels every locally-run screenshot as local, never as a live site', () => {
    for (const p of phase15Projects)
      for (const m of [p.cover, ...(p.gallery ?? [])].filter(Boolean))
        if (/running locally/.test(m!.source)) expect(m!.alt, m!.file).toMatch(/local/i);
  });

  it('keeps SEO copy within budget and publishes no credentials or pricing', () => {
    for (const p of phase15Projects) {
      expect(p.seo!.title.length, p.slug).toBeLessThanOrEqual(60);
      expect(p.seo!.description.length, p.slug).toBeGreaterThanOrEqual(50);
      expect(p.seo!.description.length, p.slug).toBeLessThanOrEqual(170);
      expect(p.summary!.length, p.slug).toBeLessThanOrEqual(300);
    }
    expect(JSON.stringify(phase15Projects)).not.toMatch(
      /password\s*[:=]|admin123|api[_-]?key|\$\s?\d{3,}|deal|cost of/i,
    );
  });
});

describe('Phase 14 structured data', () => {
  const base = { path: '/projects/x', name: 'X', description: 'd', dateModified: '2026-09-29' };
  it('marks a concept with creativeWorkStatus and never attaches source code to it', () => {
    const data = projectStructuredData(SITE, 'en', {
      ...base,
      concept: true,
      repositories: [{ name: 'r', url: 'https://github.com/yazan-alsamman/r' }],
    });
    expect(data.creativeWorkStatus).toBe('Concept');
    expect('isBasedOn' in data).toBe(false);
  });

  it('links a verified project to its repositories as SoftwareSourceCode', () => {
    const data = projectStructuredData(SITE, 'en', {
      ...base,
      repositories: [{ name: 'Repository', url: 'https://github.com/yazan-alsamman/r' }],
    });
    expect('creativeWorkStatus' in data).toBe(false);
    expect(data.isBasedOn).toEqual([
      {
        '@type': 'SoftwareSourceCode',
        name: 'Repository',
        codeRepository: 'https://github.com/yazan-alsamman/r',
        author: { '@id': `${SITE}#person` },
      },
    ]);
  });

  it('describes About as a ProfilePage about the site Person', () => {
    const data = profilePageStructuredData(SITE, 'en', '/about', 'About');
    expect(data['@type']).toBe('ProfilePage');
    expect(data.mainEntity).toEqual({ '@id': `${SITE}#person` });
  });
});
