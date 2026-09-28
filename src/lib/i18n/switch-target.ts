/**
 * Page-aware language switching (R-47, pure part — shared by the server and the client switcher).
 *
 * The switcher links to the SAME page in the other language when that page exists there;
 * otherwise to its nearest existing parent (e.g. `/projects/x` → `/projects`), otherwise to the
 * locale's home page. It never links to a page that would 404 in the target language.
 */

/** Paths that exist in a locale, without the locale prefix: `/`, `/about`, `/projects/<slug>`. */
export type ExistingPaths = readonly string[];

export function resolveSwitchTarget(pathname: string, existing: ExistingPaths): string {
  const set = new Set(existing);
  let path = normalize(pathname);
  for (;;) {
    if (set.has(path)) return path;
    if (path === '/') return '/';
    path = path.slice(0, path.lastIndexOf('/')) || '/';
  }
}

function normalize(pathname: string): string {
  const clean = (pathname.split(/[?#]/)[0] ?? '/').replace(/\/+$/, '');
  return clean === '' ? '/' : clean.startsWith('/') ? clean : `/${clean}`;
}
