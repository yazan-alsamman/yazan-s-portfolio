/**
 * Media & document policy (Phase 6 — ADR-008 / ADR-009). Pure rules, no Payload or fs imports,
 * so they are unit-tested and shared by upload hooks, the Media collection and the public reader.
 */

/* ----------------------------------------------------------------------------------------------
 * Image derivatives. Generated synchronously by Payload + sharp during the upload request.
 * - WebP, never enlarged (`withoutEnlargement`), metadata (EXIF/GPS) not copied (sharp default).
 * - `full` is what public pages use as the source for next/image (which then serves AVIF/WebP
 *   at responsive widths). The uploaded original is kept but never served publicly (ADR-008).
 * - `square` is a 512×512 focal-point crop (portraits: keeps the face, drops the edges). 512 is
 *   deliberately below the approved 538×661 portrait: with `withoutEnlargement`, a target larger
 *   than the source would return the image uncropped. Sources under 512 px stay uncropped.
 * -------------------------------------------------------------------------------------------- */
export const IMAGE_DERIVATIVES = [
  { name: 'thumbnail', width: 480, quality: 80 },
  { name: 'card', width: 960, quality: 80 },
  { name: 'large', width: 1600, quality: 82 },
  { name: 'full', width: 2560, quality: 82 },
  { name: 'square', width: 512, height: 512, quality: 84 },
] as const;

export type DerivativeName = (typeof IMAGE_DERIVATIVES)[number]['name'];

/** Public source preference: the largest general-purpose derivative first. */
export const PUBLIC_SOURCE_ORDER: readonly DerivativeName[] = ['full', 'large', 'card', 'thumbnail'];

/* ----------------------------------------------------------------------------------------------
 * Upload limits (ADR-009 "maximum pixel dimensions enforced"): protects the server from
 * decompression bombs and absurd inputs. Generous for real photography and screenshots.
 * -------------------------------------------------------------------------------------------- */
export const IMAGE_LIMITS = { maxSide: 12_000, maxPixels: 60_000_000 } as const;

export function imageDimensionProblem(width: number | undefined, height: number | undefined): string | null {
  if (!width || !height) return 'The image dimensions could not be read (corrupt or unsupported file).';
  if (width > IMAGE_LIMITS.maxSide || height > IMAGE_LIMITS.maxSide) {
    return `Image is too large: ${width}×${height} px (max ${IMAGE_LIMITS.maxSide} px per side).`;
  }
  if (width * height > IMAGE_LIMITS.maxPixels) {
    return `Image is too large: ${((width * height) / 1e6).toFixed(1)} MP (max ${IMAGE_LIMITS.maxPixels / 1e6} MP).`;
  }
  return null;
}

/* ----------------------------------------------------------------------------------------------
 * PDF policy: portfolio PDFs (CV, certificates, diplomas) are documents, never applications.
 * Reject files declaring active content. This is a static, best-effort check on the raw bytes
 * (names inside compressed object streams can escape it); malware scanning is a Phase 9 item.
 * -------------------------------------------------------------------------------------------- */
const PDF_ACTIVE = ['/JavaScript', '/JS', '/Launch', '/EmbeddedFile', '/RichMedia', '/SubmitForm'] as const;

export function pdfActiveContent(data: Buffer): string[] {
  const text = data.toString('latin1');
  // Match PDF name tokens exactly (a name ends at whitespace or a delimiter).
  return PDF_ACTIVE.filter((name) => new RegExp(`${name.replace('/', '\\/')}(?![A-Za-z0-9])`).test(text));
}

/* ----------------------------------------------------------------------------------------------
 * Optimization status (DASHBOARD_SPEC "Media library: optimization status").
 * Processing is synchronous: an upload either finishes with its derivatives or is rejected, so
 * "pending/processing" are never observable and are not reported. The status is computed from
 * reality on every read: are all derivatives recorded AND present on disk?
 * -------------------------------------------------------------------------------------------- */
export type OptimizationStatus = 'ready' | 'failed' | 'not-applicable';

export type SizesRecord = Partial<Record<string, { filename?: string | null; width?: number | null } | null>>;

export function optimizationStatus(
  doc: { mimeType?: string | null; sizes?: SizesRecord | null },
  fileExists: (filename: string) => boolean,
): { status: OptimizationStatus; detail: string } {
  if (!doc.mimeType?.startsWith('image/')) return { status: 'not-applicable', detail: 'Not an image.' };
  const missing: string[] = [];
  const widths: string[] = [];
  for (const d of IMAGE_DERIVATIVES) {
    const size = doc.sizes?.[d.name];
    if (!size?.filename) missing.push(`${d.name} (not generated)`);
    else if (!fileExists(size.filename)) missing.push(`${d.name} (file missing)`);
    else widths.push(`${d.name} ${size.width ?? '?'}px`);
  }
  if (missing.length)
    return { status: 'failed', detail: `Missing: ${missing.join(', ')}. Re-upload the file to regenerate.` };
  return { status: 'ready', detail: `${widths.join(' · ')} · WebP, metadata stripped · original private` };
}

/** True when `filename` is the uploaded original (not a derivative) of `doc`. */
export function isOriginalFile(doc: { filename?: string | null }, filename: string): boolean {
  return Boolean(doc.filename) && doc.filename === filename;
}
