import { z } from 'zod';

/**
 * Application content contract (Phase 2). Presentation code depends ONLY on these types —
 * never on Payload document shapes (`_status`, locale maps, relationship unions…).
 * Every model is already locale-resolved: a value exists only if it was authored AND approved
 * in that locale. There is no fallback to another language.
 */

const nonEmpty = z.string().trim().min(1);

export const ImageSchema = z.object({
  url: nonEmpty,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string(), // "" only for decorative images (enforced by the CMS)
});
export type ContentImage = z.infer<typeof ImageSchema>;

/**
 * Lexical rich-text JSON (Payload `richText` fields), rendered server-side by
 * `src/components/content/RichText.tsx`. Opaque to the contract; `null` when empty.
 */
export const RichTextSchema = z.unknown().nullable();
export type RichTextValue = z.infer<typeof RichTextSchema>;

export const ProfileSchema = z.object({
  name: nonEmpty,
  title: nonEmpty,
  shortBio: nonEmpty.nullable(),
  longBio: RichTextSchema,
  portrait: ImageSchema.nullable(),
  email: z.email().nullable(),
  socialLinks: z.array(
    z.object({ network: z.enum(['github', 'linkedin', 'instagram', 'other']), url: z.url() }),
  ),
  /** Phase 14: engineering principles (About) — statements of practice, never achievements. */
  principles: z.array(z.object({ title: nonEmpty, body: nonEmpty })).optional(),
});
export type Profile = z.infer<typeof ProfileSchema>;

/**
 * Site-level SEO defaults (Phase 7, ADR-011; the "Site Settings" global — R-48). Optional:
 * text exists only when authored AND approved in this locale; the share image only when it has
 * alt text in this locale. Absent values fall back to the code defaults (reviewed catalog copy
 * built from the confirmed identity, and the generated brand share image).
 */
export const SiteSettingsSchema = z.object({
  homeTitle: nonEmpty.nullable(),
  homeDescription: nonEmpty.nullable(),
  shareImage: ImageSchema.nullable(),
});
export type SiteSettings = z.infer<typeof SiteSettingsSchema>;

export const SkillSchema = z.object({
  id: z.string(),
  name: nonEmpty,
  label: z.string().nullable(),
  category: nonEmpty,
  /** Phase 14: `exploration` = studied / concept systems only — never shown as professional experience. */
  provenance: z.enum(['verified', 'exploration']).optional(),
});
export type Skill = z.infer<typeof SkillSchema>;

export const LinkSchema = z.object({ label: nonEmpty, url: z.url(), kind: z.string() });

export const ProjectSummarySchema = z.object({
  id: z.string(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: nonEmpty,
  summary: nonEmpty,
  category: z.string().nullable(),
  featured: z.boolean(),
  cover: ImageSchema.nullable(),
  technologies: z.array(SkillSchema),
  seo: z.object({ title: nonEmpty, description: nonEmpty }),
  updatedAt: z.string(),
  /**
   * Phase 14 evidence status: `verified` (delivered / public evidence), `concept` (a design study,
   * labelled everywhere, never presented as delivered work), `experimental`. Absent = verified.
   */
  provenance: z.enum(['verified', 'concept', 'experimental']).optional(),
  tier: z.enum(['flagship', 'strong', 'supporting']).optional(),
  /** Drawing motif for projects without imagery (CMS override of the category default). */
  schematic: z.string().nullable().optional(),
  /**
   * Case-file facts derived from the same CMS document (Phase 12). Every value is computed from
   * authored fields — nothing is inferred: `year` only from a stated timeline date, `source` only
   * from a repository link, `sections` only for narrative fields that have content.
   */
  dossier: z
    .object({
      year: z
        .string()
        .regex(/^\d{4}$/)
        .nullable(),
      source: z.boolean(),
      figures: z.number().int().nonnegative(),
      sections: z.array(z.enum(['problem', 'solution', 'architecture', 'intelligence', 'results'])),
    })
    .optional(),
});
export type ProjectSummary = z.infer<typeof ProjectSummarySchema>;
export type ProjectDossier = NonNullable<ProjectSummary['dossier']>;

/** A published, locale-approved project referenced from another entity (evidence, experience). */
export const ProjectRefSchema = z.object({ slug: ProjectSummarySchema.shape.slug, title: nonEmpty });
export type ProjectRef = z.infer<typeof ProjectRefSchema>;

/** ISO date string (Payload `date` field). Rendered with Intl in the page locale. */
const isoDate = z.string().min(1);

export const ProjectSchema = ProjectSummarySchema.extend({
  role: z.string().nullable(),
  links: z.array(LinkSchema),
  timeline: z.object({ start: isoDate.nullable(), end: isoDate.nullable() }),
  gallery: z.array(ImageSchema),
  videoUrl: z.url().nullable(),
  experience: z.object({ organization: nonEmpty, title: nonEmpty }).nullable(),
  /** Lexical rich-text JSON, rendered server-side. Opaque to this contract. */
  body: z.object({
    description: RichTextSchema,
    problem: RichTextSchema,
    solution: RichTextSchema,
    architecture: RichTextSchema,
    results: RichTextSchema,
    constraints: RichTextSchema.optional(),
    intelligence: RichTextSchema.optional(),
    decisions: RichTextSchema.optional(),
    challenges: RichTextSchema.optional(),
  }),
});
export type Project = z.infer<typeof ProjectSchema>;

export const ExperienceSchema = z.object({
  id: z.string(),
  organization: nonEmpty,
  title: nonEmpty,
  description: RichTextSchema,
  /** Null when the owner has not stated a start date (no period is displayed). */
  startDate: isoDate.nullable(),
  endDate: isoDate.nullable(),
  technologies: z.array(SkillSchema),
  links: z.array(LinkSchema),
  projects: z.array(ProjectRefSchema),
});
export type Experience = z.infer<typeof ExperienceSchema>;

export const EducationSchema = z.object({
  id: z.string(),
  institution: nonEmpty,
  degree: nonEmpty,
  field: z.string().nullable(),
  startDate: isoDate.nullable(),
  endDate: isoDate.nullable(),
  /** "year" when only the years are known (the month is never displayed). */
  datePrecision: z.enum(['month', 'year']),
  description: RichTextSchema,
  document: z.object({ url: nonEmpty, title: z.string().nullable() }).nullable(),
});
export type Education = z.infer<typeof EducationSchema>;

export const CertificateSchema = z.object({
  id: z.string(),
  name: nonEmpty,
  issuer: nonEmpty,
  issueDate: isoDate.nullable(),
  credentialId: z.string().nullable(),
  verificationUrl: z.url().nullable(),
  description: z.string().nullable(),
  /** The certificate itself: an image (shown) or a PDF (linked). */
  attachment: z
    .discriminatedUnion('kind', [
      z.object({ kind: z.literal('image'), image: ImageSchema }),
      z.object({ kind: z.literal('pdf'), url: nonEmpty }),
    ])
    .nullable(),
});
export type Certificate = z.infer<typeof CertificateSchema>;

export const SkillDetailSchema = SkillSchema.extend({
  proficiencyLabel: z.string().nullable(),
  evidence: z.array(ProjectRefSchema),
});
export type SkillDetail = z.infer<typeof SkillDetailSchema>;

/**
 * Public routes that exist only when verified content exists (IA §0: a page whose data set is
 * empty is not published and appears in no navigation or sitemap — SEO-05, no thin pages).
 */
export type ContentRouteKey =
  'about' | 'projects' | 'experience' | 'skills' | 'certificates' | 'cv' | 'contact';
export type RouteAvailability = Record<ContentRouteKey, boolean>;

export const CvSchema = z.object({
  /** The PDF, when one is published; null for a web-only CV. */
  url: nonEmpty.nullable(),
  label: z.string().nullable(),
  version: z.string().nullable(),
  updatedAt: z.string(),
});
export type Cv = z.infer<typeof CvSchema>;

/** Homepage section contract (Phase 1 `src/config/home.ts` seam, now data-driven). */
export type HomeSectionKey =
  'introduction' | 'selectedWork' | 'expertise' | 'experience' | 'credentials' | 'contact';
export const homeSectionOrder: readonly HomeSectionKey[] = [
  'introduction',
  'selectedWork',
  'expertise',
  'experience',
  'credentials',
  'contact',
];
