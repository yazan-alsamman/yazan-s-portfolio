/**
 * `payload run src/cms/scripts/e2e-reset.ts` (called by `tests/e2e/prepare-e2e.mjs`) — resets the
 * ISOLATED end-to-end database (`<database>_e2e`) before every Playwright run: empty schema →
 * committed migrations → owner-confirmed identity + the admin from the local environment.
 *
 * The e2e suite therefore never reads or writes the development database, which holds the real
 * portfolio content since the legacy-content migration. Refuses to touch any other database.
 */
import { getPayload } from 'payload';
import config from '@payload-config';
import { migrations } from '../../migrations';
import { confirmedIdentity } from '../seed-data';

const database = new URL(process.env.DATABASE_URL ?? '').pathname.replace(/^\//, '');
if (!database.endsWith('_e2e')) throw new Error(`Refusing: "${database}" is not an _e2e database.`);

const payload = await getPayload({ config });
await payload.db.drizzle.execute('drop schema if exists public cascade; create schema public;');
// Runtime shape is Payload's Migration[]; the generated file's arg types differ nominally.
await payload.db.migrate({
  migrations: migrations as unknown as NonNullable<Parameters<typeof payload.db.migrate>[0]>['migrations'],
});

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

const email = process.env.CMS_ADMIN_EMAIL;
const password = process.env.CMS_ADMIN_PASSWORD;
if (!email || !password) throw new Error('CMS_ADMIN_EMAIL and CMS_ADMIN_PASSWORD are required for e2e.');
await payload.create({ collection: 'users', data: { email, password, role: 'admin' }, overrideAccess: true });

payload.logger.info(`E2E database "${database}" reset: migrations applied, identity and admin seeded.`);
process.exit(0);
