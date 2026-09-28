import { describe, expect, it } from 'vitest';
import { parseEnv } from '@/lib/env';

describe('parseEnv', () => {
  it('defaults to a local development configuration', () => {
    const env = parseEnv({});
    expect(env).toEqual({
      siteUrl: 'http://localhost:3000',
      siteEnv: 'development',
      isProduction: false,
      designPreview: true,
    });
  });

  it('accepts the production domain', () => {
    const env = parseEnv({ SITE_URL: 'https://yazanalsamman.com', SITE_ENV: 'production' });
    expect(env.siteUrl).toBe('https://yazanalsamman.com');
    expect(env.isProduction).toBe(true);
    expect(env.designPreview).toBe(false);
  });

  it('requires SITE_URL in production', () => {
    expect(() => parseEnv({ SITE_ENV: 'production' })).toThrow(/SITE_URL/);
  });

  it('requires https in production', () => {
    expect(() => parseEnv({ SITE_URL: 'http://yazanalsamman.com', SITE_ENV: 'production' })).toThrow(/https/);
  });

  it('rejects a trailing slash (canonical URLs must not double-slash)', () => {
    expect(() => parseEnv({ SITE_URL: 'https://yazanalsamman.com/' })).toThrow(/slash/);
  });

  it('rejects enabling the design preview in production', () => {
    expect(() =>
      parseEnv({ SITE_URL: 'https://yazanalsamman.com', SITE_ENV: 'production', DESIGN_PREVIEW: 'true' }),
    ).toThrow(/DESIGN_PREVIEW/);
  });

  it('rejects unknown environments', () => {
    expect(() => parseEnv({ SITE_ENV: 'staging' })).toThrow(/SITE_ENV/);
  });
});
