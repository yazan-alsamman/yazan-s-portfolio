import type { NextConfig } from 'next';
import { withPayload } from '@payloadcms/next/withPayload';
import createNextIntlPlugin from 'next-intl/plugin';
// Validate environment at build/start time — fails fast on invalid SITE_URL / SITE_ENV (ADR-016).
import { env } from './src/lib/env';
import { securityHeaders } from './src/lib/security-headers';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// R-60: the e2e suite builds against its own empty database into `.next/e2e`
// (playwright.config.ts), so neither its pages nor its data cache (`<distDir>/cache`) can ever
// be picked up by a production build in `.next`. Only `.next` or a folder inside it is allowed:
// both are covered by every ignore file (git, Docker, ESLint, Prettier, Tailwind).
const distDir = process.env.NEXT_DIST_DIR ?? '.next';
if (!/^\.next(\/[a-z0-9-]+)?$/.test(distDir)) {
  throw new Error(`NEXT_DIST_DIR must be ".next" or ".next/<name>", got "${distDir}"`);
}

const nextConfig: NextConfig = {
  distDir,
  // ADR-012: VPS deployment runs the standalone Node server in a container.
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    // `/en/...` duplicates the unprefixed English URL. next-intl redirects it with 307; a
    // permanent (308) redirect consolidates signals on the canonical URL (SEO_MASTER §33).
    return [
      { source: '/en', destination: '/', permanent: true },
      { source: '/en/:path*', destination: '/:path*', permanent: true },
    ];
  },
  async headers() {
    const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];
    const headers = [
      // Phase 9: security headers on every response (public site, CMS admin, API, media files).
      { source: '/:path*', headers: securityHeaders({ siteUrl: env.siteUrl }) },
      // Internal preview route is never indexable, in any environment.
      { source: '/:locale(ar)?/design-system', headers: noindex },
      // CMS admin and API (incl. uploaded files served from /api/*/file/*) are never indexable.
      { source: '/admin/:path*', headers: noindex },
      { source: '/admin', headers: noindex },
      { source: '/api/:path*', headers: noindex },
    ];
    if (!env.isProduction) {
      // Non-production deployments (preview/staging) must never be indexed.
      headers.push({ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] });
    }
    return headers;
  },
};

// Payload (admin + REST) and next-intl (public locale routing) compose; Payload never touches public routes.
export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false });
