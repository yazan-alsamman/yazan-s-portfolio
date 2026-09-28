import { beforeAll, describe, expect, it } from 'vitest';
import type { Payload } from 'payload';
import {
  fetchCertificates,
  fetchEducation,
  fetchExperience,
  fetchHomeSectionAvailability,
  fetchProfile,
  fetchProjectBySlug,
  fetchRouteAvailability,
  fetchSkills,
} from '@/content/payload-adapter';
import { cms, pdfFixture, pngFixture, projectData, publishedSkill, uniqueSlug } from './harness';

/**
 * Phase 4 — public portfolio readers over the real CMS (PostgreSQL, Payload Local API).
 * Every document is a labelled development fixture on the isolated `_test` database.
 * Covers: route availability (empty pages are not published), per-entity publication rules
 * (draft/archived/unapproved never leak through joins), and the extended project contract.
 */

let payload: Payload;

beforeAll(async () => {
  payload = await cms();
});

/** Minimal valid Lexical document with one paragraph (Payload richText storage format). */
function lexical(text: string) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          textFormat: 0,
          children: text
            ? [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }]
            : [],
        },
      ],
    },
  };
}

const published = { translationStatus: 'approved' as const, _status: 'published' as const };

describe('route availability (IA: a page with no content is not published)', () => {
  it('reports every content route unavailable on an empty CMS', async () => {
    const routes = await fetchRouteAvailability({ payload, locale: 'en' });
    expect(Object.values(routes).every((v) => v === false)).toBe(true);
    const home = await fetchHomeSectionAvailability({ payload, locale: 'en' });
    expect(Object.values(home).every((v) => v === false)).toBe(true);
  });

  it('About needs a real long biography; an emptied editor does not count', async () => {
    await payload.updateGlobal({
      slug: 'profile',
      locale: 'en',
      data: {
        name: 'Development Fixture Name',
        title: 'Development Fixture Title',
        longBio: lexical(''),
        ...published,
      },
      overrideAccess: true,
    });
    expect((await fetchProfile({ payload, locale: 'en' }))?.longBio).toBeNull();
    expect((await fetchRouteAvailability({ payload, locale: 'en' })).about).toBe(false);

    await payload.updateGlobal({
      slug: 'profile',
      locale: 'en',
      data: { longBio: lexical('Development fixture biography.'), _status: 'published' },
      overrideAccess: true,
    });
    expect((await fetchRouteAvailability({ payload, locale: 'en' })).about).toBe(true);
    // Arabic has no approved profile: nothing becomes available there (no fallback).
    expect((await fetchRouteAvailability({ payload, locale: 'ar' })).about).toBe(false);
  });

  it('Contact appears only with an owner-approved channel', async () => {
    expect((await fetchRouteAvailability({ payload, locale: 'en' })).contact).toBe(false);
    await payload.updateGlobal({
      slug: 'profile',
      locale: 'en',
      data: {
        socialLinks: [{ network: 'github', url: 'https://github.com/example-fixture' }],
        _status: 'published',
      },
      overrideAccess: true,
    });
    const routes = await fetchRouteAvailability({ payload, locale: 'en' });
    expect(routes.contact).toBe(true);
    expect((await fetchHomeSectionAvailability({ payload, locale: 'en' })).contact).toBe(true);
  });
});

describe('experience, skills and projects (joins never leak unpublished documents)', () => {
  it('lists public experience with its technologies and only its public projects', async () => {
    const skill = await publishedSkill(payload, 'Fixture Skill A', { category: 'ai-ml' });
    const draftSkill = await payload.create({
      collection: 'skills',
      data: {
        name: 'Fixture Draft Skill',
        category: 'tools',
        translationStatus: 'approved',
        _status: 'draft',
      },
      overrideAccess: true,
    });
    const exp = await payload.create({
      collection: 'experience',
      data: {
        organization: 'Development Fixture Organization',
        title: 'Development Fixture Role',
        description: lexical('Fixture description.'),
        startDate: '2023-02-01T00:00:00.000Z',
        technologies: [skill.id, draftSkill.id],
        ...published,
      },
      overrideAccess: true,
    });
    const liveSlug = uniqueSlug('fixture-live');
    const draftSlug = uniqueSlug('fixture-draft');
    await payload.create({
      collection: 'projects',
      data: { ...projectData(liveSlug), experience: exp.id, technologies: [skill.id], _status: 'published' },
      overrideAccess: true,
    });
    await payload.create({
      collection: 'projects',
      data: { ...projectData(draftSlug), experience: exp.id, technologies: [skill.id], _status: 'draft' },
      overrideAccess: true,
    });

    const [item] = await fetchExperience({ payload, locale: 'en' });
    expect(item).toMatchObject({ organization: 'Development Fixture Organization', endDate: null });
    expect(item!.technologies.map((t) => t.name)).toEqual(['Fixture Skill A']);
    expect(item!.projects.map((p) => p.slug)).toEqual([liveSlug]);
    expect(await fetchExperience({ payload, locale: 'ar' })).toEqual([]);

    const skills = await fetchSkills({ payload, locale: 'en' });
    const a = skills.find((s) => s.name === 'Fixture Skill A')!;
    expect(a.evidence.map((p) => p.slug)).toEqual([liveSlug]);
    expect(skills.some((s) => s.name === 'Fixture Draft Skill')).toBe(false);

    const project = await fetchProjectBySlug({ payload, locale: 'en' }, liveSlug);
    expect(project?.experience).toEqual({
      organization: 'Development Fixture Organization',
      title: 'Development Fixture Role',
    });
    const routes = await fetchRouteAvailability({ payload, locale: 'en' });
    expect(routes).toMatchObject({ experience: true, skills: true, projects: true });
  });

  it('maps the extended case-study contract: timeline, gallery (no archived media), empty sections as null', async () => {
    const png = await pngFixture(640, 400);
    const shown = await payload.create({
      collection: 'media',
      data: { alt: 'Development Fixture gallery image' },
      file: { data: png, mimetype: 'image/png', name: 'g1.png', size: png.length },
      overrideAccess: true,
    });
    const archived = await payload.create({
      collection: 'media',
      data: { alt: 'Development Fixture archived image', archived: true },
      file: { data: png, mimetype: 'image/png', name: 'g2.png', size: png.length },
      overrideAccess: true,
    });
    const slug = uniqueSlug('fixture-case');
    await payload.create({
      collection: 'projects',
      data: {
        ...projectData(slug),
        timeline: { start: '2024-01-01T00:00:00.000Z', end: '2024-06-01T00:00:00.000Z' },
        gallery: [shown.id, archived.id],
        videoUrl: 'https://example.com/fixture-video',
        problem: lexical('Fixture problem statement.'),
        results: lexical(''),
        _status: 'published',
      },
      overrideAccess: true,
    });
    const project = await fetchProjectBySlug({ payload, locale: 'en' }, slug);
    expect(project?.timeline.start).toMatch(/^2024-01-01/);
    expect(project?.gallery).toHaveLength(1);
    expect(project?.gallery[0]!.url.startsWith('/api/media/file/')).toBe(true); // site-relative
    expect(project?.videoUrl).toBe('https://example.com/fixture-video');
    expect(project?.body.problem).not.toBeNull();
    expect(project?.body.results).toBeNull(); // cleared editor = no section
    expect(project?.body.description).toBeNull();
  });
});

describe('robustness: one incomplete optional row never hides a published project', () => {
  it('drops a link whose label is missing in this locale instead of 404-ing the project', async () => {
    const slug = uniqueSlug('fixture-links');
    const doc = await payload.create({
      collection: 'projects',
      locale: 'en',
      data: {
        ...projectData(slug),
        links: [{ label: 'Fixture repository', url: 'https://example.com/fixture-repo' }],
        _status: 'published',
      },
      overrideAccess: true,
    });
    // An Arabic edit that re-creates the link rows leaves the English label empty.
    await payload.update({
      collection: 'projects',
      id: doc.id,
      locale: 'ar',
      data: {
        title: 'مشروع تجريبي',
        summary: 'بيانات اختبار تُستخدم في اختبارات نظام إدارة المحتوى فقط.',
        links: [{ label: 'مستودع تجريبي', url: 'https://example.com/fixture-repo' }],
      },
      overrideAccess: true,
    });
    const project = await fetchProjectBySlug({ payload, locale: 'en' }, slug);
    expect(project).not.toBeNull();
    expect(project!.links.every((l) => l.label.length > 0)).toBe(true);
  });
});

describe('education and certificates', () => {
  it('lists public education with its document', async () => {
    const pdf = pdfFixture();
    const file = await payload.create({
      collection: 'documents',
      data: { title: 'Development Fixture diploma' },
      file: { data: pdf, mimetype: 'application/pdf', name: 'd.pdf', size: pdf.length },
      overrideAccess: true,
    });
    await payload.create({
      collection: 'education',
      data: {
        institution: 'Development Fixture Institute',
        degree: 'Development Fixture Degree',
        startDate: '2015-09-01T00:00:00.000Z',
        endDate: '2020-06-01T00:00:00.000Z',
        document: file.id,
        ...published,
      },
      overrideAccess: true,
    });
    await payload.create({
      collection: 'education',
      data: {
        institution: 'Draft Fixture Institute',
        degree: 'Draft Degree',
        translationStatus: 'approved',
        _status: 'draft',
      },
      overrideAccess: true,
    });
    const items = await fetchEducation({ payload, locale: 'en' });
    expect(items.map((e) => e.institution)).toEqual(['Development Fixture Institute']);
    expect(items[0]!.document?.url.startsWith('/api/documents/file/')).toBe(true);
  });

  it('maps certificates with a PDF or image attachment; unapproved locales stay empty', async () => {
    const pdf = pdfFixture();
    const file = await payload.create({
      collection: 'documents',
      data: { title: 'Development Fixture certificate file' },
      file: { data: pdf, mimetype: 'application/pdf', name: 'c.pdf', size: pdf.length },
      overrideAccess: true,
    });
    const png = await pngFixture();
    const img = await payload.create({
      collection: 'media',
      data: { alt: 'Development Fixture certificate image' },
      file: { data: png, mimetype: 'image/png', name: 'c.png', size: png.length },
      overrideAccess: true,
    });
    await payload.create({
      collection: 'certificates',
      data: {
        name: 'Development Fixture Certificate PDF',
        issuer: 'Development Fixture Issuer',
        issueDate: '2025-05-01T00:00:00.000Z',
        credentialId: 'FIXTURE-001',
        attachment: { relationTo: 'documents', value: file.id },
        ...published,
      },
      overrideAccess: true,
    });
    await payload.create({
      collection: 'certificates',
      data: {
        name: 'Development Fixture Certificate Image',
        issuer: 'Development Fixture Issuer',
        issueDate: '2024-05-01T00:00:00.000Z',
        attachment: { relationTo: 'media', value: img.id },
        ...published,
      },
      overrideAccess: true,
    });
    const certs = await fetchCertificates({ payload, locale: 'en' });
    expect(certs.map((c) => c.name)).toEqual([
      'Development Fixture Certificate PDF',
      'Development Fixture Certificate Image',
    ]);
    expect(certs[0]!.attachment).toMatchObject({ kind: 'pdf' });
    expect(certs[1]!.attachment).toMatchObject({ kind: 'image' });
    expect(certs[0]!.credentialId).toBe('FIXTURE-001');
    expect(await fetchCertificates({ payload, locale: 'ar' })).toEqual([]);
    expect((await fetchRouteAvailability({ payload, locale: 'en' })).certificates).toBe(true);
  });
});
