import { z } from 'zod';

/** CMS environment (ADR-016). Validated when the Payload config loads; secrets are never logged. */
const schema = z.object({
  DATABASE_URL: z
    .string()
    .regex(/^postgres(ql)?:\/\//, 'DATABASE_URL must be a postgres:// connection string'),
  PAYLOAD_SECRET: z.string().min(32, 'PAYLOAD_SECRET must be at least 32 characters'),
  REVALIDATE_SECRET: z.string().min(32, 'REVALIDATE_SECRET must be at least 32 characters'),
  MEDIA_DIR: z.string().default('media'),
});

export type CmsEnv = z.infer<typeof schema>;

export function parseCmsEnv(source: Record<string, string | undefined>): CmsEnv {
  const result = schema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid CMS environment configuration:\n${issues}`);
  }
  return result.data;
}
