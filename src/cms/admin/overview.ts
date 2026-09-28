import type { Payload } from 'payload';
import { routing, type Locale } from '@/i18n/routing';
import { copyReview } from '@/config/copy-review';
import { fetchRouteAvailability } from '@/content/payload-adapter';
import type { RouteAvailability } from '@/content/types';

/**
 * Dashboard overview (DASHBOARD_SPEC "Overview"): content counts by publication state, public
 * route status per language, recent changes, media summary and system status.
 * Read-only, admin-only (rendered inside the authenticated admin), Local API with system
 * privileges for counting — it never exposes document content, only aggregates.
 */

export const EDITORIAL = ['projects', 'experience', 'education', 'certificates', 'skills'] as const;
export type EditorialSlug = (typeof EDITORIAL)[number];

export type StateCounts = { total: number; published: number; draft: number; archived: number };

export type Overview = {
  counts: Record<EditorialSlug, StateCounts>;
  routes: Record<Locale, RouteAvailability>;
  arabicGate: { status: 'approved' | 'pending'; reviewer: string | null };
  recent: {
    id: string;
    when: string;
    collection: string;
    documentId: string;
    action: string;
    user: string;
    locale: string | null;
  }[];
  media: {
    images: number;
    imagesArchived: number;
    imagesMissingAltAr: number;
    documents: number;
    documentsArchived: number;
  };
  system: { database: 'ok' | 'error'; migrations: number; siteEnv: string };
};

async function stateCounts(payload: Payload, collection: EditorialSlug): Promise<StateCounts> {
  const count = async (where?: Parameters<Payload['count']>[0]['where']) =>
    (await payload.count({ collection, where, overrideAccess: true })).totalDocs;
  // `_status` on the main table is the latest *published* state; archived is orthogonal.
  const [total, published, archived] = await Promise.all([
    count(),
    count({ and: [{ _status: { equals: 'published' } }, { archived: { not_equals: true } }] }),
    count({ archived: { equals: true } }),
  ]);
  return { total, published, archived, draft: Math.max(0, total - published - archived) };
}

export async function getOverview(payload: Payload): Promise<Overview> {
  const countsEntries = await Promise.all(
    EDITORIAL.map(async (c) => [c, await stateCounts(payload, c)] as const),
  );
  const routesEntries = await Promise.all(
    routing.locales.map(
      async (locale) => [locale, await fetchRouteAvailability({ payload, locale })] as const,
    ),
  );
  const recentDocs = await payload.find({
    collection: 'audit-log',
    sort: '-createdAt',
    limit: 10,
    depth: 0,
    overrideAccess: true,
  });
  const [images, imagesArchived, imagesMissingAltAr, documents, documentsArchived] = await Promise.all([
    payload.count({ collection: 'media', overrideAccess: true }).then((r) => r.totalDocs),
    payload
      .count({ collection: 'media', where: { archived: { equals: true } }, overrideAccess: true })
      .then((r) => r.totalDocs),
    payload
      .count({
        collection: 'media',
        locale: 'ar',
        where: {
          and: [
            { decorative: { not_equals: true } },
            { or: [{ alt: { exists: false } }, { alt: { equals: '' } }] },
          ],
        },
        overrideAccess: true,
      })
      .then((r) => r.totalDocs),
    payload.count({ collection: 'documents', overrideAccess: true }).then((r) => r.totalDocs),
    payload
      .count({ collection: 'documents', where: { archived: { equals: true } }, overrideAccess: true })
      .then((r) => r.totalDocs),
  ]);

  let database: 'ok' | 'error' = 'ok';
  let migrations = 0;
  try {
    const res = (await payload.db.drizzle.execute(
      'select count(*)::int as n from payload_migrations',
    )) as unknown as {
      rows: { n: number }[];
    };
    migrations = res.rows[0]?.n ?? 0;
  } catch {
    database = 'error';
  }

  const gate = copyReview.ar;
  return {
    counts: Object.fromEntries(countsEntries) as Overview['counts'],
    routes: Object.fromEntries(routesEntries) as Overview['routes'],
    arabicGate: { status: gate?.status ?? 'approved', reviewer: gate?.reviewer ?? null },
    recent: recentDocs.docs.map((d) => ({
      id: String(d.id),
      when: d.createdAt,
      collection: d.collection,
      documentId: d.documentId,
      action: d.action,
      user: d.userEmail,
      locale: d.locale ?? null,
    })),
    media: { images, imagesArchived, imagesMissingAltAr, documents, documentsArchived },
    system: { database, migrations, siteEnv: process.env.SITE_ENV ?? 'development' },
  };
}
