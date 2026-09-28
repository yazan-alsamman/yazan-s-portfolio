import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * CMS integration tests (Phase 2 / ADR-003 T1–T14) — real PostgreSQL via the Payload Local API.
 * Runs against the ISOLATED test database `<db>_test` (never the dev DB), rebuilt from the
 * committed migrations on every run. Requires `docker compose up -d`.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@payload-config': fileURLToPath(new URL('./src/payload.config.ts', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['tests/cms/**/*.test.ts'],
    environment: 'node',
    setupFiles: ['tests/cms/setup-env.ts'],
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 120_000,
  },
});
