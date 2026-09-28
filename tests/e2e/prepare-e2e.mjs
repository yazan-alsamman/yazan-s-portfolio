/**
 * Playwright web-server preparation (see playwright.config.ts): the e2e suite runs against an
 * ISOLATED database and media directory, never the development data (which holds the real
 * portfolio content):
 *   1. reset `<database>_e2e` (empty schema → migrations → confirmed identity + admin);
 *   2. empty the e2e media directory;
 *   3. production build against that database (static pages are generated from it);
 *   4. start the production server.
 * The environment (DATABASE_URL, MEDIA_DIR, SITE_URL) is provided by playwright.config.ts.
 */
import { execSync, spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';

const port = process.argv[2] ?? '3217';
const db = new URL(process.env.DATABASE_URL ?? '').pathname;
if (!db.endsWith('_e2e')) throw new Error(`Refusing to prepare e2e against ${db}`);
const media = process.env.MEDIA_DIR;
if (!media || !/e2e/.test(media)) throw new Error('MEDIA_DIR must point at the e2e media directory');
// R-60: the e2e build must never write into the production build directory (`.next`).
const distDir = process.env.NEXT_DIST_DIR;
if (!distDir || !/e2e/.test(distDir)) throw new Error('NEXT_DIST_DIR must point at the e2e build directory');

const run = (command) => execSync(command, { stdio: 'inherit', env: process.env });
run('pnpm payload run src/cms/scripts/e2e-reset.ts');
rmSync(media, { recursive: true, force: true });
mkdirSync(media, { recursive: true });
rmSync(`${distDir}/cache/fetch-cache`, { recursive: true, force: true }); // R-45: the database was just reset
run('pnpm build');
spawn('pnpm', ['start', '-p', port], { stdio: 'inherit', env: process.env, shell: true });
