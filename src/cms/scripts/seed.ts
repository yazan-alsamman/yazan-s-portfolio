/**
 * `pnpm cms:seed` — idempotent seed of owner-confirmed identity + (optionally) the first admin.
 *
 * - Profile: name + title in EN/AR from src/cms/seed-data.ts, published, both locales approved
 *   (these exact values are owner-supplied, not translations).
 * - Admin: created ONLY when CMS_ADMIN_EMAIL and CMS_ADMIN_PASSWORD are set in the environment
 *   and no user exists yet. There is no default account and no default password (ADR-010).
 * - Never writes portfolio content (projects, experience, …): that comes from the owner.
 */
import { getPayload } from 'payload';
import config from '@payload-config';
import { confirmedIdentity } from '../seed-data';

const payload = await getPayload({ config });

for (const locale of ['en', 'ar'] as const) {
  await payload.updateGlobal({
    slug: 'profile',
    locale,
    data: {
      name: confirmedIdentity.name[locale],
      title: confirmedIdentity.title[locale],
      translationStatus: 'approved',
      sourceNote: confirmedIdentity.sourceNote,
      _status: 'published',
    },
    overrideAccess: true,
  });
}
payload.logger.info('Seeded profile identity (EN + AR, published).');

const email = process.env.CMS_ADMIN_EMAIL;
const password = process.env.CMS_ADMIN_PASSWORD;
const { totalDocs } = await payload.count({ collection: 'users', overrideAccess: true });
if (totalDocs > 0) {
  payload.logger.info('Admin user already exists — not creating another.');
} else if (email && password) {
  if (password.length < 14) throw new Error('CMS_ADMIN_PASSWORD must be at least 14 characters.');
  await payload.create({
    collection: 'users',
    data: { email, password, role: 'admin' },
    overrideAccess: true,
  });
  payload.logger.info(`Created first admin (${email.replace(/(.{2}).*@/, '$1***@')}).`);
} else {
  payload.logger.warn(
    'No admin created: set CMS_ADMIN_EMAIL and CMS_ADMIN_PASSWORD to seed the first admin.',
  );
}

process.exit(0);
