import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Next.js 16 "proxy" (formerly middleware): resolves the locale from the URL prefix only.
export default createMiddleware(routing);

export const config = {
  // Skip Next internals, the CMS (admin UI + REST API), metadata files and anything with a file extension.
  matcher: ['/((?!api|admin|_next|_vercel|robots.txt|sitemap.xml|icon.svg|.*\\..*).*)'],
};
