import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { buildConfig } from 'payload';
import sharp from 'sharp';
import { parseCmsEnv } from './cms/env';
import { parseEnv } from './lib/env';
import { Users } from './cms/collections/Users';
import { AuditLog } from './cms/collections/AuditLog';
import { Documents, Media } from './cms/collections/Media';
import { Certificates, Education, Experience, Projects, Redirects, Skills } from './cms/collections/content';
import { CV, Profile, SiteSettings } from './cms/globals';
import { migrations } from './migrations';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const cmsEnv = parseCmsEnv(process.env);
const siteEnv = parseEnv(process.env);

/**
 * Payload CMS 3 — Phase 2 trial configuration (ADR-003).
 * Embedded in the Next.js app: admin at /admin, REST at /api. The public site never calls
 * Payload directly — only through src/content (repository layer).
 */
export default buildConfig({
  serverURL: siteEnv.siteUrl,
  secret: cmsEnv.PAYLOAD_SECRET,
  // CSRF/CORS: only our own origin may send credentialed requests (ADR-010).
  csrf: [siteEnv.siteUrl],
  cors: [siteEnv.siteUrl],
  db: postgresAdapter({
    pool: { connectionString: cmsEnv.DATABASE_URL },
    migrationDir: path.resolve(dirname, 'migrations'),
    push: false, // schema changes only through committed migrations (ADR-004, T12)
    // T14: the standalone production server has no Payload CLI; pending committed migrations
    // are applied on startup (NODE_ENV=production) from this compiled list.
    prodMigrations: migrations,
  }),
  editor: lexicalEditor(),
  sharp,
  localization: {
    locales: [
      { code: 'en', label: 'English' },
      { code: 'ar', label: 'العربية', rtl: true },
    ],
    defaultLocale: 'en',
    fallback: false, // ADR-006: never fill Arabic with English
  },
  admin: {
    user: Users.slug,
    // Phase 9: Payload's default avatar is loaded from gravatar.com with a hash of the admin's
    // email — a third-party request (privacy) that the CSP (img-src 'self') also blocks.
    avatar: 'default',
    meta: {
      titleSuffix: ' — Portfolio CMS',
      robots: 'noindex, nofollow',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/icon.svg' }],
    },
    importMap: { baseDir: path.resolve(dirname) },
    // Phase 5 dashboard UX: overview above the collection cards, neutral wordmark.
    components: {
      beforeDashboard: ['/cms/admin/Overview'],
      graphics: { Logo: '/cms/admin/Brand#Logo', Icon: '/cms/admin/Brand#Icon' },
    },
  },
  collections: [
    Projects,
    Experience,
    Education,
    Certificates,
    Skills,
    Media,
    Documents,
    Redirects,
    Users,
    AuditLog,
  ],
  globals: [Profile, SiteSettings, CV],
  graphQL: { disable: true }, // unused; smaller attack surface (REST + Local API only)
  upload: { limits: { fileSize: 20 * 1024 * 1024 } }, // hard ceiling; per-collection limits in hooks
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  telemetry: false,
});
