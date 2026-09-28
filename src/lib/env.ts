import { z } from 'zod';

/**
 * Server-side environment, validated once at module load (build and runtime).
 * Invalid configuration fails fast instead of silently producing wrong canonicals.
 * ADR-011 / ADR-016: SITE_URL is the single source for absolute URLs.
 */
const schema = z
  .object({
    SITE_URL: z
      .url({ protocol: /^https?$/, message: 'SITE_URL must be an absolute http(s) URL' })
      .refine((v) => !v.endsWith('/'), 'SITE_URL must not end with a slash'),
    SITE_ENV: z.enum(['development', 'preview', 'production']).default('development'),
    DESIGN_PREVIEW: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === 'true')),
  })
  .superRefine((env, ctx) => {
    if (env.SITE_ENV === 'production' && !env.SITE_URL.startsWith('https://')) {
      ctx.addIssue({ code: 'custom', path: ['SITE_URL'], message: 'Production SITE_URL must use https' });
    }
    if (env.SITE_ENV === 'production' && env.DESIGN_PREVIEW === true) {
      ctx.addIssue({
        code: 'custom',
        path: ['DESIGN_PREVIEW'],
        message: 'DESIGN_PREVIEW must be off in production',
      });
    }
  });

export type Env = {
  siteUrl: string;
  siteEnv: 'development' | 'preview' | 'production';
  isProduction: boolean;
  designPreview: boolean;
};

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = schema.safeParse({
    SITE_URL: source.SITE_URL ?? (source.SITE_ENV === 'production' ? undefined : 'http://localhost:3000'),
    SITE_ENV: source.SITE_ENV,
    DESIGN_PREVIEW: source.DESIGN_PREVIEW,
  });
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  const { SITE_URL, SITE_ENV, DESIGN_PREVIEW } = result.data;
  const isProduction = SITE_ENV === 'production';
  return {
    siteUrl: SITE_URL,
    siteEnv: SITE_ENV,
    isProduction,
    designPreview: DESIGN_PREVIEW ?? !isProduction,
  };
}

export const env: Env = parseEnv(process.env);
