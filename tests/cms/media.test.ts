import { existsSync, readFileSync, renameSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { beforeAll, describe, expect, it } from 'vitest';
import type { Payload } from 'payload';
import { fetchProjectBySlug } from '@/content/payload-adapter';
import { IMAGE_DERIVATIVES } from '@/cms/media-policy';
import { APPROVED_PORTRAIT_SHA256, importApprovedPortrait, sha256 } from '@/cms/portrait';
import { cms, pdfFixture, projectData, uniqueSlug } from './harness';

/**
 * Phase 6 — media & document pipeline on the real CMS (isolated `_test` database, real files):
 * derivatives (no enlargement, EXIF/GPS stripped), optimization status from reality, upload
 * limits, PDF active-content policy, public image selection, and the approved-portrait import.
 */

let payload: Payload;
const IMAGES_DIR = path.resolve(process.env.MEDIA_DIR ?? 'media', 'images');

beforeAll(async () => {
  payload = await cms();
});

async function jpegWithGps(width = 1200, height = 800): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: { r: 60, g: 70, b: 80 } } })
    .jpeg()
    .withExif({
      IFD0: { Copyright: 'Development fixture', Software: 'fixture' },
      IFD3: {
        GPSLatitudeRef: 'N',
        GPSLatitude: '33/1 30/1 0/1',
        GPSLongitudeRef: 'E',
        GPSLongitude: '36/1 17/1 0/1',
      },
    })
    .toBuffer();
}

async function upload(data: Buffer, name: string, mimetype: string, extra: Record<string, unknown> = {}) {
  return payload.create({
    collection: 'media',
    data: { alt: 'Development fixture image', ...extra },
    file: { data, mimetype, name, size: data.length },
    overrideAccess: true,
  });
}

describe('image derivatives', () => {
  it('generates every derivative as WebP, never enlarged, with EXIF/GPS removed (original kept intact)', async () => {
    const original = await jpegWithGps(1200, 800);
    expect((await sharp(original).metadata()).exif).toBeDefined(); // the fixture really carries EXIF/GPS
    const doc = await upload(original, 'gps.jpg', 'image/jpeg');
    for (const d of IMAGE_DERIVATIVES) {
      const size = (doc.sizes as Record<string, { filename: string; width: number; height: number }>)[
        d.name
      ]!;
      expect(size?.filename, d.name).toBeTruthy();
      const meta = await sharp(path.join(IMAGES_DIR, size.filename)).metadata();
      expect(meta.format).toBe('webp');
      expect(meta.exif, `${d.name} must not carry EXIF/GPS`).toBeUndefined();
      expect(size.width).toBeLessThanOrEqual(Math.min(1200, d.width)); // no enlargement
    }
    // `full` keeps the whole 1200 px image; `square` is a real 512×512 crop.
    expect(doc.sizes?.full?.width).toBe(1200);
    expect([doc.sizes?.square?.width, doc.sizes?.square?.height]).toEqual([512, 512]);
    // The original is preserved byte-for-byte (private on the web, see e2e).
    expect(sha256(readFileSync(path.join(IMAGES_DIR, String(doc.filename))))).toBe(sha256(original));
  });

  it('reports optimization status from reality: ready, then failed when a derivative disappears', async () => {
    const doc = await upload(await jpegWithGps(900, 600), 'status.jpg', 'image/jpeg');
    const read = async () =>
      (await payload.findByID({ collection: 'media', id: doc.id, overrideAccess: true })) as unknown as {
        optimizationStatus: string;
        optimizationDetail: string;
      };
    expect((await read()).optimizationStatus).toBe('ready');
    const file = path.join(IMAGES_DIR, String(doc.sizes?.card?.filename));
    renameSync(file, `${file}.moved`);
    try {
      const r = await read();
      expect(r.optimizationStatus).toBe('failed');
      expect(r.optimizationDetail).toMatch(/card \(file missing\)/);
    } finally {
      renameSync(`${file}.moved`, file);
    }
    expect((await read()).optimizationStatus).toBe('ready');
  });

  it('rejects images beyond the pixel limits (decompression-bomb protection)', async () => {
    const wide = await sharp({ create: { width: 12_001, height: 4, channels: 3, background: '#000' } })
      .png()
      .toBuffer();
    await expect(upload(wide, 'wide.png', 'image/png')).rejects.toThrow(/max 12000 px per side/);
  });
});

describe('PDF policy', () => {
  it('accepts a plain PDF and rejects PDFs with active content', async () => {
    const plain = pdfFixture();
    const ok = await payload.create({
      collection: 'documents',
      data: { title: 'Development fixture plain PDF' },
      file: { data: plain, mimetype: 'application/pdf', name: 'plain.pdf', size: plain.length },
      overrideAccess: true,
    });
    expect(ok.id).toBeTruthy();
    const withJs = Buffer.from(
      plain
        .toString('latin1')
        .replace(
          '<< /Type /Catalog /Pages 2 0 R >>',
          '<< /Type /Catalog /Pages 2 0 R /OpenAction << /S /JavaScript /JS (app.alert(1)) >> >>',
        ),
      'latin1',
    );
    await expect(
      payload.create({
        collection: 'documents',
        data: { title: 'Development fixture active PDF' },
        file: { data: withJs, mimetype: 'application/pdf', name: 'active.pdf', size: withJs.length },
        overrideAccess: true,
      }),
    ).rejects.toThrow(/active content \(\/JavaScript, \/JS\)/);
  });
});

describe('public image selection (content layer)', () => {
  it('serves an optimized derivative, never the original, and hides images without alt text in that locale', async () => {
    const cover = await upload(await jpegWithGps(1600, 900), 'cover.jpg', 'image/jpeg', {
      alt: 'Development fixture cover (English alt only)',
    });
    const slug = uniqueSlug('media-public');
    await payload.create({
      collection: 'projects',
      data: { ...projectData(slug), cover: cover.id, _status: 'published' },
      overrideAccess: true,
    });
    await payload.update({
      collection: 'projects',
      id: (
        await payload.find({
          collection: 'projects',
          where: { slug: { equals: slug } },
          overrideAccess: true,
        })
      ).docs[0]!.id,
      locale: 'ar',
      data: {
        title: 'مشروع تجريبي',
        summary: 'بيانات اختبار لنظام إدارة المحتوى فقط.',
        seo: {
          title: 'مشروع تجريبي — بيانات اختبار',
          description:
            'بيانات اختبار تُستخدم في اختبارات نظام إدارة المحتوى فقط وليست محتوى حقيقياً للموقع إطلاقاً.',
        },
        translationStatus: 'approved',
        _status: 'published',
      },
      overrideAccess: true,
    });
    const en = await fetchProjectBySlug({ payload, locale: 'en' }, slug);
    expect(en?.cover?.url).toBe(`/api/media/file/${cover.sizes?.full?.filename}`);
    expect(en?.cover?.url).not.toContain(String(cover.filename));
    expect(en?.cover?.alt).toBe('Development fixture cover (English alt only)');
    const ar = await fetchProjectBySlug({ payload, locale: 'ar' }, slug);
    expect(ar).not.toBeNull();
    expect(ar?.cover).toBeNull(); // no Arabic alt text → not shown in Arabic (no English fallback)
  });
});

describe('approved portrait (portrait.jpg, owner decision D-5)', () => {
  it('imports the approved file unmodified, idempotently, with a focal-point square crop', async () => {
    expect(sha256(readFileSync(path.resolve('portrait.jpg')))).toBe(APPROVED_PORTRAIT_SHA256);
    const first = await importApprovedPortrait(payload, { imagesDir: IMAGES_DIR });
    expect(first.created).toBe(true);
    const doc = await payload.findByID({ collection: 'media', id: first.id, overrideAccess: true });
    expect(sha256(readFileSync(path.join(IMAGES_DIR, String(doc.filename))))).toBe(APPROVED_PORTRAIT_SHA256);
    expect([doc.width, doc.height]).toEqual([538, 661]);
    expect([doc.sizes?.square?.width, doc.sizes?.square?.height]).toEqual([512, 512]);
    expect(doc.sizes?.full?.width).toBe(538); // never enlarged
    const ar = await payload.findByID({
      collection: 'media',
      id: first.id,
      locale: 'ar',
      overrideAccess: true,
    });
    expect(ar.alt).toBe('صورة شخصية ليزن السمان');
    // The Profile is not changed by the import (the owner chooses in the dashboard).
    const profile = await payload.findGlobal({ slug: 'profile', depth: 0, overrideAccess: true });
    expect(profile.portrait ?? null).toBeNull();
    // Idempotent.
    expect(await importApprovedPortrait(payload, { imagesDir: IMAGES_DIR })).toEqual({
      id: first.id,
      created: false,
    });
    // The repository original is untouched.
    expect(sha256(readFileSync(path.resolve('portrait.jpg')))).toBe(APPROVED_PORTRAIT_SHA256);
    expect(existsSync(path.join(IMAGES_DIR, String(doc.sizes?.square?.filename)))).toBe(true);
  });
});
