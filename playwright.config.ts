import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3217);
const baseURL = `http://localhost:${PORT}`;
const E2E_DIST_DIR = '.next/e2e';

/**
 * The suite runs against an ISOLATED database (`<database>_e2e`) and media directory — never the
 * development data, which holds the real portfolio content. `tests/e2e/prepare-e2e.mjs` resets
 * that database (migrations + confirmed identity + admin), builds and starts the server.
 */
function e2eDatabaseUrl(): string {
  const env = readFileSync('.env', 'utf8');
  const url = new URL(/^DATABASE_URL=(.*)$/m.exec(env)?.[1]?.trim() ?? '');
  const name = url.pathname.replace(/^\//, '');
  url.pathname = `/${name.endsWith('_e2e') ? name : `${name}_e2e`}`;
  return url.toString();
}

/**
 * E2E runs against a production build made by the web-server step below. Uses the locally installed
 * Chrome channel so no browser download is required.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  // CI: one retry so an intermittent failure is reported as "flaky" with its name and trace (R-28).
  // Local: zero retries so every failure stays visible.
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL,
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  projects: [
    // Read-only suites (public shell) run in parallel…
    {
      name: 'desktop',
      testIgnore: /cms\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1440, height: 900 } },
    },
    { name: 'mobile', testIgnore: /cms\.spec\.ts/, use: { ...devices['Pixel 7'], channel: 'chrome' } },
    // …the CMS suite mutates shared CMS data (temporary profile edit, fixtures), so it runs only
    // after the read-only suites have finished — otherwise they could observe its transient state.
    // The CMS files also share ONE admin account and ONE database, so they run one file at a
    // time: parallel logins/logouts of the same user race on Payload's per-user session list
    // (lost update → a revoked session → 403), found in Phase 6 when a fourth CMS file was added.
    {
      name: 'cms',
      testMatch: /cms\.spec\.ts/,
      dependencies: ['desktop', 'mobile'],
      workers: 1,
      use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: `node tests/e2e/prepare-e2e.mjs ${PORT}`,
    // The server's identity (SITE_URL: canonicals, Payload serverURL and the CSRF allow-list)
    // must be the URL it is served on — as in production. With the developer's SITE_URL a real
    // browser's Origin would not match and the admin UI could not save (CSRF working as intended).
    env: {
      SITE_URL: baseURL,
      DATABASE_URL: e2eDatabaseUrl(),
      MEDIA_DIR: path.join(tmpdir(), 'yazan-portfolio-e2e-media'),
      // R-60: the e2e build (empty database) has its own output and data cache, never `.next`.
      NEXT_DIST_DIR: E2E_DIST_DIR,
    },
    url: baseURL,
    // Never silently test another server (it could be serving the real content): reuse only on request.
    reuseExistingServer: process.env.E2E_REUSE_SERVER === '1',
    timeout: 600_000, // reset + production build + start
  },
});
