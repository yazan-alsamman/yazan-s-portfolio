import { createHash } from 'node:crypto';

/**
 * Identity of the data a cached CMS read came from (R-60).
 *
 * `unstable_cache` entries persist in `<distDir>/cache/fetch-cache` and are keyed only by the key
 * parts and arguments, not by the database they were read from. In Phase 8 a production build
 * reused entries written by the e2e build (empty `_e2e` database) and prerendered six content
 * routes as 404. Every repository key therefore carries this scope: the database location (host,
 * port, name — never credentials), the public origin (absolute URLs in cached data) and the
 * deployment environment. Entries written against any other data source can never be read.
 */
export function dataSourceScope(source: Record<string, string | undefined> = process.env): string {
  let database = 'unset';
  try {
    const url = new URL(source.DATABASE_URL ?? '');
    database = `${url.hostname}:${url.port}${url.pathname}`;
  } catch {
    // An invalid DATABASE_URL fails in the CMS env validation; the scope stays distinct from any valid one.
  }
  const identity = [database, source.SITE_URL ?? '', source.SITE_ENV ?? 'development'].join('|');
  return createHash('sha256').update(identity).digest('hex').slice(0, 16);
}
