import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * Loads the local `.env` and redirects every write to isolated targets:
 *  - DATABASE_URL → `<database>_test` (refuses to run against any non-`_test` database),
 *  - MEDIA_DIR    → a fresh temp directory.
 */
const envFile = path.resolve(process.cwd(), '.env');
for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
  const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (match && process.env[match[1]!] === undefined) process.env[match[1]!] = match[2];
}

const url = new URL(process.env.DATABASE_URL ?? '');
const database = url.pathname.replace(/^\//, '');
url.pathname = `/${database.endsWith('_test') ? database : `${database}_test`}`;
process.env.DATABASE_URL = url.toString();
if (!url.pathname.endsWith('_test')) throw new Error('CMS tests must run against a *_test database.');

process.env.MEDIA_DIR = mkdtempSync(path.join(tmpdir(), 'yazan-cms-media-'));
process.env.SITE_ENV = 'development';
process.env.SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';
