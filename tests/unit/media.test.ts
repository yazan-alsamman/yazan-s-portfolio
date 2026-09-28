import { describe, expect, it } from 'vitest';
import {
  IMAGE_DERIVATIVES,
  IMAGE_LIMITS,
  imageDimensionProblem,
  isOriginalFile,
  optimizationStatus,
  pdfActiveContent,
} from '@/cms/media-policy';
import { publicImage } from '@/content/files';

const allSizes = Object.fromEntries(
  IMAGE_DERIVATIVES.map((d) => [
    d.name,
    { filename: `x-${d.name}.webp`, width: d.width, url: `/api/media/file/x-${d.name}.webp`, height: 100 },
  ]),
);

describe('upload limits', () => {
  it('accepts normal photos and rejects oversize dimensions', () => {
    expect(imageDimensionProblem(6000, 4000)).toBeNull();
    expect(imageDimensionProblem(IMAGE_LIMITS.maxSide + 1, 10)).toMatch(/per side/);
    expect(imageDimensionProblem(9000, 9000)).toMatch(/MP/);
    expect(imageDimensionProblem(undefined, 10)).toMatch(/could not be read/);
  });
});

describe('PDF active content', () => {
  it('detects script, launch, embedded files and form submission — by exact name', () => {
    const pdf = (body: string) => Buffer.from(`%PDF-1.4\n${body}\n%%EOF`, 'latin1');
    expect(pdfActiveContent(pdf('<< /Type /Catalog >>'))).toEqual([]);
    expect(pdfActiveContent(pdf('<< /S /JavaScript /JS (x) >>'))).toEqual(['/JavaScript', '/JS']);
    expect(pdfActiveContent(pdf('<< /S /Launch >>'))).toEqual(['/Launch']);
    expect(pdfActiveContent(pdf('<< /EmbeddedFile 4 0 R >>'))).toEqual(['/EmbeddedFile']);
    expect(pdfActiveContent(pdf('<< /JSON (not a script) /JSX >>'))).toEqual([]); // no partial matches
  });
});

describe('optimization status', () => {
  it('is ready only when every derivative is recorded and present', () => {
    const doc = { mimeType: 'image/jpeg', sizes: allSizes };
    expect(optimizationStatus(doc, () => true).status).toBe('ready');
    expect(optimizationStatus(doc, (f) => !f.includes('card'))).toMatchObject({
      status: 'failed',
      detail: expect.stringMatching(/card \(file missing\)/),
    });
    expect(
      optimizationStatus({ mimeType: 'image/png', sizes: { ...allSizes, full: null } }, () => true).detail,
    ).toMatch(/full \(not generated\)/);
    expect(optimizationStatus({ mimeType: 'application/pdf' }, () => true).status).toBe('not-applicable');
  });

  it('identifies the private original by exact filename', () => {
    expect(isOriginalFile({ filename: 'a.jpg' }, 'a.jpg')).toBe(true);
    expect(isOriginalFile({ filename: 'a.jpg' }, 'a-1600x900.webp')).toBe(false);
    expect(isOriginalFile({ filename: null }, '')).toBe(false);
  });
});

describe('public image selection', () => {
  const media = { alt: 'A system diagram', sizes: allSizes };
  it('prefers the full derivative and never returns the original', () => {
    expect(publicImage(media)?.url).toBe('/api/media/file/x-full.webp');
    expect(publicImage({ ...media, sizes: { ...allSizes, full: null } })?.url).toBe(
      '/api/media/file/x-large.webp',
    );
    expect(publicImage({ ...media, sizes: {} })).toBeNull();
    expect(publicImage(media, ['square'])?.url).toBe('/api/media/file/x-square.webp');
  });
  it('omits meaningful images without alt text; decorative images have empty alt', () => {
    expect(publicImage({ ...media, alt: '  ' })).toBeNull();
    expect(publicImage({ ...media, alt: null, decorative: true })?.alt).toBe('');
    expect(publicImage({ ...media, archived: true })).toBeNull();
  });
});
