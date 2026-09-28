import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

/**
 * SEO_MASTER §18. Production: allow public content, disallow private/internal routes, advertise
 * the sitemap. Any non-production deployment disallows everything (never index previews) —
 * this is environment-gated, never a production shortcut (SEO_MASTER §4).
 */
export default function robots(): MetadataRoute.Robots {
  if (!env.isProduction) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /admin and /api are reserved for the CMS (Phase 2/5); design-system is an internal preview.
        disallow: ['/admin', '/api', '/design-system', '/ar/design-system'],
      },
    ],
    sitemap: `${env.siteUrl}/sitemap.xml`,
    host: env.siteUrl,
  };
}
