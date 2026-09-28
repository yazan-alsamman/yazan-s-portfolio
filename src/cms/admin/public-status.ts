import type { Payload } from 'payload';
import { routing, type Locale } from '@/i18n/routing';
import { copyReview } from '@/config/copy-review';
import {
  fetchCertificates,
  fetchCv,
  fetchEducation,
  fetchExperience,
  fetchProfile,
  fetchProjectBySlug,
  fetchRouteAvailability,
  fetchSkills,
} from '@/content/payload-adapter';
import { localizedPath } from '@/lib/seo/urls';
import { publicImage, type MediaLike } from '@/content/files';

/**
 * "Where is this on the public site?" — per language, for the document being edited.
 * Uses the SAME public readers as the site (src/content), so the answer cannot drift from what
 * visitors actually see. When an item is not public, the reasons are spelled out in editor
 * terms (not published, archived, language not approved, a required field missing…).
 */

export type Supported =
  'projects' | 'experience' | 'education' | 'certificates' | 'skills' | 'profile' | 'cv';

export type LocaleStatus = {
  locale: Locale;
  live: boolean;
  /** Public URL(s) where this content appears (only when live). */
  urls: string[];
  reasons: string[];
  /** Non-blocking media notes (e.g. an image hidden in this language for lack of alt text). */
  notes: string[];
  /** Arabic: visible in development/preview, but production also needs the Arabic copy review. */
  gatedInProduction: boolean;
};

type RawDoc = Record<string, unknown> & {
  _status?: string | null;
  archived?: boolean | null;
  translationStatus?: string | null;
};

const REQUIRED: Partial<Record<Supported, [string, string][]>> = {
  projects: [
    ['title', 'Title'],
    ['summary', 'Summary'],
    ['seo.title', 'SEO title'],
    ['seo.description', 'SEO description'],
  ],
  experience: [['title', 'Role / title']],
  education: [
    ['institution', 'Institution'],
    ['degree', 'Degree'],
  ],
  certificates: [['name', 'Certificate name']],
  profile: [
    ['name', 'Name'],
    ['title', 'Professional title'],
  ],
};

function get(doc: RawDoc, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (v, k) => (v && typeof v === 'object' ? (v as Record<string, unknown>)[k] : undefined),
      doc,
    );
}

async function readRaw(payload: Payload, target: Supported, id: string | number | undefined, locale: Locale) {
  const base = { locale, fallbackLocale: false as const, depth: 0, draft: false, overrideAccess: true };
  if (target === 'profile' || target === 'cv')
    return (await payload.findGlobal({ slug: target, ...base })) as unknown as RawDoc;
  if (id === undefined) return null;
  try {
    return (await payload.findByID({ collection: target, id, ...base })) as unknown as RawDoc;
  } catch {
    return null; // never published yet
  }
}

async function isPublic(payload: Payload, target: Supported, doc: RawDoc, locale: Locale): Promise<boolean> {
  const read = { payload, locale };
  const id = String(doc.id);
  switch (target) {
    case 'projects':
      return (await fetchProjectBySlug(read, String(doc.slug ?? ''))) !== null;
    case 'experience':
      return (await fetchExperience(read)).some((x) => x.id === id);
    case 'education':
      return (await fetchEducation(read)).some((x) => x.id === id);
    case 'certificates':
      return (await fetchCertificates(read)).some((x) => x.id === id);
    case 'skills':
      return (await fetchSkills(read)).some((x) => x.id === id);
    case 'profile':
      return (await fetchProfile(read)) !== null;
    case 'cv':
      return (await fetchCv(read)) !== null;
  }
}

async function urlsFor(payload: Payload, target: Supported, doc: RawDoc, locale: Locale): Promise<string[]> {
  const routes = await fetchRouteAvailability({ payload, locale });
  const at = (path: string) => localizedPath(locale, path);
  switch (target) {
    case 'projects':
      return [at(`/projects/${doc.slug}`)];
    case 'experience':
      return routes.experience ? [at('/experience')] : [];
    case 'education':
      return [routes.about ? at('/about') : null, routes.cv ? at('/cv') : null].filter(
        (u): u is string => !!u,
      );
    case 'certificates':
      return routes.certificates ? [at('/certificates')] : [];
    case 'skills':
      return routes.skills ? [at('/skills')] : [];
    case 'profile':
      return [at('/'), routes.about ? at('/about') : null, routes.contact ? at('/contact') : null].filter(
        (u): u is string => !!u,
      );
    case 'cv':
      return [at('/cv')];
  }
}

export async function publicStatus(
  payload: Payload,
  target: Supported,
  id: string | number | undefined,
): Promise<LocaleStatus[]> {
  return Promise.all(
    routing.locales.map(async (locale): Promise<LocaleStatus> => {
      const gatedInProduction = copyReview[locale]?.status === 'pending';
      const doc = await readRaw(payload, target, id, locale);
      const reasons: string[] = [];
      if (!doc || (target !== 'profile' && target !== 'cv' && doc._status !== 'published')) {
        reasons.push('Not published yet (only drafts exist).');
      }
      if (doc?.archived) reasons.push('Archived.');
      if (doc && doc.translationStatus !== 'approved') {
        reasons.push(`This language is “${doc.translationStatus ?? 'draft'}”, not “Approved”.`);
      }
      for (const [path, label] of doc ? (REQUIRED[target] ?? []) : []) {
        const v = get(doc!, path);
        if (typeof v !== 'string' || v.trim() === '') reasons.push(`${label} is empty in this language.`);
      }
      if (target === 'cv' && doc && !doc.webCv && !(doc.downloadVisible && doc.file))
        reasons.push('Turn on “Publish the web CV”, or select a PDF and turn on “Download visible”.');

      const live = doc ? await isPublic(payload, target, doc, locale) : false;
      // Media notes (Phase 6): images without alt text in this language are hidden there.
      const notes = doc && target === 'projects' ? await imageNotes(payload, doc, locale) : [];
      if (!live && reasons.length === 0)
        reasons.push('Some content is incomplete or invalid (see field errors).');
      return {
        locale,
        live,
        urls: live && doc ? await urlsFor(payload, target, doc, locale) : [],
        reasons: live ? [] : reasons,
        notes,
        gatedInProduction,
      };
    }),
  );
}

/** Cover/gallery images that will not appear in this language (no alt text, or not optimized). */
async function imageNotes(payload: Payload, doc: RawDoc, locale: Locale): Promise<string[]> {
  const ids: [string, unknown][] = [
    ['Cover image', doc.cover],
    ...((Array.isArray(doc.gallery) ? doc.gallery : []) as unknown[]).map(
      (g, i) => [`Gallery image ${i + 1}`, g] as [string, unknown],
    ),
  ];
  const notes: string[] = [];
  for (const [label, id] of ids) {
    if (id === null || id === undefined || typeof id === 'object') continue;
    const media = (await payload
      .findByID({
        collection: 'media',
        id: id as number,
        locale,
        fallbackLocale: false,
        depth: 0,
        overrideAccess: true,
      })
      .catch(() => null)) as unknown as (MediaLike & { optimizationStatus?: string }) | null;
    if (!media) continue;
    if (media.optimizationStatus === 'failed')
      notes.push(`${label}: optimization failed — it is not shown anywhere.`);
    else if (!publicImage(media)) notes.push(`${label}: no alt text in this language — it is hidden here.`);
  }
  return notes;
}
