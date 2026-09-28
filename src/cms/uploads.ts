import { randomBytes } from 'node:crypto';
import type { CollectionBeforeOperationHook } from 'payload';
import { APIError } from 'payload';
import sharp from 'sharp';
import { imageDimensionProblem, pdfActiveContent } from './media-policy';

/**
 * Upload safety (ADR-009 / T4), independent of the client-supplied MIME type:
 * - the real file type is sniffed from its magic bytes and must match the allowlist,
 * - per-collection size limits,
 * - the stored filename is regenerated (the original is kept only as metadata) —
 *   no user-controlled path segments, no executable extensions, no collisions.
 * SVG is never accepted (script vector).
 */

type Kind = { mime: string; ext: string; test: (b: Buffer) => boolean };

const KINDS: Kind[] = [
  {
    mime: 'image/jpeg',
    ext: 'jpg',
    test: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: 'image/png',
    ext: 'png',
    test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  {
    mime: 'image/webp',
    ext: 'webp',
    test: (b) =>
      b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP',
  },
  {
    mime: 'image/avif',
    ext: 'avif',
    test: (b) =>
      b.subarray(4, 8).toString('latin1') === 'ftyp' &&
      /^avi[fs]$/.test(b.subarray(8, 12).toString('latin1')),
  },
  { mime: 'application/pdf', ext: 'pdf', test: (b) => b.subarray(0, 5).toString('latin1') === '%PDF-' },
];

export function sniffFileType(data: Buffer): Kind | undefined {
  return KINDS.find((kind) => kind.test(data));
}

export function uploadGuard(options: { allowed: string[]; maxBytes: number }): CollectionBeforeOperationHook {
  return async ({ args, operation, req }) => {
    if (operation !== 'create' && operation !== 'update') return args;
    const file = req.file;
    if (!file) return args;

    if (file.size > options.maxBytes) {
      throw new APIError(
        `File is too large (max ${Math.round(options.maxBytes / 1024 / 1024)} MB).`,
        400,
        undefined,
        true,
      );
    }
    const kind = sniffFileType(file.data);
    if (!kind || !options.allowed.includes(kind.mime)) {
      throw new APIError(
        `Unsupported file type. Allowed: ${options.allowed.join(', ')}.`,
        400,
        undefined,
        true,
      );
    }
    // Phase 6 policy: bounded image dimensions (decompression bombs) and no active PDF content.
    if (kind.mime.startsWith('image/')) {
      let problem: string | null;
      try {
        const meta = await sharp(file.data, { limitInputPixels: false }).metadata();
        problem = imageDimensionProblem(meta.width, meta.height);
      } catch {
        problem = imageDimensionProblem(undefined, undefined);
      }
      if (problem) throw new APIError(problem, 400, undefined, true);
    }
    if (kind.mime === 'application/pdf') {
      const active = pdfActiveContent(file.data);
      if (active.length) {
        throw new APIError(
          `PDF rejected: it contains active content (${active.join(', ')}). Upload a plain document (e.g. “Print to PDF”).`,
          400,
          undefined,
          true,
        );
      }
    }
    if (file.mimetype !== kind.mime) {
      // Declared type disagrees with the content: trust the bytes, never the header.
      file.mimetype = kind.mime;
    }

    const original = file.name;
    file.name = `${new Date().toISOString().slice(0, 10)}-${randomBytes(8).toString('hex')}.${kind.ext}`;
    if (args.data && typeof args.data === 'object') {
      (args.data as Record<string, unknown>).originalFilename = original.slice(0, 200);
    }
    return args;
  };
}

export const MB = 1024 * 1024;
