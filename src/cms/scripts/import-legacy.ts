/**
 * `pnpm cms:import-legacy` — writes the real portfolio content recovered from the legacy website
 * (src/cms/legacy/legacy-content.ts) into the CMS. Idempotent and CREATE-ONLY: records are matched
 * by natural key (skill name, education degree, certificate name + issuer, project slug, media
 * SHA-256); a record that already exists is never overwritten, so owner decisions
 * (`pnpm cms:apply-owner`) and later dashboard edits survive a re-run. Profile fields are only
 * filled while empty.
 *
 * - English only. Arabic is never written or approved (copy-review gate, per-locale status).
 * - Images are downloaded from the legacy site and REFUSED unless their SHA-256 matches the
 *   recorded value; they go through the Phase 6 media pipeline (private original, WebP
 *   derivatives, alt text) like any dashboard upload.
 * - The Profile keeps the owner-confirmed name/title; only an empty biography/link list is filled.
 * - Every record gets a `sourceNote` with its legacy page (never public).
 */
import { createHash } from 'node:crypto';
import { getPayload, type Payload } from 'payload';
import config from '@payload-config';
import {
  LEGACY_ORIGIN,
  legacyCertificates,
  legacyEducation,
  legacyProfile,
  legacyProjects,
  legacySkills,
  type LegacyImage,
} from '../legacy/legacy-content';

const MIGRATION = 'Real-content migration from the legacy website, 2026-09-28';
const note = (source: string, extra?: string) =>
  `${MIGRATION}. Source: ${LEGACY_ORIGIN}${source.startsWith('/') ? source : ` ${source}`}${extra ? `. ${extra}` : ''}`;

function lexical(paragraphs: string[]) {
  if (!paragraphs.length) return null;
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        children: [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
      })),
    },
  };
}

async function upsert(
  payload: Payload,
  collection: 'skills' | 'education' | 'certificates' | 'projects',
  where: Record<string, { equals: string }>,
  data: Record<string, unknown>,
  draft = false,
): Promise<number> {
  const found = await payload.find({
    collection,
    where,
    limit: 1,
    draft: true,
    overrideAccess: true,
    locale: 'en',
  });
  const existing = found.docs[0];
  if (existing) return Number(existing.id); // create-only: never overwrite (owner decisions, dashboard edits)
  // Generic over four collections: the data shapes are validated by Payload at runtime.
  type CreateArgs = Parameters<typeof payload.create>[0];
  const doc = await payload.create({
    collection,
    data,
    draft,
    overrideAccess: true,
    locale: 'en',
  } as CreateArgs);
  return Number(doc.id);
}

async function media(payload: Payload, image: LegacyImage): Promise<number> {
  const existing = await payload.find({
    collection: 'media',
    where: { sourceNote: { contains: image.sha256 } },
    limit: 1,
    overrideAccess: true,
  });
  if (existing.docs[0]) return Number(existing.docs[0].id); // create-only
  const url = `${LEGACY_ORIGIN}${encodeURI(image.path)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const data = Buffer.from(await res.arrayBuffer());
  const hash = createHash('sha256').update(data).digest('hex');
  if (hash !== image.sha256)
    throw new Error(`${url}: content changed (SHA-256 ${hash}); refusing to import.`);
  const name = image.path.split('/').slice(-2).join('-').replace(/\s+/g, '-');
  const doc = await payload.create({
    collection: 'media',
    locale: 'en',
    data: { alt: image.alt, sourceNote: note(image.path, `SHA-256 ${image.sha256}`) },
    file: { data, mimetype: 'image/png', name, size: data.length },
    overrideAccess: true,
  });
  return Number(doc.id);
}

const payload = await getPayload({ config });
const counts = { skills: 0, education: 0, certificates: 0, projects: 0, media: 0 };

// Skills (names + categories only; no percentages).
const skillIds = new Map<string, number>();
for (const [i, s] of legacySkills.entries()) {
  skillIds.set(
    s.name,
    await upsert(
      payload,
      'skills',
      { name: { equals: s.name } },
      {
        name: s.name,
        category: s.category,
        displayOrder: (i + 1) * 10,
        translationStatus: 'approved',
        sourceNote: note(
          s.source,
          s.normalised?.length ? `Normalised: ${s.normalised.join('; ')}` : undefined,
        ),
        _status: 'published',
      },
    ),
  );
  counts.skills++;
}

// Profile (EN biography + validated social links; identity untouched) — only while empty.
const currentProfile = await payload.findGlobal({
  slug: 'profile',
  locale: 'en',
  depth: 0,
  overrideAccess: true,
});
const profileData: Record<string, unknown> = {};
if (!currentProfile.shortBio) profileData.shortBio = legacyProfile.shortBio;
if (!currentProfile.longBio) profileData.longBio = lexical(legacyProfile.longBio);
if (!currentProfile.socialLinks?.length) profileData.socialLinks = legacyProfile.socialLinks;
if (Object.keys(profileData).length)
  await payload.updateGlobal({
    slug: 'profile',
    locale: 'en',
    data: { ...profileData, _status: 'published' },
    overrideAccess: true,
  });

// Education (year precision).
await upsert(
  payload,
  'education',
  { degree: { equals: legacyEducation.degree } },
  {
    institution: legacyEducation.institution,
    degree: legacyEducation.degree,
    startDate: `${legacyEducation.startYear}-01-01T00:00:00.000Z`,
    endDate: `${legacyEducation.endYear}-01-01T00:00:00.000Z`,
    datePrecision: 'year',
    description: lexical([legacyEducation.description]),
    translationStatus: 'approved',
    sourceNote: note(legacyEducation.source, `Normalised: ${legacyEducation.normalised.join('; ')}`),
    _status: 'published',
  },
);
counts.education++;

// Certificates → drafts (no certificate files on the legacy site).
for (const c of legacyCertificates) {
  await upsert(
    payload,
    'certificates',
    { name: { equals: c.name }, issuer: { equals: c.issuer } },
    {
      name: c.name,
      issuer: c.issuer,
      sourceNote: note(
        '/services.html',
        `Group “${c.group}”. Legacy wording: “${c.legacy}”. No file, date or ID on the legacy site — attach the certificate before publishing.`,
      ),
      _status: 'draft',
    },
    true,
  );
  counts.certificates++;
}

// Projects (+ their verified screenshots).
for (const p of legacyProjects) {
  const imageIds: number[] = [];
  for (const image of p.images) {
    imageIds.push(await media(payload, image));
    counts.media++;
  }
  const published = p.status === 'published';
  await upsert(
    payload,
    'projects',
    { slug: { equals: p.slug } },
    {
      title: p.title,
      slug: p.slug,
      summary: p.summary,
      description: lexical(p.overview),
      architecture: lexical(p.architecture ?? []),
      category: p.category,
      timeline: { start: null, end: p.date ? `${p.date}-01T00:00:00.000Z` : null },
      technologies: (p.technologies ?? []).map((name) => skillIds.get(name)).filter(Boolean),
      links: p.repository ? [{ label: 'Source code on GitHub', url: p.repository, kind: 'repository' }] : [],
      cover: imageIds[0] ?? null,
      gallery: imageIds.slice(1),
      featured: p.featured,
      sortOrder: p.sortOrder,
      seo: p.seo.description ? p.seo : { title: p.seo.title },
      translationStatus: published ? 'approved' : 'draft',
      sourceNote: note(
        p.source,
        [`Legacy ${p.key}`, p.normalised?.length ? `Normalised: ${p.normalised.join('; ')}` : '']
          .filter(Boolean)
          .join('. '),
      ),
      _status: p.status,
    },
    !published,
  );
  counts.projects++;
}

payload.logger.info(
  `Legacy import done (create-only; existing records kept): ${JSON.stringify(counts)}; profile fields filled: ${Object.keys(profileData).join(', ') || 'none'}.`,
);
process.exit(0);
