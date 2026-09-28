import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload';
import { revalidateCmsTags } from '@/content/cache-tags';

/**
 * Revalidation + audit hooks (T6, DASHBOARD_SPEC "Safety").
 *
 * Payload runs in the same Next.js process, so a publish in the admin invalidates the public
 * cache immediately via tag revalidation (no webhook hop). Outside a Next request context
 * (seed/migration scripts, tests) revalidation is a no-op and is reported, never thrown.
 * The signed /api/revalidate route covers out-of-process triggers.
 */

export function collectionRevalidate(collection: string): CollectionAfterChangeHook {
  return ({ doc, previousDoc, req }) => {
    // Draft-only saves don't change public content; publishes, unpublishes and archives do.
    const status = (doc as { _status?: string })._status;
    const previousStatus = (previousDoc as { _status?: string } | undefined)?._status;
    if (status === 'draft' && previousStatus !== 'published') return doc;
    revalidateCmsTags([collection], req);
    return doc;
  };
}

export function collectionRevalidateOnDelete(collection: string): CollectionAfterDeleteHook {
  return ({ doc, req }) => {
    revalidateCmsTags([collection], req);
    return doc;
  };
}

export function globalRevalidate(global: string): GlobalAfterChangeHook {
  return ({ doc, req }) => {
    revalidateCmsTags([global], req);
    return doc;
  };
}

/** Append-only audit log of content changes (who, what, when). Written with system privileges. */
export function auditChange(collection: string): CollectionAfterChangeHook {
  return async ({ doc, operation, req }) => {
    await writeAudit(req, {
      collection,
      documentId: String((doc as { id: string | number }).id),
      action: operation === 'create' ? 'create' : describeUpdate(doc as Record<string, unknown>),
    });
    return doc;
  };
}

export function auditDelete(collection: string): CollectionAfterDeleteHook {
  return async ({ doc, req }) => {
    await writeAudit(req, {
      collection,
      documentId: String((doc as { id: string | number }).id),
      action: 'delete',
    });
    return doc;
  };
}

export function auditGlobal(global: string): GlobalAfterChangeHook {
  return async ({ doc, req }) => {
    await writeAudit(req, { collection: `global:${global}`, documentId: global, action: 'update' });
    return doc;
  };
}

function describeUpdate(doc: Record<string, unknown>): string {
  if (doc.archived) return 'archive';
  if (doc._status === 'published') return 'publish';
  if (doc._status === 'draft') return 'save-draft';
  return 'update';
}

async function writeAudit(
  req: PayloadRequest,
  entry: { collection: string; documentId: string; action: string },
): Promise<void> {
  const user = req.user as { id?: string | number; email?: string } | null | undefined;
  await req.payload.create({
    collection: 'audit-log',
    data: {
      ...entry,
      userEmail: user?.email ?? 'system',
      locale: typeof req.locale === 'string' ? req.locale : null,
    },
    req, // same transaction: the audit row commits or rolls back with the change
    overrideAccess: true,
  });
}
