/**
 * `pnpm cms:apply-phase14` — applies the Phase 14 content (src/cms/content/phase14-content.ts).
 * Idempotent; English only (no Arabic is written or approved). Take a database backup first.
 * Touches ONLY: the Profile long biography and principles; the skills listed there (created when
 * missing, otherwise only their category and evidence status change); two skill re-categorisations;
 * and the listed projects (created when missing; for existing ones only the fields given are
 * written — covers, galleries, timelines and any section not listed stay as they are).
 */
import { getPayload } from 'payload';
import config from '@payload-config';
import {
  PHASE14_DATE,
  phase14LongBio,
  phase14Principles,
  phase14Projects,
  phase14SkillCategories,
  phase14Skills,
} from '../content/phase14-content';

const note = (what: string) =>
  `Phase 14 (${PHASE14_DATE}): ${what}. docs/content/PORTFOLIO_CONTENT_MATRIX.md`;

const TEXT_CODE = 16;

/** Paragraphs → Lexical; `inline code` becomes code-formatted text. */
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
        children: text
          .split('`')
          .map((part, i) => ({ part, code: i % 2 === 1 }))
          .filter(({ part }) => part.length > 0)
          .map(({ part, code }) => ({
            type: 'text',
            text: part,
            format: code ? TEXT_CODE : 0,
            detail: 0,
            mode: 'normal',
            style: '',
            version: 1,
          })),
      })),
    },
  };
}

const payload = await getPayload({ config });
const done: string[] = [];

// ---- Profile -------------------------------------------------------------------------------------
await payload.updateGlobal({
  slug: 'profile',
  locale: 'en',
  data: { longBio: lexical(phase14LongBio), principles: phase14Principles, _status: 'published' },
  overrideAccess: true,
});
done.push(`profile: long bio + ${phase14Principles.length} principles`);

// ---- Skills --------------------------------------------------------------------------------------
async function findSkill(name: string) {
  const found = await payload.find({
    collection: 'skills',
    where: { name: { equals: name } },
    locale: 'en',
    draft: true,
    limit: 1,
    overrideAccess: true,
  });
  return found.docs[0];
}

let created = 0;
let updated = 0;
for (const s of phase14Skills) {
  const existing = await findSkill(s.name);
  if (existing) {
    await payload.update({
      collection: 'skills',
      id: existing.id,
      locale: 'en',
      data: { category: s.category, provenance: s.provenance },
      overrideAccess: true,
    });
    updated++;
  } else {
    await payload.create({
      collection: 'skills',
      locale: 'en',
      data: {
        name: s.name,
        category: s.category,
        provenance: s.provenance,
        displayOrder: s.displayOrder,
        translationStatus: 'approved',
        sourceNote: note(`${s.provenance} — evidence: ${s.source}`),
        _status: 'published',
      },
      overrideAccess: true,
    });
    created++;
  }
}
for (const [name, category] of Object.entries(phase14SkillCategories)) {
  const existing = await findSkill(name);
  if (!existing) throw new Error(`Skill not found: ${name}`);
  await payload.update({
    collection: 'skills',
    id: existing.id,
    locale: 'en',
    data: { category },
    overrideAccess: true,
  });
}
done.push(
  `skills: ${created} created, ${updated} updated, ${Object.keys(phase14SkillCategories).length} re-categorised`,
);

// ---- Projects ------------------------------------------------------------------------------------
const skillId = async (name: string) => {
  const s = await findSkill(name);
  if (!s) throw new Error(`Skill not found: ${name} (add it to phase14Skills)`);
  return Number(s.id);
};

let projectsCreated = 0;
let projectsUpdated = 0;
for (const p of phase14Projects) {
  const found = await payload.find({
    collection: 'projects',
    where: { slug: { equals: p.slug } },
    locale: 'en',
    draft: true,
    depth: 0,
    limit: 1,
    overrideAccess: true,
  });
  const existing = found.docs[0];

  const data: Record<string, unknown> = {
    provenance: p.provenance,
    tier: p.tier,
    featured: p.featured,
    sortOrder: p.sortOrder,
    translationStatus: 'approved',
    _status: 'published',
  };
  if (p.title) data.title = p.title;
  if (p.summary) data.summary = p.summary;
  if (p.category) data.category = p.category;
  if (p.schematic) data.schematic = p.schematic;
  for (const [key, paragraphs] of Object.entries(p.sections ?? {})) data[key] = lexical(paragraphs);
  if (p.links) data.links = p.links;
  if (p.seo) data.seo = p.seo;

  if (p.technologies) {
    const ids: number[] = [];
    for (const name of p.technologies) ids.push(await skillId(name));
    const had = (existing?.technologies ?? []).map((t) => Number(typeof t === 'object' ? t.id : t));
    data.technologies = [...ids, ...had.filter((id) => !ids.includes(id))];
  }

  if (p.experience) {
    const e = await payload.find({
      collection: 'experience',
      where: { organization: { equals: p.experience.organization }, title: { equals: p.experience.title } },
      locale: 'en',
      draft: true,
      limit: 1,
      overrideAccess: true,
    });
    if (!e.docs[0])
      throw new Error(`Experience not found: ${p.experience.title} — ${p.experience.organization}`);
    data.experience = e.docs[0].id;
  }

  const stamp = note(`${p.provenance} / ${p.tier} — source: ${p.source}`);
  if (existing) {
    const prior = existing.sourceNote ?? '';
    data.sourceNote = prior.includes('Phase 14')
      ? prior.replace(/Phase 14 \(.*$/s, stamp)
      : [prior, stamp].filter(Boolean).join(' | ');
    await payload.update({
      collection: 'projects',
      id: existing.id,
      locale: 'en',
      data,
      overrideAccess: true,
    });
    projectsUpdated++;
  } else {
    if (!p.title || !p.summary) throw new Error(`New project ${p.slug} needs a title and summary`);
    data.slug = p.slug;
    data.sourceNote = stamp;
    type CreateArgs = Parameters<typeof payload.create>[0];
    await payload.create({ collection: 'projects', locale: 'en', data, overrideAccess: true } as CreateArgs);
    projectsCreated++;
  }
}
done.push(`projects: ${projectsCreated} created, ${projectsUpdated} updated`);

payload.logger.info(`Phase 14 content applied: ${done.join(' · ')}`);
process.exit(0);
