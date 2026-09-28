import { existsSync } from 'node:fs';
import path from 'node:path';
import type {
  CollectionBeforeDeleteHook,
  CollectionConfig,
  Field,
  Payload,
  PayloadRequest,
  TypeWithID,
  Where,
} from 'payload';
import { APIError } from 'payload';
import { adminOnly, isAdmin, notArchivedOrAdmin } from '../access';
import { archiveFields, sourceNoteField, stampArchivedAt } from '../fields';
import { auditChange, collectionRevalidate } from '../hooks';
import { IMAGE_DERIVATIVES, isOriginalFile, optimizationStatus, type SizesRecord } from '../media-policy';
import { MB, uploadGuard } from '../uploads';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const IMAGES_DIR = path.resolve(process.env.MEDIA_DIR ?? 'media', 'images');
const DOCUMENTS_DIR = path.resolve(process.env.MEDIA_DIR ?? 'media', 'documents');

/**
 * ADR-008 "the original is stored privately (never served)": the uploaded original stays on
 * disk (recoverable, and visible to signed-in admins), but anonymous requests for it get 404.
 * Public pages only ever reference derivatives — re-encoded WebP without EXIF/GPS metadata.
 * Runs after Payload's own access check (archived files are already refused there).
 */
function originalIsPrivate(req: PayloadRequest, args: { doc: TypeWithID; params: { filename: string } }) {
  if (isAdmin(req.user)) return;
  if (isOriginalFile(args.doc as { filename?: string | null }, args.params.filename)) {
    return new Response('Not found', { status: 404, headers: { 'X-Content-Type-Options': 'nosniff' } });
  }
}

/**
 * Optimization status (Phase 6), computed on every read from what actually exists: every
 * derivative recorded AND present on disk → ready; anything missing → failed (with the reason).
 * Virtual: no database column, never stale.
 */
const optimizationFields: Field[] = [
  {
    name: 'optimizationStatus',
    label: 'Optimization',
    type: 'select',
    virtual: true,
    options: [
      { label: 'Ready', value: 'ready' },
      { label: 'Failed', value: 'failed' },
      { label: 'Not applicable', value: 'not-applicable' },
    ],
    admin: {
      readOnly: true,
      position: 'sidebar',
      description:
        'Derivatives are generated during the upload itself (the upload fails if they cannot be made). Failed = a derivative is missing — re-upload the file.',
    },
    hooks: {
      afterRead: [
        ({ data }) =>
          optimizationStatus(data as { mimeType?: string | null; sizes?: SizesRecord | null }, (name) =>
            existsSync(path.join(IMAGES_DIR, name)),
          ).status,
      ],
    },
  },
  {
    name: 'optimizationDetail',
    label: 'Derivatives',
    type: 'textarea',
    virtual: true,
    admin: { readOnly: true, position: 'sidebar' },
    hooks: {
      afterRead: [
        ({ data }) =>
          optimizationStatus(data as { mimeType?: string | null; sizes?: SizesRecord | null }, (name) =>
            existsSync(path.join(IMAGES_DIR, name)),
          ).detail,
      ],
    },
  },
];

/** Every place a library file can be referenced (collections + globals). */
async function usages(payload: Payload, slug: 'media' | 'documents', id: number | string): Promise<string[]> {
  const found: string[] = [];
  const check = async (
    label: string,
    collection: 'projects' | 'certificates' | 'education',
    where: Where,
  ) => {
    const r = await payload.count({ collection, where, overrideAccess: true });
    if (r.totalDocs) found.push(`${label} (${r.totalDocs})`);
  };
  if (slug === 'media') {
    await check('project cover', 'projects', { cover: { equals: id } });
    await check('project gallery', 'projects', { gallery: { contains: id } });
    await check('certificate', 'certificates', {
      and: [{ 'attachment.relationTo': { equals: 'media' } }, { 'attachment.value': { equals: id } }],
    });
    const profile = await payload.findGlobal({
      slug: 'profile',
      depth: 0,
      overrideAccess: true,
      draft: true,
    });
    if (String(profile.portrait ?? '') === String(id)) found.push('profile portrait');
  } else {
    await check('education document', 'education', { document: { equals: id } });
    await check('certificate', 'certificates', {
      and: [{ 'attachment.relationTo': { equals: 'documents' } }, { 'attachment.value': { equals: id } }],
    });
    for (const locale of ['en', 'ar'] as const) {
      const cv = await payload.findGlobal({
        slug: 'cv',
        depth: 0,
        locale,
        overrideAccess: true,
        draft: true,
      });
      if (String(cv.file ?? '') === String(id)) found.push(`CV (${locale})`);
    }
  }
  return found;
}

/**
 * DASHBOARD_SPEC "Safety" for the library (Phase 5): a file can be deleted permanently only
 * after it is archived AND nothing references it any more — deleting a file that a page uses
 * would silently break that page. Archiving already hides it from the public site.
 */
function deleteOnlyUnusedArchived(slug: 'media' | 'documents'): CollectionBeforeDeleteHook {
  return async ({ req, id }) => {
    const doc = await req.payload.findByID({ collection: slug, id, depth: 0, req, overrideAccess: true });
    if (!(doc as { archived?: boolean }).archived) {
      throw new APIError('Archive this file before deleting it permanently.', 400, undefined, true);
    }
    const used = await usages(req.payload, slug, id);
    if (used.length) {
      throw new APIError(
        `This file is still used by: ${used.join(', ')}. Remove it there first.`,
        400,
        undefined,
        true,
      );
    }
  };
}

/**
 * Images (T4 / ADR-009). Local filesystem storage under MEDIA_DIR (a persistent volume on the
 * VPS, ADR-012); the storage-adapter seam allows S3-compatible storage later without schema change.
 * Originals are never modified; derivatives are generated without enlargement (no upscaling —
 * relevant for the 538×661 portrait, D-5).
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image', plural: 'Images' },
  admin: {
    group: 'Library',
    useAsTitle: 'originalFilename',
    description:
      'JPEG, PNG, WebP or AVIF (max 15 MB, max 12,000 px per side). Alt text is required in each language unless the image is decorative — without it, the image is not shown in that language. Public pages use optimized copies only; the original stays private. Delete = archive first, and only when unused.',
    defaultColumns: ['filename', 'alt', 'optimizationStatus', 'width', 'height', 'filesize', 'archived'],
    listSearchableFields: ['originalFilename', 'filename', 'alt'],
  },
  access: { read: notArchivedOrAdmin, create: adminOnly, update: adminOnly, delete: adminOnly },
  upload: {
    staticDir: IMAGES_DIR,
    mimeTypes: IMAGE_TYPES,
    focalPoint: true,
    crop: true,
    // Derivatives (media-policy.ts): WebP, never enlarged, EXIF/GPS not copied (sharp default).
    imageSizes: IMAGE_DERIVATIVES.map((d) => ({
      name: d.name,
      width: d.width,
      ...('height' in d ? { height: d.height, position: 'centre' as const } : {}),
      withoutEnlargement: true,
      formatOptions: { format: 'webp' as const, options: { quality: d.quality } },
    })),
    adminThumbnail: 'thumbnail',
    handlers: [originalIsPrivate],
    // Filenames are unique per upload (never reused), so files can be cached for a year.
    modifyResponseHeaders: ({ headers }) => {
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      return headers;
    },
  },
  hooks: {
    beforeOperation: [uploadGuard({ allowed: IMAGE_TYPES, maxBytes: 15 * MB })],
    beforeChange: [({ data, originalDoc }) => stampArchivedAt(data, originalDoc)],
    beforeDelete: [deleteOnlyUnusedArchived('media')],
    afterChange: [collectionRevalidate('media'), auditChange('media')],
  },
  fields: [
    {
      name: 'decorative',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Purely decorative images get empty alt text (SEO_MASTER §26).' },
    },
    {
      name: 'alt',
      type: 'text',
      localized: true,
      admin: {
        description:
          'Describe the image’s content/function. Required in each published language unless decorative.',
      },
      validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
        siblingData?.decorative || (typeof value === 'string' && value.trim().length >= 3)
          ? true
          : 'Alt text is required for non-decorative images.',
    },
    { name: 'caption', type: 'text', localized: true },
    { name: 'originalFilename', type: 'text', admin: { readOnly: true } },
    ...optimizationFields,
    // Usage tracking (T4): where this image is used.
    { name: 'usedAsCover', type: 'join', collection: 'projects', on: 'cover', admin: { allowCreate: false } },
    {
      name: 'usedInGalleries',
      type: 'join',
      collection: 'projects',
      on: 'gallery',
      admin: { allowCreate: false },
    },
    ...archiveFields(),
    sourceNoteField(),
  ],
};

/** PDFs: CV files and certificate documents (T3/T5). */
export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: { singular: 'Document', plural: 'Documents (PDF)' },
  admin: {
    group: 'Library',
    useAsTitle: 'title',
    description:
      'PDF only (max 20 MB, no scripts, attachments or form submission). CV files, certificate files, diplomas. Served inline with noindex; each upload gets a new URL. Delete = archive first, and only when unused.',
    defaultColumns: ['title', 'filename', 'filesize', 'archived', 'updatedAt'],
    listSearchableFields: ['title', 'originalFilename', 'filename'],
  },
  access: { read: notArchivedOrAdmin, create: adminOnly, update: adminOnly, delete: adminOnly },
  upload: {
    staticDir: DOCUMENTS_DIR,
    mimeTypes: ['application/pdf'],
    // Documents are public as uploaded (they are the published CV/certificates); never indexed
    // (X-Robots-Tag from next.config for /api/*), never sniffed, cached for a day.
    modifyResponseHeaders: ({ headers }) => {
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('Content-Disposition', 'inline');
      headers.set('Cache-Control', 'public, max-age=86400');
      return headers;
    },
  },
  hooks: {
    beforeOperation: [uploadGuard({ allowed: ['application/pdf'], maxBytes: 20 * MB })],
    beforeChange: [({ data, originalDoc }) => stampArchivedAt(data, originalDoc)],
    beforeDelete: [deleteOnlyUnusedArchived('documents')],
    afterChange: [collectionRevalidate('documents'), auditChange('documents')],
  },
  fields: [
    { name: 'title', type: 'text', localized: true },
    { name: 'originalFilename', type: 'text', admin: { readOnly: true } },
    ...archiveFields(),
    sourceNoteField(),
  ],
};
