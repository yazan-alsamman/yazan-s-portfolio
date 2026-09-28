import { describe, expect, it } from 'vitest';
import { dataSourceScope } from '@/content/cache-scope';

const production = {
  DATABASE_URL: 'postgresql://user:secret@127.0.0.1:5439/yazan_portfolio',
  SITE_URL: 'https://yazanalsamman.com',
  SITE_ENV: 'production',
};

describe('data-cache scope (R-60)', () => {
  it('separates the e2e database from the content database', () => {
    const e2e = {
      ...production,
      DATABASE_URL: production.DATABASE_URL.replace(/yazan_portfolio$/, 'yazan_portfolio_e2e'),
    };
    expect(dataSourceScope(e2e)).not.toBe(dataSourceScope(production));
  });

  it('separates origins, environments and database hosts', () => {
    const scope = dataSourceScope(production);
    expect(dataSourceScope({ ...production, SITE_URL: 'http://localhost:3217' })).not.toBe(scope);
    expect(dataSourceScope({ ...production, SITE_ENV: 'preview' })).not.toBe(scope);
    expect(
      dataSourceScope({
        ...production,
        DATABASE_URL: 'postgresql://user:secret@postgres:5432/yazan_portfolio',
      }),
    ).not.toBe(scope);
  });

  it('is stable and ignores credentials (a password rotation keeps the cache)', () => {
    const rotated = {
      ...production,
      DATABASE_URL: 'postgresql://user:rotated@127.0.0.1:5439/yazan_portfolio',
    };
    expect(dataSourceScope(rotated)).toBe(dataSourceScope(production));
    expect(dataSourceScope(production)).toMatch(/^[0-9a-f]{16}$/);
  });

  it('never embeds the connection string', () => {
    expect(dataSourceScope(production)).not.toContain('secret');
  });
});
