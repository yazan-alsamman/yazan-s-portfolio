import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Payload } from 'payload';
import { portraitAlt, portraitSources } from '@/config/media';

/**
 * Portrait handling in the CMS (Phase 6, ADR-008, owner decision D-5).
 *
 * The owner-approved `portrait.jpg` (538 × 661) stays the authoritative source and the site's
 * default: the cinematic landing (frozen) and the About page use it straight from the
 * repository. This module adds the CMS path WITHOUT forcing it:
 *   - `importApprovedPortrait` copies the approved file into the Media library byte-for-byte
 *     (SHA-256 verified before and after), with EN/AR alt text and a focal point on the face,
 *     so its derivatives — including the focal-point `square` crop, which leaves out the third
 *     party's hand at the bottom edge — are generated conventionally (no AI, no enlargement).
 *   - It never sets the Profile portrait: choosing it (or another photo) is the owner's action
 *     in the dashboard. Idempotent: an existing import is reused.
 */

const approved = portraitSources[0]!;
export const APPROVED_PORTRAIT_SHA256 = approved.sha256;
export const PORTRAIT_SOURCE_NOTE = `Approved portrait.jpg (owner decision D-5), SHA-256 ${approved.sha256}. Imported unmodified.`;
/** Face position in the approved image (percent of width/height), used for focal-point crops. */
export const PORTRAIT_FOCAL_POINT = { x: 55, y: 38 } as const;

export function sha256(data: Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

export function readApprovedPortrait(rootDir = process.cwd()): Buffer {
  const data = readFileSync(path.resolve(rootDir, approved.path));
  const hash = sha256(data);
  if (hash !== approved.sha256) {
    throw new Error(`portrait.jpg does not match the approved file (SHA-256 ${hash}); refusing to import.`);
  }
  return data;
}

export async function importApprovedPortrait(
  payload: Payload,
  options: { rootDir?: string; imagesDir: string },
): Promise<{ id: number | string; created: boolean }> {
  const existing = await payload.find({
    collection: 'media',
    where: { sourceNote: { equals: PORTRAIT_SOURCE_NOTE } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  if (existing.docs[0]) return { id: existing.docs[0].id, created: false };

  const data = readApprovedPortrait(options.rootDir);
  const doc = await payload.create({
    collection: 'media',
    locale: 'en',
    data: {
      alt: portraitAlt.en,
      focalX: PORTRAIT_FOCAL_POINT.x,
      focalY: PORTRAIT_FOCAL_POINT.y,
      sourceNote: PORTRAIT_SOURCE_NOTE,
    },
    file: { data, mimetype: 'image/jpeg', name: 'portrait.jpg', size: data.length },
    overrideAccess: true,
  });
  await payload.update({
    collection: 'media',
    id: doc.id,
    locale: 'ar',
    data: { alt: portraitAlt.ar },
    overrideAccess: true,
  });

  // The stored original must be the approved bytes (not re-encoded, not cropped).
  const stored = readFileSync(path.join(options.imagesDir, String(doc.filename)));
  if (sha256(stored) !== approved.sha256) {
    throw new Error('Stored portrait differs from the approved file — import aborted.');
  }
  return { id: doc.id, created: true };
}
