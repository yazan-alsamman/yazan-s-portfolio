import { beforeAll, describe, expect, it } from 'vitest';
import type { Payload } from 'payload';
import { getOverview } from '@/cms/admin/overview';
import { publicStatus } from '@/cms/admin/public-status';
import { cms, pdfFixture, pngFixture, projectData, uniqueSlug } from './harness';

/**
 * Phase 5 — dashboard server logic on a real (isolated, freshly migrated) PostgreSQL database:
 * the overview aggregates, the per-document "On the public site" status, and the library
 * delete guard (archive first, never while in use). Labelled development fixtures only.
 */

let payload: Payload;

beforeAll(async () => {
  payload = await cms();
});

describe('overview', () => {
  it('counts published / draft / archived per collection and reports system status', async () => {
    const before = await getOverview(payload);
    await payload.create({
      collection: 'projects',
      data: { ...projectData(uniqueSlug('ov-pub')), _status: 'published' },
      overrideAccess: true,
    });
    await payload.create({
      collection: 'projects',
      data: { ...projectData(uniqueSlug('ov-draft')), _status: 'draft' },
      overrideAccess: true,
    });
    await payload.create({
      collection: 'projects',
      data: { ...projectData(uniqueSlug('ov-arch')), archived: true, _status: 'published' },
      overrideAccess: true,
    });
    const after = await getOverview(payload);
    const d = (k: 'total' | 'published' | 'draft' | 'archived') =>
      after.counts.projects[k] - before.counts.projects[k];
    expect([d('total'), d('published'), d('draft'), d('archived')]).toEqual([3, 1, 1, 1]);
    expect(after.system.database).toBe('ok');
    expect(after.system.migrations).toBeGreaterThanOrEqual(1);
    expect(after.routes.en.projects).toBe(true);
    expect(after.arabicGate.status).toBe('pending'); // D-9: Arabic copy review not approved
    expect(after.recent.length).toBeGreaterThan(0);
    expect(after.recent[0]).toMatchObject({ collection: 'projects' });
  });

  it('flags images without Arabic alt text', async () => {
    const png = await pngFixture();
    const before = (await getOverview(payload)).media.imagesMissingAltAr;
    await payload.create({
      collection: 'media',
      data: { alt: 'Development fixture — English alt only' },
      file: { data: png, mimetype: 'image/png', name: 'alt.png', size: png.length },
      overrideAccess: true,
    });
    expect((await getOverview(payload)).media.imagesMissingAltAr).toBe(before + 1);
  });
});

describe('public status (“On the public site” panel)', () => {
  it('explains exactly why a language is not public, and links it once it is', async () => {
    const slug = uniqueSlug('status');
    const doc = await payload.create({
      collection: 'projects',
      data: { ...projectData(slug), translationStatus: 'draft', _status: 'draft' },
      overrideAccess: true,
    });
    let [en, ar] = await publicStatus(payload, 'projects', doc.id);
    expect(en!.live).toBe(false);
    expect(en!.reasons.join(' ')).toMatch(/Not published yet/);

    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: { translationStatus: 'in_review', _status: 'published' },
      overrideAccess: true,
    });
    [en, ar] = await publicStatus(payload, 'projects', doc.id);
    expect(en!.reasons.join(' ')).toMatch(/“in_review”, not “Approved”/);

    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: { translationStatus: 'approved', _status: 'published' },
      overrideAccess: true,
    });
    [en, ar] = await publicStatus(payload, 'projects', doc.id);
    expect(en).toMatchObject({ live: true, urls: [`/projects/${slug}`], reasons: [] });
    // Arabic: nothing authored → not public, required fields named, production gate flagged.
    expect(ar!.live).toBe(false);
    expect(ar!.reasons.join(' ')).toMatch(/Title is empty in this language/);
    expect(ar!.gatedInProduction).toBe(true);
  });

  it('reports the CV per language, including the visibility switch', async () => {
    const [en] = await publicStatus(payload, 'cv', undefined);
    expect(en!.live).toBe(false);
    expect(en!.reasons.join(' ')).toMatch(/Download visible|No PDF/);
  });
});

describe('library delete guard (archive first, never while in use)', () => {
  it('refuses to delete a file that is not archived, or archived but still used; allows it when unused', async () => {
    const png = await pngFixture();
    const img = await payload.create({
      collection: 'media',
      data: { alt: 'Development fixture cover image' },
      file: { data: png, mimetype: 'image/png', name: 'cover.png', size: png.length },
      overrideAccess: true,
    });
    await expect(payload.delete({ collection: 'media', id: img.id, overrideAccess: true })).rejects.toThrow(
      /Archive this file before deleting/,
    );
    const project = await payload.create({
      collection: 'projects',
      data: { ...projectData(uniqueSlug('uses-cover')), cover: img.id, _status: 'published' },
      overrideAccess: true,
    });
    await payload.update({ collection: 'media', id: img.id, data: { archived: true }, overrideAccess: true });
    await expect(payload.delete({ collection: 'media', id: img.id, overrideAccess: true })).rejects.toThrow(
      /still used by: project cover/,
    );
    await payload.update({
      collection: 'projects',
      id: project.id,
      data: { cover: null },
      overrideAccess: true,
    });
    await expect(
      payload.delete({ collection: 'media', id: img.id, overrideAccess: true }),
    ).resolves.toBeTruthy();
  });

  it('protects a PDF that is the current CV', async () => {
    const pdf = pdfFixture();
    const file = await payload.create({
      collection: 'documents',
      data: { title: 'Development fixture CV', archived: true },
      file: { data: pdf, mimetype: 'application/pdf', name: 'cv.pdf', size: pdf.length },
      overrideAccess: true,
    });
    await payload.updateGlobal({ slug: 'cv', locale: 'en', data: { file: file.id }, overrideAccess: true });
    await expect(
      payload.delete({ collection: 'documents', id: file.id, overrideAccess: true }),
    ).rejects.toThrow(/still used by: CV \(en\)/);
    await payload.updateGlobal({ slug: 'cv', locale: 'en', data: { file: null }, overrideAccess: true });
    await expect(
      payload.delete({ collection: 'documents', id: file.id, overrideAccess: true }),
    ).resolves.toBeTruthy();
  });
});
