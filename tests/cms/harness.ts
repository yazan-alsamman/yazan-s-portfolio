import { getPayload, type Payload } from 'payload';
import sharp from 'sharp';

/**
 * Shared harness: one Payload instance per test file, on a freshly migrated test database.
 * All documents created by tests are neutral, clearly labelled development fixtures
 * ("CMS Trial Project", "Development Fixture", …) — never owner content.
 */
let instance: Payload | undefined;

export async function cms(): Promise<Payload> {
  if (instance) return instance;
  const { default: config } = await import('@payload-config');
  const { migrations } = await import('@/migrations');
  if (!new URL(process.env.DATABASE_URL ?? '').pathname.endsWith('_test'))
    throw new Error('Refusing: not a _test database');
  instance = await getPayload({ config });
  // Rebuild the (isolated) test database from the committed migrations (T12: clean migrate on an empty DB).
  await instance.db.drizzle.execute('drop schema if exists public cascade; create schema public;');
  // Runtime shape is Payload's Migration[]; the generated file's arg types differ nominally.
  await instance.db.migrate({
    migrations: migrations as unknown as NonNullable<Parameters<typeof instance.db.migrate>[0]>['migrations'],
  });
  return instance;
}

export const EN_AR = ['en', 'ar'] as const;

/** Creates a published, EN-approved skill fixture. */
export async function publishedSkill(payload: Payload, name: string, extra: Record<string, unknown> = {}) {
  return payload.create({
    collection: 'skills',
    data: {
      name,
      category: 'tools' as const,
      translationStatus: 'approved' as const,
      _status: 'published' as const,
      ...extra,
    },
    overrideAccess: true,
  });
}

export async function pngFixture(width = 320, height = 200): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: { r: 13, g: 17, b: 23 } } })
    .png()
    .toBuffer();
}

/** Structurally valid one-page PDF (correct xref offsets) — Payload validates PDF structure. */
export function pdfFixture(): Buffer {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R >>',
    '<< /Length 44 >>\nstream\nBT /F1 12 Tf 20 100 Td (Fixture) Tj ET\nendstream',
  ];
  let body = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(body));
    body += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) body += `${String(off).padStart(10, '0')} 00000 n \n`;
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(body, 'latin1');
}

/** Asserts a Payload ValidationError whose field-level message (what the admin shows) matches. */
export async function expectFieldError(promise: Promise<unknown>, pattern: RegExp): Promise<void> {
  try {
    await promise;
  } catch (error) {
    const detail = ((error as { data?: { errors?: { message: string }[] } }).data?.errors ?? []).map(
      (e) => e.message,
    );
    const all = [(error as Error).message, ...detail].join(' | ');
    if (!pattern.test(all)) throw new Error(`Validation message did not match ${pattern}: ${all}`);
    return;
  }
  throw new Error('Expected a validation error, but the operation succeeded');
}

let seq = 0;
export const uniqueSlug = (base = 'cms-trial-project') =>
  `${base}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

/** Minimal valid EN project fixture (labelled). */
export function projectData(slug: string, extra: Record<string, unknown> = {}) {
  return {
    title: 'CMS Trial Project',
    slug,
    summary: 'Development Fixture used only by the Phase 2 CMS trial tests.',
    seo: {
      title: 'CMS Trial Project — Development Fixture',
      description: 'Development fixture used only by automated CMS tests; never production content.',
    },
    translationStatus: 'approved' as const,
    ...extra,
  };
}
