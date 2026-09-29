import type { Payload } from 'payload';
import type { Locale } from '@/i18n/routing';
import type {
  Document as PayloadDocument,
  Experience as PayloadExperience,
  Media,
  Project as PayloadProject,
  Skill as PayloadSkill,
} from '@/payload-types';
import { PUBLIC_SOURCE_ORDER, type DerivativeName } from '@/cms/media-policy';
import { fileUrl, publicImage, type MediaLike } from './files';
import { hasRichText, richTextOrNull } from './rich-text';
import {
  CertificateSchema,
  CvSchema,
  EducationSchema,
  ExperienceSchema,
  LinkSchema,
  ProfileSchema,
  ProjectSchema,
  ProjectSummarySchema,
  SkillDetailSchema,
  SkillSchema,
  SiteSettingsSchema,
  type Certificate,
  type ContentImage,
  type Cv,
  type Education,
  type Experience,
  type HomeSectionKey,
  type Profile,
  type SiteSettings,
  type Project,
  type ProjectRef,
  type ProjectSummary,
  type RouteAvailability,
  type Skill,
  type SkillDetail,
} from './types';

/**
 * Payload → application-contract mapping (the ONLY module that knows Payload document shapes).
 *
 * Publication filter, applied to every public read:
 *   1. anonymous access (`overrideAccess: false`, no user) → published & not archived only (CMS access);
 *   2. `draft: false` → the published version, never an unpublished edit;
 *   3. `locale` with no fallback → only values authored in that language;
 *   4. `translationStatus === 'approved'` in that locale (human review gate, T1/T6);
 *   5. Zod validation of the mapped model — incomplete/invalid content is skipped, never rendered.
 * Related documents that fail any of the above are dropped (no dangling references, T10).
 */

type Read = { payload: Payload; locale: Locale };

const publicRead = (locale: Locale) =>
  ({ locale, fallbackLocale: false, draft: false, overrideAccess: false }) as const;

function approved(doc: { translationStatus?: string | null } | null | undefined): boolean {
  return doc?.translationStatus === 'approved';
}

/**
 * Public image (Phase 6): always an optimized derivative, never the private original
 * (ADR-008), and never a meaningful image without alt text in this locale — such an image is
 * omitted rather than shown as if it were decorative (SEO_MASTER §26, no cross-locale fallback).
 */
function image(value: unknown, prefer: readonly DerivativeName[] = PUBLIC_SOURCE_ORDER): ContentImage | null {
  if (!value || typeof value !== 'object') return null; // unpublished/archived → not populated
  // No derivative (processing failed) → null: never fall back to the private original.
  return publicImage(value as Media as MediaLike, prefer);
}

type PublicDocFields = {
  _status?: string | null;
  archived?: boolean | null;
  translationStatus?: string | null;
};

function isPublicDoc(doc: PublicDocFields): boolean {
  return doc._status === 'published' && !doc.archived && approved(doc);
}

/** Populated relationship → public reference, or null (draft/archived/unapproved/unpopulated). */
function projectRef(value: unknown): ProjectRef | null {
  if (!value || typeof value !== 'object') return null;
  const p = value as PayloadProject;
  if (!isPublicDoc(p) || !p.slug || !p.title) return null;
  return { slug: p.slug, title: p.title };
}

function joinedProjects(join: { docs?: (number | PayloadProject)[] } | undefined | null): ProjectRef[] {
  return (join?.docs ?? []).map(projectRef).filter((r): r is ProjectRef => r !== null);
}

/**
 * Optional link rows are validated one by one: an incomplete row (e.g. a label missing in this
 * locale) is dropped instead of invalidating the whole document — otherwise a published project
 * would disappear from its detail URL while still listed on the index (a broken internal link).
 */
function links(
  value: { label?: string | null; url?: string | null; kind?: string | null }[] | null | undefined,
) {
  return (value ?? [])
    .map((l) => LinkSchema.safeParse({ label: l.label, url: l.url, kind: l.kind ?? 'other' }))
    .filter((r) => r.success)
    .map((r) => r.data!);
}

function skill(value: unknown): Skill | null {
  if (!value || typeof value !== 'object') return null;
  const s = value as PayloadSkill;
  if (s._status !== 'published' || s.archived || !approved(s)) return null;
  const parsed = SkillSchema.safeParse({
    id: String(s.id),
    name: s.name,
    label: s.label ?? null,
    category: s.category,
  });
  return parsed.success ? parsed.data : null;
}

function report(payload: Payload, what: string, error: unknown) {
  payload.logger.warn(
    `[content] skipped invalid ${what}: ${error instanceof Error ? error.message : String(error)}`,
  );
}

export async function fetchProfile({ payload, locale }: Read): Promise<Profile | null> {
  const doc = await payload.findGlobal({ slug: 'profile', depth: 1, ...publicRead(locale) });
  if (!approved(doc)) return null;
  const parsed = ProfileSchema.safeParse({
    name: doc.name,
    title: doc.title,
    shortBio: doc.shortBio ?? null,
    longBio: richTextOrNull(doc.longBio),
    // Portraits use the focal-point square crop (the editor places the focal point on the face).
    portrait: image(doc.portrait, ['square', ...PUBLIC_SOURCE_ORDER]),
    email: doc.email ?? null,
    socialLinks: (doc.socialLinks ?? []).map((l) => ({ network: l.network, url: l.url })),
  });
  if (!parsed.success) {
    report(payload, `profile (${locale})`, parsed.error);
    return null;
  }
  return parsed.data;
}

/**
 * Site-level SEO defaults (Phase 7, R-48). Text is used only in a locale whose Site Settings
 * translation status is Approved (no cross-locale fallback); the share image is a public
 * derivative with alt text in this locale, or nothing.
 */
export async function fetchSiteSettings({ payload, locale }: Read): Promise<SiteSettings> {
  const doc = await payload.findGlobal({ slug: 'site-settings', depth: 1, ...publicRead(locale) });
  const text = approved(doc);
  const parsed = SiteSettingsSchema.safeParse({
    homeTitle: text ? doc.seo?.title?.trim() || null : null,
    homeDescription: text ? doc.seo?.description?.trim() || null : null,
    // Share previews prefer the large landscape derivative (~1200 px wide is the OG sweet spot).
    shareImage: image(doc.shareImage, ['large', 'full', 'card']),
  });
  if (!parsed.success) {
    report(payload, `site settings (${locale})`, parsed.error);
    return { homeTitle: null, homeDescription: null, shareImage: null };
  }
  return parsed.data;
}

function toSummary(p: PayloadProject): unknown {
  return {
    id: String(p.id),
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    category: p.category ?? null,
    featured: Boolean(p.featured),
    cover: image(p.cover),
    technologies: (p.technologies ?? []).map(skill).filter((s): s is Skill => s !== null),
    seo: { title: p.seo?.title, description: p.seo?.description },
    updatedAt: p.updatedAt,
    dossier: {
      // The year a project is dated by: its stated end, else its stated start — never updatedAt.
      year: (p.timeline?.end ?? p.timeline?.start)?.slice(0, 4) ?? null,
      source: (p.links ?? []).some((l) => l?.kind === 'repository' && Boolean(l.url)),
      figures: (p.gallery ?? []).length,
      sections: (['problem', 'solution', 'architecture', 'results'] as const).filter(
        (k) => richTextOrNull(p[k]) !== null,
      ),
    },
  };
}

export async function fetchProjects(
  { payload, locale }: Read,
  options: { featuredOnly?: boolean } = {},
): Promise<ProjectSummary[]> {
  const result = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 200,
    sort: 'sortOrder',
    where: options.featuredOnly ? { featured: { equals: true } } : undefined,
    ...publicRead(locale),
  });
  const out: ProjectSummary[] = [];
  for (const doc of result.docs) {
    if (!approved(doc)) continue;
    const parsed = ProjectSummarySchema.safeParse(toSummary(doc));
    if (parsed.success) out.push(parsed.data);
    else report(payload, `project ${doc.slug} (${locale})`, parsed.error);
  }
  return out;
}

export async function fetchProjectBySlug({ payload, locale }: Read, slug: string): Promise<Project | null> {
  const result = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
    ...publicRead(locale),
  });
  const doc = result.docs[0];
  if (!doc || !approved(doc)) return null;
  const exp =
    doc.experience && typeof doc.experience === 'object' ? (doc.experience as PayloadExperience) : null;
  const parsed = ProjectSchema.safeParse({
    ...(toSummary(doc) as object),
    role: doc.role ?? null,
    links: links(doc.links),
    timeline: { start: doc.timeline?.start ?? null, end: doc.timeline?.end ?? null },
    gallery: (doc.gallery ?? []).map((g) => image(g)).filter((i): i is ContentImage => i !== null),
    videoUrl: doc.videoUrl ?? null,
    experience: exp && isPublicDoc(exp) ? { organization: exp.organization, title: exp.title } : null,
    body: {
      description: richTextOrNull(doc.description),
      problem: richTextOrNull(doc.problem),
      solution: richTextOrNull(doc.solution),
      architecture: richTextOrNull(doc.architecture),
      results: richTextOrNull(doc.results),
    },
  });
  if (!parsed.success) {
    report(payload, `project ${slug} (${locale})`, parsed.error);
    return null;
  }
  return parsed.data;
}

/** T9: resolve a retired URL to its current one (application owns URL policy). */
export async function fetchRedirect(
  payload: Payload,
  path: string,
): Promise<{ to: string; status: 307 | 308 } | null> {
  const result = await payload.find({
    collection: 'redirects',
    where: { from: { equals: path } },
    limit: 1,
    depth: 0,
    overrideAccess: false,
  });
  const r = result.docs[0];
  return r ? { to: r.to, status: r.statusCode === '307' ? 307 : 308 } : null;
}

export async function fetchCv({ payload, locale }: Read): Promise<Cv | null> {
  const doc = await payload.findGlobal({ slug: 'cv', depth: 1, ...publicRead(locale) });
  if (!approved(doc)) return null;
  const file = doc.file && typeof doc.file === 'object' && !doc.file.archived ? doc.file : null;
  // The page is public with a visible PDF, or as a web-only CV when "Publish the web CV" is on.
  const pdf = doc.downloadVisible && file?.url ? fileUrl(file.url) : null;
  if (!pdf && !doc.webCv) return null;
  const parsed = CvSchema.safeParse({
    url: pdf,
    label: doc.label ?? null,
    version: doc.version ?? null,
    updatedAt: doc.updatedAt,
  });
  return parsed.success ? parsed.data : null;
}

/** Published, locale-approved experience, newest first. */
export async function fetchExperience({ payload, locale }: Read): Promise<Experience[]> {
  const result = await payload.find({
    collection: 'experience',
    depth: 1,
    limit: 100,
    sort: '-startDate',
    ...publicRead(locale),
  });
  const out: Experience[] = [];
  for (const doc of result.docs) {
    if (!approved(doc)) continue;
    const parsed = ExperienceSchema.safeParse({
      id: String(doc.id),
      organization: doc.organization,
      title: doc.title,
      description: richTextOrNull(doc.description),
      startDate: doc.startDate ?? null,
      endDate: doc.endDate ?? null,
      technologies: (doc.technologies ?? []).map(skill).filter((x): x is Skill => x !== null),
      links: links(doc.links),
      projects: joinedProjects(doc.projects),
    });
    if (parsed.success) out.push(parsed.data);
    else report(payload, `experience ${doc.id} (${locale})`, parsed.error);
  }
  return out;
}

/** Published, locale-approved education entries, newest first (rendered on About and CV). */
export async function fetchEducation({ payload, locale }: Read): Promise<Education[]> {
  const result = await payload.find({
    collection: 'education',
    depth: 1,
    limit: 50,
    sort: '-startDate',
    ...publicRead(locale),
  });
  const out: Education[] = [];
  for (const doc of result.docs) {
    if (!approved(doc)) continue;
    const document =
      doc.document && typeof doc.document === 'object' ? (doc.document as PayloadDocument) : null;
    const parsed = EducationSchema.safeParse({
      id: String(doc.id),
      institution: doc.institution,
      degree: doc.degree,
      field: doc.field ?? null,
      startDate: doc.startDate ?? null,
      endDate: doc.endDate ?? null,
      datePrecision: doc.datePrecision ?? 'month',
      description: richTextOrNull(doc.description),
      document:
        document?.url && !document.archived
          ? { url: fileUrl(document.url), title: document.title ?? null }
          : null,
    });
    if (parsed.success) out.push(parsed.data);
    else report(payload, `education ${doc.id} (${locale})`, parsed.error);
  }
  return out;
}

/** Published, locale-approved certificates, newest first. */
export async function fetchCertificates({ payload, locale }: Read): Promise<Certificate[]> {
  const result = await payload.find({
    collection: 'certificates',
    depth: 1,
    limit: 200,
    sort: '-issueDate',
    ...publicRead(locale),
  });
  const out: Certificate[] = [];
  for (const doc of result.docs) {
    if (!approved(doc)) continue;
    let attachment: Certificate['attachment'] = null;
    const a = doc.attachment;
    if (a && a.value && typeof a.value === 'object') {
      if (a.relationTo === 'media') {
        const img = image(a.value);
        attachment = img ? { kind: 'image', image: img } : null;
      } else {
        const d = a.value as PayloadDocument;
        attachment = d.url && !d.archived ? { kind: 'pdf', url: fileUrl(d.url) } : null;
      }
    }
    const parsed = CertificateSchema.safeParse({
      id: String(doc.id),
      name: doc.name,
      issuer: doc.issuer,
      issueDate: doc.issueDate ?? null,
      credentialId: doc.credentialId ?? null,
      verificationUrl: doc.verificationUrl ?? null,
      description: doc.description ?? null,
      attachment,
    });
    if (parsed.success) out.push(parsed.data);
    else report(payload, `certificate ${doc.id} (${locale})`, parsed.error);
  }
  return out;
}

/** Published, locale-approved skills in display order, each with its evidence projects. */
export async function fetchSkills({ payload, locale }: Read): Promise<SkillDetail[]> {
  const result = await payload.find({
    collection: 'skills',
    depth: 1,
    limit: 300,
    sort: 'displayOrder',
    ...publicRead(locale),
  });
  const out: SkillDetail[] = [];
  for (const doc of result.docs) {
    if (!approved(doc)) continue;
    const parsed = SkillDetailSchema.safeParse({
      id: String(doc.id),
      name: doc.name,
      label: doc.label ?? null,
      category: doc.category,
      proficiencyLabel: doc.proficiencyLabel ?? null,
      evidence: joinedProjects(doc.evidence),
    });
    if (parsed.success) out.push(parsed.data);
    else report(payload, `skill ${doc.id} (${locale})`, parsed.error);
  }
  return out;
}

/**
 * Which content routes exist in this locale (IA: a page whose data set is empty is not
 * published — it appears in no navigation and no sitemap, and returns 404 in production).
 * About needs the long biography (its primary content), Contact an owner-approved channel,
 * CV a downloadable file; list pages need at least one public item.
 */
export async function fetchRouteAvailability({ payload, locale }: Read): Promise<RouteAvailability> {
  const [profile, projects, experience, skills, certificates, cv] = await Promise.all([
    fetchProfile({ payload, locale }),
    fetchProjects({ payload, locale }),
    fetchExperience({ payload, locale }),
    fetchSkills({ payload, locale }),
    fetchCertificates({ payload, locale }),
    fetchCv({ payload, locale }),
  ]);
  return {
    about: hasRichText(profile?.longBio),
    projects: projects.length > 0,
    experience: experience.length > 0,
    skills: skills.length > 0,
    certificates: certificates.length > 0,
    cv: cv !== null,
    contact: Boolean(profile?.email || profile?.socialLinks.length),
  };
}

/** Homepage section contract: each portfolio section renders only with verified content. */
export async function fetchHomeSectionAvailability({
  payload,
  locale,
}: Read): Promise<Record<HomeSectionKey, boolean>> {
  const [profile, featured, routes] = await Promise.all([
    fetchProfile({ payload, locale }),
    fetchProjects({ payload, locale }, { featuredOnly: true }),
    fetchRouteAvailability({ payload, locale }),
  ]);
  return {
    introduction: Boolean(profile?.shortBio),
    selectedWork: featured.length > 0,
    expertise: routes.skills,
    experience: routes.experience,
    credentials: routes.certificates,
    contact: routes.contact,
  };
}
