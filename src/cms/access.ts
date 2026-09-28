import type { Access, FieldAccess, Where } from 'payload';

/**
 * Access control (ADR-010 / T8). Single-admin installation: every write requires an
 * authenticated user with role `admin`. Anonymous reads (REST API or Local API with
 * `overrideAccess: false`) only ever see published, non-archived documents.
 */

type WithRole = { role?: string | null } | null | undefined;

export const isAdmin = (user: unknown): boolean => (user as WithRole)?.role === 'admin';

export const adminOnly: Access = ({ req }) => isAdmin(req.user);

export const adminOnlyField: FieldAccess = ({ req }) => isAdmin(req.user);

/** Public query restriction: published and not archived. Admins see everything (incl. drafts). */
export const publishedOrAdmin: Access = ({ req }) => {
  if (isAdmin(req.user)) return true;
  const where: Where = {
    and: [{ _status: { equals: 'published' } }, { archived: { not_equals: true } }],
  };
  return where;
};

/** For collections without drafts (media, documents): anonymous users see non-archived files only. */
export const notArchivedOrAdmin: Access = ({ req }) => {
  if (isAdmin(req.user)) return true;
  return { archived: { not_equals: true } };
};
