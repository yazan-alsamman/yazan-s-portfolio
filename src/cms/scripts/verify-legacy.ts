/**
 * `pnpm cms:verify-legacy` — deterministic completeness check of the legacy-content migration and
 * of the owner-confirmed layer applied on top of it (`pnpm cms:apply-owner`).
 * Read-only. Compares the CMS with the migration dataset (src/cms/legacy/legacy-content.ts) and
 * prints the answers as JSON; exits non-zero on any inconsistency. With `BASE_URL` set (a running
 * build), it also checks that every published record is reachable on the public site.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { getPayload } from 'payload';
import config from '@payload-config';
import { optimizationStatus } from '../media-policy';
import {
  ownerEducation,
  ownerExperience,
  ownerProfile,
  publishCertificatesWithoutFiles,
  publishWebCv,
} from '../owner/owner-content';
import {
  legacyCertificates,
  legacyPages,
  legacyProfile,
  legacyProjects,
  legacySkills,
} from '../legacy/legacy-content';

const payload = await getPayload({ config });
const errors: string[] = [];
const all = async (
  collection: 'projects' | 'skills' | 'certificates' | 'education' | 'experience' | 'media',
) =>
  (await payload.find({ collection, limit: 500, draft: true, overrideAccess: true, locale: 'all', depth: 0 }))
    .docs as unknown as Record<string, unknown>[];
const status = (d: Record<string, unknown>) => String(d._status ?? 'published');
const ts = (d: Record<string, unknown>, l: 'en' | 'ar') =>
  (d.translationStatus as Record<string, string> | undefined)?.[l] ?? 'draft';

const [projects, skills, certificates, education, experience, media] = await Promise.all([
  all('projects'),
  all('skills'),
  all('certificates'),
  all('education'),
  all('experience'),
  all('media'),
]);

// Projects: every legacy project present exactly once, with the expected publication state.
for (const p of legacyProjects) {
  const found = projects.filter((d) => d.slug === p.slug);
  if (found.length !== 1) errors.push(`project ${p.key} (${p.slug}): ${found.length} records`);
  const d = found[0];
  if (!d) continue;
  const live = status(d) === 'published' && ts(d, 'en') === 'approved' && !d.archived;
  if ((p.status === 'published') !== live) errors.push(`project ${p.slug}: expected ${p.status}`);
  const images = (d.cover ? 1 : 0) + ((d.gallery as unknown[]) ?? []).length;
  if (images !== p.images.length)
    errors.push(`project ${p.slug}: ${images} images, expected ${p.images.length}`);
}
const expectedSlugs = new Set(legacyProjects.map((p) => p.slug));
const extraProjects = projects.filter((d) => !expectedSlugs.has(String(d.slug)));
for (const s of legacySkills)
  if (skills.filter((d) => d.name === s.name).length !== 1)
    errors.push(`skill ${s.name} missing or duplicated`);
for (const c of legacyCertificates)
  if (
    certificates.filter((d) => (d.name as Record<string, string>)?.en === c.name && d.issuer === c.issuer)
      .length !== 1
  )
    errors.push(`certificate ${c.name} (${c.issuer}) missing or duplicated`);

// No record is approved in Arabic (the legacy site has no Arabic; the copy-review gate stands).
for (const [name, docs] of Object.entries({ projects, skills, certificates, education, experience }))
  for (const d of docs) if (ts(d, 'ar') === 'approved') errors.push(`${name} ${d.id}: approved in Arabic`);

// Media: every migrated image is optimized (all derivatives present) and has English alt text.
const imagesDir = path.resolve(process.env.MEDIA_DIR ?? 'media', 'images');
for (const m of media) {
  const s = optimizationStatus(m as Parameters<typeof optimizationStatus>[0], (f) =>
    existsSync(path.join(imagesDir, f)),
  );
  if (s.status !== 'ready') errors.push(`media ${m.id}: ${s.status} ${s.detail}`);
  if (!(m.alt as Record<string, string> | undefined)?.en?.trim())
    errors.push(`media ${m.id}: no English alt text`);
}

// Fixtures must never be live alongside real content.
const fixtureLike = [...projects, ...skills, ...certificates, ...education, ...experience].filter((d) =>
  /fixture|lorem|placeholder/i.test(JSON.stringify([d.title, d.name, d.summary, d.degree, d.organization])),
);
for (const d of fixtureLike)
  if (status(d) === 'published') errors.push(`published fixture/placeholder record ${d.id}`);

const profile = (await payload.findGlobal({
  slug: 'profile',
  locale: 'en',
  depth: 0,
  overrideAccess: true,
})) as unknown as Record<string, unknown>;
if (profile.shortBio !== legacyProfile.shortBio)
  errors.push('profile short bio differs from the legacy text');

// Owner-confirmed layer (src/cms/owner/owner-content.ts, `pnpm cms:apply-owner`).
const socials = (profile.socialLinks as { network: string; url: string }[] | undefined) ?? [];
if (profile.email !== ownerProfile.email) errors.push(`profile email is ${String(profile.email)}`);
for (const l of ownerProfile.socialLinks)
  if (!socials.some((s) => s.network === l.network && s.url === l.url))
    errors.push(`missing ${l.network} link`);
if (socials.some((s) => /facebook\.com/i.test(s.url)))
  errors.push('Facebook is published (owner decision: no)');
if (socials.length !== ownerProfile.socialLinks.length)
  errors.push(`unexpected social links: ${socials.length}`);
const liveOnly = (docs: Record<string, unknown>[]) =>
  docs.filter((d) => status(d) === 'published' && ts(d, 'en') === 'approved' && !d.archived);
for (const e of ownerExperience) {
  const found = liveOnly(experience).filter(
    (d) => d.organization === e.organization && (d.title as Record<string, string>)?.en === e.title,
  );
  if (found.length !== 1)
    errors.push(`experience ${e.title} at ${e.organization}: ${found.length} live records`);
  if (found[0] && (found[0].startDate || found[0].endDate))
    errors.push('experience has dates the owner never gave');
}
const edu = education.find((d) => (d.degree as Record<string, string>)?.en === ownerEducation.degree);
if ((edu?.institution as Record<string, string>)?.en !== ownerEducation.institution)
  errors.push('education institution');
if (!String(edu?.endDate ?? '').startsWith(String(ownerEducation.graduationYear)) || edu?.startDate)
  errors.push('education dates');
if (edu?.datePrecision !== 'year') errors.push('education precision');
if (publishCertificatesWithoutFiles && liveOnly(certificates).length !== legacyCertificates.length)
  errors.push(`certificates published: ${liveOnly(certificates).length}/${legacyCertificates.length}`);
const cv = (await payload.findGlobal({
  slug: 'cv',
  locale: 'all',
  depth: 0,
  overrideAccess: true,
})) as unknown as Record<string, Record<string, unknown> | undefined>;
if (publishWebCv && (cv.webCv?.en !== true || cv.translationStatus?.en !== 'approved'))
  errors.push('web CV not published');
if (Object.values(cv.file ?? {}).some(Boolean)) errors.push('a CV file is set (none was supplied)');
for (const [name, docs] of Object.entries({ experience, certificates, education }))
  for (const d of docs)
    if (JSON.stringify(d).includes('yalsamman')) errors.push(`${name} ${d.id}: obsolete email`);

// Public reachability (optional): every published project/route answers 200 on BASE_URL.
const unreachable: string[] = [];
if (process.env.BASE_URL) {
  const base = process.env.BASE_URL.replace(/\/$/, '');
  const live = legacyProjects.filter((p) => p.status === 'published').map((p) => `/projects/${p.slug}`);
  for (const route of [
    '/',
    '/about',
    '/projects',
    '/skills',
    '/contact',
    '/experience',
    '/certificates',
    '/cv',
    ...live,
  ]) {
    const r = await fetch(base + route);
    if (r.status !== 200) unreachable.push(`${route} → ${r.status}`);
  }
  for (const p of legacyProjects.filter((p) => p.status === 'draft')) {
    const r = await fetch(`${base}/projects/${p.slug}`);
    if (r.status !== 404 && r.status !== 200) unreachable.push(`draft ${p.slug} → ${r.status}`);
  }
  errors.push(...unreachable.map((u) => `unreachable: ${u}`));
}

const count = (docs: Record<string, unknown>[]) => ({
  total: docs.length,
  publishedEn: docs.filter((d) => status(d) === 'published' && ts(d, 'en') === 'approved' && !d.archived)
    .length,
  draft: docs.filter((d) => status(d) !== 'published').length,
});
const report = {
  legacyPagesDiscovered: legacyPages.length,
  legacyPagesInspected: legacyPages.length,
  datasetRecords: {
    projects: legacyProjects.length,
    skills: legacySkills.length,
    certificates: legacyCertificates.length,
    education: 1,
    profileFields: 3,
    images: legacyProjects.reduce((n, p) => n + p.images.length, 0),
  },
  cms: {
    projects: count(projects),
    skills: count(skills),
    certificates: count(certificates),
    education: count(education),
    experience: count(experience),
    media: media.length,
  },
  projectsNotInDataset: extraProjects.map((d) => d.slug),
  publishedFixtures: fixtureLike.filter((d) => status(d) === 'published').length,
  unreachable,
  errors,
};
console.log(JSON.stringify(report, null, 1));
process.exit(errors.length ? 1 : 0);
