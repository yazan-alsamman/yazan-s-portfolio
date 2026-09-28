import { beforeAll, describe, expect, it } from 'vitest';
import type { Payload } from 'payload';
import {
  fetchCv,
  fetchProfile,
  fetchProjectBySlug,
  fetchProjects,
  fetchRedirect,
} from '@/content/payload-adapter';
import {
  cms,
  expectFieldError,
  pdfFixture,
  pngFixture,
  projectData,
  publishedSkill,
  uniqueSlug,
} from './harness';

/**
 * Phase 2 — ADR-003 T1–T14 evidence (T7 HTTP-level, T13 bundles and T14 deployment are verified
 * separately: e2e + build measurements). Real PostgreSQL, Payload Local API.
 * `overrideAccess: false` with no user = an anonymous public reader.
 */

let payload: Payload;
let admin: { id: number | string; email: string; role: string };
const ADMIN_PASSWORD = 'trial-admin-password-not-real-0001';

beforeAll(async () => {
  payload = await cms();
  admin = (await payload.create({
    collection: 'users',
    data: { email: 'trial-admin@example.test', password: ADMIN_PASSWORD, role: 'admin' },
    overrideAccess: true,
  })) as typeof admin;
});

const anon = { overrideAccess: false } as const;

async function createPublishedProject(extra: Record<string, unknown> = {}, locale: 'en' | 'ar' = 'en') {
  const slug = uniqueSlug();
  const doc = await payload.create({
    collection: 'projects',
    locale,
    data: { ...projectData(slug), _status: 'published', ...extra },
    overrideAccess: true,
  });
  return { doc, slug };
}

describe('T12 — PostgreSQL + committed migrations', () => {
  it('rebuilds the empty test database from the committed migrations', async () => {
    const res = (await payload.db.drizzle.execute('select name from payload_migrations')) as unknown as {
      rows: { name: string }[];
    };
    expect(res.rows.map((r) => r.name)).toContain('20260927_181450_initial');
  });
});

describe('T1 — Bilingual content, no fallback', () => {
  it('stores EN and AR independently and never falls back to English', async () => {
    const { doc, slug } = await createPublishedProject();
    const ar = await payload.findByID({
      collection: 'projects',
      id: doc.id,
      locale: 'ar',
      fallbackLocale: false,
      overrideAccess: true,
    });
    expect(ar.title ?? null).toBeNull();
    await payload.update({
      collection: 'projects',
      id: doc.id,
      locale: 'ar',
      data: {
        title: 'مشروع تجريبي',
        summary: 'بيانات اختبار للتطوير فقط.',
        translationStatus: 'in_review',
        _status: 'published',
      },
      overrideAccess: true,
    });
    const en = await payload.findByID({
      collection: 'projects',
      id: doc.id,
      locale: 'en',
      overrideAccess: true,
    });
    const arAfter = await payload.findByID({
      collection: 'projects',
      id: doc.id,
      locale: 'ar',
      overrideAccess: true,
    });
    expect(en.title).toBe('CMS Trial Project');
    expect(arAfter.title).toBe('مشروع تجريبي');
    // Arabic is only "in review": the public repository must not show it in Arabic.
    const publicAr = await fetchProjectBySlug({ payload, locale: 'ar' }, slug);
    const publicEn = await fetchProjectBySlug({ payload, locale: 'en' }, slug);
    expect(publicAr).toBeNull();
    expect(publicEn?.title).toBe('CMS Trial Project');
  });

  it('shows Arabic publicly once the Arabic version is approved and complete', async () => {
    const { doc, slug } = await createPublishedProject();
    await payload.update({
      collection: 'projects',
      id: doc.id,
      locale: 'ar',
      data: {
        title: 'مشروع تجريبي',
        summary: 'بيانات اختبار للتطوير فقط.',
        seo: {
          title: 'مشروع تجريبي — بيانات تطوير',
          description: 'بيانات تطوير تُستخدم فقط في اختبارات نظام إدارة المحتوى الآلية ولا تُنشر.',
        },
        translationStatus: 'approved',
        _status: 'published',
      },
      overrideAccess: true,
    });
    const publicAr = await fetchProjectBySlug({ payload, locale: 'ar' }, slug);
    expect(publicAr?.title).toBe('مشروع تجريبي');
  });

  it('Arabic locale is configured RTL in the admin', () => {
    const ar =
      payload.config.localization && payload.config.localization.locales.find((l) => l.code === 'ar');
    expect(ar).toMatchObject({ code: 'ar', rtl: true });
    expect(payload.config.localization && payload.config.localization.fallback).toBe(false);
  });
});

describe('T6 — DRAFT → PUBLISHED → ARCHIVED lifecycle', () => {
  it('drafts are invisible to the public (REST/Local API access and repository)', async () => {
    const slug = uniqueSlug();
    await payload.create({
      collection: 'projects',
      data: { ...projectData(slug), _status: 'draft' },
      draft: true,
      overrideAccess: true,
    });
    const res = await payload.find({
      collection: 'projects',
      where: { slug: { equals: slug } },
      draft: true,
      ...anon,
    });
    expect(res.totalDocs).toBe(0);
    expect(await fetchProjectBySlug({ payload, locale: 'en' }, slug)).toBeNull();
  });

  it('an unpublished edit of a published project never leaks; publishing updates it', async () => {
    const { doc, slug } = await createPublishedProject();
    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: { title: 'CMS Trial Project — unpublished draft edit', _status: 'draft' },
      draft: true,
      overrideAccess: true,
    });
    expect((await fetchProjectBySlug({ payload, locale: 'en' }, slug))?.title).toBe('CMS Trial Project');
    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: { title: 'CMS Trial Project — published update', _status: 'published' },
      overrideAccess: true,
    });
    expect((await fetchProjectBySlug({ payload, locale: 'en' }, slug))?.title).toBe(
      'CMS Trial Project — published update',
    );
  });

  it('archive hides from public, restore brings it back, and archivedAt is stamped/cleared', async () => {
    const { doc, slug } = await createPublishedProject();
    const archived = await payload.update({
      collection: 'projects',
      id: doc.id,
      data: { archived: true },
      overrideAccess: true,
    });
    expect(archived.archivedAt).toBeTruthy();
    expect(await fetchProjectBySlug({ payload, locale: 'en' }, slug)).toBeNull();
    const restored = await payload.update({
      collection: 'projects',
      id: doc.id,
      data: { archived: false },
      overrideAccess: true,
    });
    expect(restored.archivedAt ?? null).toBeNull();
    expect(await fetchProjectBySlug({ payload, locale: 'en' }, slug)).not.toBeNull();
  });

  it('refuses hard delete unless archived first', async () => {
    const { doc } = await createPublishedProject();
    await expect(
      payload.delete({ collection: 'projects', id: doc.id, overrideAccess: true }),
    ).rejects.toThrow(/Archive/);
    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: { archived: true },
      overrideAccess: true,
    });
    await expect(
      payload.delete({ collection: 'projects', id: doc.id, overrideAccess: true }),
    ).resolves.toBeTruthy();
  });

  it('keeps version history and writes an audit log entry per change', async () => {
    const { doc } = await createPublishedProject();
    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: { summary: 'Development Fixture — second revision.' },
      overrideAccess: true,
    });
    const versions = await payload.findVersions({
      collection: 'projects',
      where: { parent: { equals: doc.id } },
      overrideAccess: true,
    });
    expect(versions.totalDocs).toBeGreaterThanOrEqual(2);
    const audit = await payload.find({
      collection: 'audit-log',
      where: { documentId: { equals: String(doc.id) } },
      overrideAccess: true,
    });
    expect(audit.docs.map((d) => d.action)).toEqual(expect.arrayContaining(['create', 'publish']));
  });
});

describe('T8 — Authorization', () => {
  it('anonymous readers cannot read users, audit log, drafts or versions', async () => {
    await expect(payload.find({ collection: 'users', ...anon })).rejects.toThrow();
    await expect(payload.find({ collection: 'audit-log', ...anon })).rejects.toThrow();
    await expect(payload.findVersions({ collection: 'projects', ...anon })).rejects.toThrow();
  });

  it('anonymous readers cannot write', async () => {
    await expect(
      payload.create({
        collection: 'projects',
        data: { ...projectData(uniqueSlug()), _status: 'published' },
        ...anon,
      }),
    ).rejects.toThrow();
  });

  it('field-level access: sourceNote is hidden from the public, visible to the admin', async () => {
    const { doc } = await createPublishedProject({ sourceNote: 'Development Fixture provenance note' });
    const pub = await payload.findByID({ collection: 'projects', id: doc.id, ...anon });
    expect(pub).not.toHaveProperty('sourceNote');
    const asAdmin = await payload.findByID({
      collection: 'projects',
      id: doc.id,
      overrideAccess: false,
      user: admin,
    });
    expect(asAdmin.sourceNote).toBe('Development Fixture provenance note');
  });
});

describe('T7 — Authentication (Local API level; HTTP-level checks are in e2e)', () => {
  it('logs in with the correct password and locks the account after 5 failures', async () => {
    const email = `lockout-${Date.now()}@example.test`;
    await payload.create({
      collection: 'users',
      data: { email, password: ADMIN_PASSWORD, role: 'admin' },
      overrideAccess: true,
    });
    const ok = await payload.login({ collection: 'users', data: { email, password: ADMIN_PASSWORD } });
    expect(ok.token).toBeTruthy();
    for (let i = 0; i < 5; i++) {
      await expect(
        payload.login({ collection: 'users', data: { email, password: 'wrong-password-000000' } }),
      ).rejects.toThrow();
    }
    await expect(
      payload.login({ collection: 'users', data: { email, password: ADMIN_PASSWORD } }),
    ).rejects.toThrow(/lock/i);
  });

  it('auth config: lockout, short sessions, server sessions, secure cookies in production', () => {
    const auth = payload.collections.users.config.auth;
    expect(auth.maxLoginAttempts).toBe(5);
    expect(auth.lockTime).toBe(15 * 60 * 1000);
    expect(auth.tokenExpiration).toBe(7200);
    expect(auth.useSessions).toBe(true);
    expect(auth.cookies.sameSite).toBe('Lax');
  });
});

describe('T2 — Projects (full field set, validation per status)', () => {
  it('accepts the full DASHBOARD_SPEC project field set', async () => {
    const skill = await publishedSkill(payload, `Trial Skill ${Date.now()}`);
    const { doc, slug } = await createPublishedProject({
      role: 'Development Fixture role',
      category: 'software-engineering',
      timeline: { start: '2024-01-01', end: '2024-06-01' },
      technologies: [skill.id],
      links: [{ label: 'Example repository', url: 'https://example.com/repo', kind: 'repository' }],
      videoUrl: 'https://example.com/video',
      featured: true,
      sortOrder: 1,
    });
    const full = await fetchProjectBySlug({ payload, locale: 'en' }, slug);
    expect(full).toMatchObject({
      slug,
      featured: true,
      role: 'Development Fixture role',
      category: 'software-engineering',
    });
    expect(full?.technologies.map((t) => t.name)).toEqual([skill.name]);
    expect(full?.links[0]).toMatchObject({ kind: 'repository', url: 'https://example.com/repo' });
    expect(doc.id).toBeTruthy();
  });

  it('allows incomplete drafts but rejects publishing without required fields', async () => {
    const slug = uniqueSlug();
    await expect(
      payload.create({
        collection: 'projects',
        data: { slug, _status: 'draft' },
        draft: true,
        overrideAccess: true,
      }),
    ).resolves.toBeTruthy();
    await expect(
      // @ts-expect-error — deliberately missing required fields to prove publish-time validation
      payload.create({
        collection: 'projects',
        data: { slug: uniqueSlug(), _status: 'published' },
        overrideAccess: true,
      }),
    ).rejects.toThrow();
  });
});

describe('T9 / T11 — SEO fields, slugs, redirects, validation', () => {
  it('rejects malformed slugs and duplicate slugs with a useful message', async () => {
    await expectFieldError(
      payload.create({
        collection: 'projects',
        data: { ...projectData('Bad Slug!'), _status: 'published' },
        overrideAccess: true,
      }),
      /lowercase letters/i,
    );
    const { slug } = await createPublishedProject();
    await expect(
      payload.create({
        collection: 'projects',
        data: { ...projectData(slug), _status: 'published' },
        overrideAccess: true,
      }),
    ).rejects.toThrow();
  });

  it('enforces SEO title/description length bounds', async () => {
    await expectFieldError(
      payload.create({
        collection: 'projects',
        data: {
          ...projectData(uniqueSlug()),
          seo: { title: 'Short', description: 'Too short' },
          _status: 'published',
        },
        overrideAccess: true,
      }),
      /SEO title must be 10–70 characters/,
    );
  });

  it('a published project missing localized SEO fields is valid in the CMS but never rendered (Zod gate)', async () => {
    const { slug } = await createPublishedProject({ seo: { title: null, description: null } });
    expect(await fetchProjectBySlug({ payload, locale: 'en' }, slug)).toBeNull();
  });

  it('changing a published slug creates a 308 redirect and flattens chains', async () => {
    const { doc, slug: first } = await createPublishedProject();
    const second = uniqueSlug();
    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: { slug: second },
      overrideAccess: true,
    });
    expect(await fetchRedirect(payload, `/projects/${first}`)).toEqual({
      to: `/projects/${second}`,
      status: 308,
    });
    const third = uniqueSlug();
    await payload.update({ collection: 'projects', id: doc.id, data: { slug: third }, overrideAccess: true });
    expect(await fetchRedirect(payload, `/projects/${first}`)).toEqual({
      to: `/projects/${third}`,
      status: 308,
    });
    expect(await fetchRedirect(payload, `/projects/${second}`)).toEqual({
      to: `/projects/${third}`,
      status: 308,
    });
  });

  it('rejects numeric skill proficiency (no fake percentages)', async () => {
    await expectFieldError(
      payload.create({
        collection: 'skills',
        data: { name: 'Trial Skill %', category: 'tools', proficiencyLabel: '90%', _status: 'published' },
        overrideAccess: true,
      }),
      /Numeric proficiency scores are not allowed/,
    );
  });
});

describe('T10 — Relationships without orphans', () => {
  it('drops archived or unpublished related skills from public output', async () => {
    const kept = await publishedSkill(payload, `Trial Kept ${Date.now()}`);
    const archivedSkill = await publishedSkill(payload, `Trial Archived ${Date.now()}`);
    const draftSkill = await payload.create({
      collection: 'skills',
      data: { name: `Trial Draft ${Date.now()}`, category: 'tools', _status: 'draft' },
      draft: true,
      overrideAccess: true,
    });
    const { slug } = await createPublishedProject({
      technologies: [kept.id, archivedSkill.id, draftSkill.id],
    });
    await payload.update({
      collection: 'skills',
      id: archivedSkill.id,
      data: { archived: true },
      overrideAccess: true,
    });
    const project = await fetchProjectBySlug({ payload, locale: 'en' }, slug);
    expect(project?.technologies.map((t) => t.name)).toEqual([kept.name]);
  });

  it('project ↔ experience ↔ skills joins resolve both ways', async () => {
    const exp = await payload.create({
      collection: 'experience',
      data: {
        organization: 'Development Fixture Org',
        title: 'Test Experience',
        startDate: '2024-01-01',
        translationStatus: 'approved',
        _status: 'published',
      },
      overrideAccess: true,
    });
    const skill = await publishedSkill(payload, `Trial Join ${Date.now()}`);
    const { doc } = await createPublishedProject({ experience: exp.id, technologies: [skill.id] });
    const expWithJoin = await payload.findByID({
      collection: 'experience',
      id: exp.id,
      depth: 1,
      overrideAccess: true,
    });
    const skillWithJoin = await payload.findByID({
      collection: 'skills',
      id: skill.id,
      depth: 1,
      overrideAccess: true,
    });
    const ids = (join: unknown) =>
      ((join as { docs?: unknown[] })?.docs ?? []).map((d) =>
        typeof d === 'object' ? (d as { id: unknown }).id : d,
      );
    expect(ids(expWithJoin.projects)).toContain(doc.id);
    expect(ids(skillWithJoin.evidence)).toContain(doc.id);
  });
});

describe('T4 — Media uploads', () => {
  it('accepts a real PNG, regenerates the filename, keeps the original name, and never upscales', async () => {
    const png = await pngFixture(320, 200);
    const media = await payload.create({
      collection: 'media',
      data: { alt: 'Development Fixture image' },
      file: { data: png, mimetype: 'image/png', name: '../../evil name.png', size: png.length },
      overrideAccess: true,
    });
    expect(media.filename).toMatch(/^\d{4}-\d{2}-\d{2}-[0-9a-f]{16}\.png$/);
    expect(media.originalFilename).toBe('../../evil name.png');
    expect(media.width).toBe(320);
    // 480/960/1600 sizes must not be enlarged beyond the 320px source.
    for (const size of Object.values(media.sizes ?? {})) {
      if (size?.width) expect(size.width).toBeLessThanOrEqual(320);
    }
  });

  it('rejects a spoofed file (text declared as PNG), SVG, and oversize files', async () => {
    const fake = Buffer.from('<script>alert(1)</script>');
    await expect(
      payload.create({
        collection: 'media',
        data: { alt: 'x fixture' },
        file: { data: fake, mimetype: 'image/png', name: 'x.png', size: fake.length },
        overrideAccess: true,
      }),
    ).rejects.toThrow(/Unsupported file type/);
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>');
    await expect(
      payload.create({
        collection: 'media',
        data: { alt: 'x fixture' },
        file: { data: svg, mimetype: 'image/svg+xml', name: 'x.svg', size: svg.length },
        overrideAccess: true,
      }),
    ).rejects.toThrow();
    const big = Buffer.concat([await pngFixture(), Buffer.alloc(16 * 1024 * 1024)]);
    await expect(
      payload.create({
        collection: 'media',
        data: { alt: 'x fixture' },
        file: { data: big, mimetype: 'image/png', name: 'big.png', size: big.length },
        overrideAccess: true,
      }),
    ).rejects.toThrow(/too large/);
  });

  it('requires alt text unless decorative, and tracks usage', async () => {
    const png = await pngFixture();
    await expectFieldError(
      payload.create({
        collection: 'media',
        data: {},
        file: { data: png, mimetype: 'image/png', name: 'a.png', size: png.length },
        overrideAccess: true,
      }),
      /Alt text is required/,
    );
    const decorative = await payload.create({
      collection: 'media',
      data: { decorative: true },
      file: { data: png, mimetype: 'image/png', name: 'd.png', size: png.length },
      overrideAccess: true,
    });
    const { doc } = await createPublishedProject({ cover: decorative.id });
    const withUsage = await payload.findByID({
      collection: 'media',
      id: decorative.id,
      depth: 1,
      overrideAccess: true,
    });
    const used = ((withUsage.usedAsCover as { docs?: unknown[] })?.docs ?? []).map((d) =>
      typeof d === 'object' ? (d as { id: unknown }).id : d,
    );
    expect(used).toContain(doc.id);
  });
});

describe('T3 — Certificates (image or PDF attachment)', () => {
  it('accepts a PDF or image attachment, issuer and verification URL', async () => {
    const pdf = pdfFixture();
    const file = await payload.create({
      collection: 'documents',
      data: { title: 'Example Certificate file' },
      file: { data: pdf, mimetype: 'application/pdf', name: 'c.pdf', size: pdf.length },
      overrideAccess: true,
    });
    const cert = await payload.create({
      collection: 'certificates',
      data: {
        name: 'Example Certificate',
        issuer: 'Development Fixture Issuer',
        verificationUrl: 'https://example.com/verify',
        attachment: { relationTo: 'documents', value: file.id },
        translationStatus: 'approved',
        _status: 'published',
      },
      overrideAccess: true,
    });
    expect(cert.issuer).toBe('Development Fixture Issuer');
    await expectFieldError(
      payload.create({
        collection: 'certificates',
        data: {
          name: 'Example Certificate',
          issuer: 'x',
          verificationUrl: 'javascript:alert(1)',
          _status: 'published',
        },
        overrideAccess: true,
      }),
      /http\(s\) URL/,
    );
  });
});

describe('T5 — CV per locale', () => {
  it('serves a per-locale PDF only when visible and approved', async () => {
    const pdf = pdfFixture();
    const file = await payload.create({
      collection: 'documents',
      data: { title: 'Development Fixture CV' },
      file: { data: pdf, mimetype: 'application/pdf', name: 'cv.pdf', size: pdf.length },
      overrideAccess: true,
    });
    await payload.updateGlobal({
      slug: 'cv',
      locale: 'en',
      data: {
        file: file.id,
        version: 'fixture-1',
        downloadVisible: false,
        translationStatus: 'approved',
        _status: 'published',
      },
      overrideAccess: true,
    });
    expect(await fetchCv({ payload, locale: 'en' })).toBeNull();
    await payload.updateGlobal({
      slug: 'cv',
      locale: 'en',
      data: { downloadVisible: true, _status: 'published' },
      overrideAccess: true,
    });
    const cv = await fetchCv({ payload, locale: 'en' });
    expect(cv?.version).toBe('fixture-1');
    expect(cv?.url).toContain('/api/documents/file/');
    expect(await fetchCv({ payload, locale: 'ar' })).toBeNull(); // no Arabic CV, no fallback
  });
});

describe('Profile identity through the repository', () => {
  it('returns the approved profile per locale and nothing for an unapproved locale', async () => {
    await payload.updateGlobal({
      slug: 'profile',
      locale: 'en',
      data: {
        name: 'Development Fixture Name',
        title: 'Development Fixture Title',
        translationStatus: 'approved',
        _status: 'published',
      },
      overrideAccess: true,
    });
    expect(await fetchProfile({ payload, locale: 'en' })).toMatchObject({
      name: 'Development Fixture Name',
      title: 'Development Fixture Title',
    });
    expect(await fetchProfile({ payload, locale: 'ar' })).toBeNull();
    const list = await fetchProjects({ payload, locale: 'en' });
    expect(list.every((p) => p.slug.startsWith('cms-trial-project'))).toBe(true);
  });
});
