/**
 * `pnpm cms:apply-owner` — applies the owner-confirmed decisions (src/cms/owner/owner-content.ts)
 * on top of the legacy migration. Idempotent. English only: no Arabic is written or approved.
 * Touches ONLY: Profile email + social links, the Experience entry (upsert by organization +
 * title), the Education correction, the certificates' publication, and the web CV; and (Phase 13,
 * owner-approved) the Profile short bio, the AI-technique and technology skills (create-only) and
 * the technologies of two projects (existing links kept).
 * Everything else (other projects, long biography, featured set, screenshots…) is left as it is.
 */
import { getPayload } from 'payload';
import config from '@payload-config';
import { legacyCertificates } from '../legacy/legacy-content';
import {
  OWNER_DECISIONS_DATE,
  ownerAiSkills,
  ownerEducation,
  ownerExperience,
  ownerProfile,
  ownerProjectTechnologies,
  ownerShortBio,
  ownerTechnologies,
  PHASE13_DECISIONS_DATE,
  publishCertificatesWithoutFiles,
  publishWebCv,
} from '../owner/owner-content';

const note = (what: string) =>
  `Owner-confirmed (${OWNER_DECISIONS_DATE}): ${what}. docs/content/OWNER_PROFILE.md`;

function lexical(paragraphs: string[]) {
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

const payload = await getPayload({ config });
const done: string[] = [];

// Profile: official email + public profiles (replaces the list; Facebook is never included).
await payload.updateGlobal({
  slug: 'profile',
  locale: 'en',
  data: { email: ownerProfile.email, socialLinks: ownerProfile.socialLinks, _status: 'published' },
  overrideAccess: true,
});
done.push(`profile: email + ${ownerProfile.socialLinks.map((l) => l.network).join(', ')}`);

// Experience (no dates: none were stated).
for (const e of ownerExperience) {
  const data = {
    organization: e.organization,
    title: e.title,
    description: lexical(e.description),
    startDate: null,
    endDate: null,
    translationStatus: 'approved' as const,
    sourceNote: note('experience statement and CTO role at VegaCORE; no dates were provided, none stored'),
    _status: 'published' as const,
  };
  const found = await payload.find({
    collection: 'experience',
    where: { organization: { equals: e.organization }, title: { equals: e.title } },
    locale: 'en',
    draft: true,
    limit: 1,
    overrideAccess: true,
  });
  if (found.docs[0])
    await payload.update({
      collection: 'experience',
      id: found.docs[0].id,
      locale: 'en',
      data,
      overrideAccess: true,
    });
  else await payload.create({ collection: 'experience', locale: 'en', data, overrideAccess: true });
  done.push(`experience: ${e.title} — ${e.organization}`);
}

// Education correction (year precision; no start date was stated).
const edu = await payload.find({
  collection: 'education',
  where: { degree: { equals: ownerEducation.degree } },
  locale: 'en',
  draft: true,
  limit: 1,
  overrideAccess: true,
});
if (!edu.docs[0]) throw new Error('Education record not found: run `pnpm cms:import-legacy` first.');
await payload.update({
  collection: 'education',
  id: edu.docs[0].id,
  locale: 'en',
  data: {
    institution: ownerEducation.institution,
    startDate: null,
    endDate: `${ownerEducation.graduationYear}-01-01T00:00:00.000Z`,
    datePrecision: 'year',
    sourceNote: note(
      `institution “${ownerEducation.institution}”, graduation ${ownerEducation.graduationYear} (overrides the legacy “European Internaional University, EIU, 2021 – 2025”); degree and description from the legacy resume`,
    ),
    _status: 'published',
  },
  overrideAccess: true,
});
done.push(`education: ${ownerEducation.institution} — ${ownerEducation.graduationYear}`);

// Certificates: publish the migrated records without files (owner authorisation).
if (publishCertificatesWithoutFiles) {
  let published = 0;
  for (const c of legacyCertificates) {
    const found = await payload.find({
      collection: 'certificates',
      where: { name: { equals: c.name }, issuer: { equals: c.issuer } },
      locale: 'en',
      draft: true,
      limit: 1,
      overrideAccess: true,
    });
    const doc = found.docs[0];
    if (!doc)
      throw new Error(`Certificate not found: ${c.name} (${c.issuer}) — run cms:import-legacy first.`);
    await payload.update({
      collection: 'certificates',
      id: doc.id,
      locale: 'en',
      data: {
        translationStatus: 'approved',
        sourceNote: doc.sourceNote?.includes('published without a certificate file')
          ? doc.sourceNote
          : `${doc.sourceNote ?? ''} | ${note('published without a certificate file')}`,
        _status: 'published',
      },
      overrideAccess: true,
    });
    published++;
  }
  done.push(`certificates: ${published} published without files`);
}

// Web CV (no PDF).
if (publishWebCv) {
  await payload.updateGlobal({
    slug: 'cv',
    locale: 'en',
    data: {
      webCv: true,
      translationStatus: 'approved',
      sourceNote: note('publish the CV as web content without a file'),
      _status: 'published',
    },
    overrideAccess: true,
  });
  done.push('cv: web CV published (no file)');
}

// ---- Phase 13 (owner-approved 2026-09-29): short bio, AI skills, project technologies ----------
const note13 = (what: string) =>
  `Owner-approved (${PHASE13_DECISIONS_DATE}, Phase 13): ${what}. docs/reports/PHASE_13_CONTENT_REVIEW.md`;

await payload.updateGlobal({
  slug: 'profile',
  locale: 'en',
  data: { shortBio: ownerShortBio, _status: 'published' },
  overrideAccess: true,
});
done.push('profile: short bio (AI Engineer positioning)');

// Skills: create-only (an existing skill of the same name is never overwritten).
const skillIds = new Map<string, number>();
for (const s of [...ownerAiSkills, ...ownerTechnologies]) {
  const found = await payload.find({
    collection: 'skills',
    where: { name: { equals: s.name } },
    locale: 'en',
    draft: true,
    limit: 1,
    overrideAccess: true,
  });
  const existing = found.docs[0];
  const id = existing
    ? Number(existing.id)
    : Number(
        (
          await payload.create({
            collection: 'skills',
            locale: 'en',
            data: {
              name: s.name,
              category: s.category,
              displayOrder: s.displayOrder,
              translationStatus: 'approved',
              sourceNote: note13(`named in ${s.source}`),
              _status: 'published',
            },
            overrideAccess: true,
          })
        ).id,
      );
  skillIds.set(s.name, id);
}
done.push(`skills: ${ownerAiSkills.length} AI techniques + ${ownerTechnologies.length} technologies ensured`);

// Project technologies: owner order first, then any links the project already had (none dropped).
for (const [slug, names] of Object.entries(ownerProjectTechnologies)) {
  const found = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug } },
    locale: 'en',
    draft: true,
    depth: 0,
    limit: 1,
    overrideAccess: true,
  });
  const project = found.docs[0];
  if (!project) throw new Error(`Project not found: ${slug} — run cms:import-legacy first.`);
  const ids: number[] = [];
  for (const name of names) {
    let id = skillIds.get(name);
    if (id === undefined) {
      const s = await payload.find({
        collection: 'skills',
        where: { name: { equals: name } },
        locale: 'en',
        draft: true,
        limit: 1,
        overrideAccess: true,
      });
      if (!s.docs[0]) throw new Error(`Skill not found: ${name}`);
      id = Number(s.docs[0].id);
    }
    ids.push(id);
  }
  const existing = (project.technologies ?? []).map((t) => Number(typeof t === 'object' ? t.id : t));
  const technologies = [...ids, ...existing.filter((id) => !ids.includes(id))];
  await payload.update({
    collection: 'projects',
    id: project.id,
    locale: 'en',
    data: { technologies, _status: 'published' },
    overrideAccess: true,
  });
  done.push(`project ${slug}: ${technologies.length} technologies`);
}

payload.logger.info(`Owner content applied: ${done.join(' · ')}`);
process.exit(0);
