import type { CollectionAfterChangeHook, CollectionConfig, Field } from 'payload';
import { adminOnly, publishedOrAdmin } from '../access';
import {
  archiveFields,
  deleteOnlyArchived,
  publicStatusField,
  seoGroup,
  slugField,
  sourceNoteField,
  stampArchivedAt,
  translationStatusField,
} from '../fields';
import { auditChange, auditDelete, collectionRevalidate, collectionRevalidateOnDelete } from '../hooks';

/**
 * Editorial collections (CONTENT_MODEL + DASHBOARD_SPEC). Shared lifecycle:
 *   DRAFT → PUBLISHED (Payload drafts/versions) → ARCHIVED (soft, reversible) → delete (only when archived).
 * Public reads: published + not archived (access), and per-locale `translationStatus: approved`
 * (enforced in the content repository). No English fallback (localization.fallback = false).
 */
function editorial(
  slug: string,
  config: Omit<CollectionConfig, 'slug' | 'access' | 'versions' | 'hooks'> & {
    extraAfterChange?: CollectionAfterChangeHook[];
  },
): CollectionConfig {
  const { extraAfterChange = [], fields, ...rest } = config;
  return {
    slug,
    ...rest,
    access: {
      read: publishedOrAdmin,
      create: adminOnly,
      update: adminOnly,
      delete: adminOnly,
      readVersions: adminOnly,
    },
    versions: { drafts: { autosave: false, validate: false }, maxPerDoc: 50 },
    hooks: {
      beforeChange: [({ data, originalDoc }) => stampArchivedAt(data, originalDoc)],
      beforeDelete: [deleteOnlyArchived],
      afterChange: [collectionRevalidate(slug), auditChange(slug), ...extraAfterChange],
      afterDelete: [collectionRevalidateOnDelete(slug), auditDelete(slug)],
    },
    fields: [
      publicStatusField(slug as Parameters<typeof publicStatusField>[0]),
      ...fields,
      translationStatusField(),
      ...archiveFields(),
      sourceNoteField(),
    ],
  };
}

/** Editor-facing labels for stored slug values (values unchanged — no migration). */
const labelled = (values: string[], labels: Record<string, string>) =>
  values.map((value) => ({ value, label: labels[value] ?? value }));

const linksField: Field = {
  name: 'links',
  type: 'array',
  fields: [
    {
      name: 'label',
      type: 'text',
      localized: true,
      required: true,
      admin: { description: 'Link text, per language.' },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      validate: (v: unknown) => isHttpUrl(v) || 'Must be an http(s) URL.',
    },
    {
      name: 'kind',
      type: 'select',
      defaultValue: 'other',
      options: labelled(['repository', 'demo', 'article', 'other'], {
        repository: 'Repository',
        demo: 'Live demo',
        article: 'Article',
        other: 'Other',
      }),
    },
  ],
  admin: {
    description: 'External links (repository, demo, article). Opened in the same tab with rel safety.',
  },
};

function isHttpUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

/** T9: a published slug change leaves a permanent redirect (and flattens redirect chains). */
const redirectOnSlugChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const oldSlug = (previousDoc as { slug?: string } | undefined)?.slug;
  const newSlug = (doc as { slug?: string }).slug;
  const wasPublished = (previousDoc as { _status?: string } | undefined)?._status === 'published';
  if (!oldSlug || !newSlug || oldSlug === newSlug || !wasPublished) return doc;

  const from = `/projects/${oldSlug}`;
  const to = `/projects/${newSlug}`;
  // Point older redirects straight at the new URL (no chains).
  await req.payload.update({
    collection: 'redirects',
    where: { to: { equals: from } },
    data: { to },
    req,
    overrideAccess: true,
  });
  const existing = await req.payload.find({
    collection: 'redirects',
    where: { from: { equals: from } },
    req,
    overrideAccess: true,
    limit: 1,
  });
  if (existing.docs[0]) {
    await req.payload.update({
      collection: 'redirects',
      id: existing.docs[0].id,
      data: { to },
      req,
      overrideAccess: true,
    });
  } else {
    await req.payload.create({
      collection: 'redirects',
      data: { from, to, statusCode: '308' },
      req,
      overrideAccess: true,
    });
  }
  return doc;
};

const PROJECT_CATEGORIES = [
  'artificial-intelligence',
  'machine-learning',
  'computer-vision',
  'robotics',
  'software-engineering',
  'web',
  'mobile',
  'data',
  'other',
];

const CATEGORY_LABELS: Record<string, string> = {
  'artificial-intelligence': 'Artificial intelligence',
  'machine-learning': 'Machine learning',
  'computer-vision': 'Computer vision',
  robotics: 'Robotics',
  'software-engineering': 'Software engineering',
  web: 'Web',
  mobile: 'Mobile',
  data: 'Data',
  other: 'Other',
};

export const Projects = editorial('projects', {
  labels: { singular: 'Project', plural: 'Projects' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    description:
      'Case studies shown on /projects and /projects/<slug>. Each language is public only when its Translation status is Approved.',
    defaultColumns: ['title', 'category', 'featured', 'translationStatus', '_status', 'updatedAt'],
    listSearchableFields: ['title', 'slug', 'summary'],
  },
  defaultSort: 'sortOrder',
  extraAfterChange: [redirectOnSlugChange],
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
      admin: { description: 'Page heading (H1) and list title.' },
    },
    slugField(),
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
      required: true,
      maxLength: 300,
      admin: {
        description: 'One or two sentences under the title and in project lists (max 300 characters).',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Case study',
          description:
            'Each section appears on the project page only when it has text. Leave a section empty rather than inventing content.',
          fields: [
            { name: 'description', label: 'Overview', type: 'richText', localized: true },
            { name: 'problem', label: 'Problem', type: 'richText', localized: true },
            { name: 'solution', label: 'Approach', type: 'richText', localized: true },
            { name: 'architecture', label: 'Architecture', type: 'richText', localized: true },
            {
              name: 'results',
              label: 'Results',
              type: 'richText',
              localized: true,
              admin: { description: 'Verified outcomes only — no estimated or unverifiable metrics.' },
            },
          ],
        },
        {
          label: 'Details',
          description: 'Shown in the details row at the top of the project page.',
          fields: [
            {
              name: 'role',
              type: 'text',
              localized: true,
              admin: { description: 'Your role in this project.' },
            },
            {
              name: 'category',
              type: 'select',
              options: labelled(PROJECT_CATEGORIES, CATEGORY_LABELS),
              admin: { description: 'Used for the Projects filter and to suggest related projects.' },
            },
            {
              name: 'timeline',
              type: 'group',
              admin: { description: 'Month precision. Leave End empty for ongoing work.' },
              fields: [
                { name: 'start', type: 'date', admin: { date: { pickerAppearance: 'monthOnly' } } },
                { name: 'end', type: 'date', admin: { date: { pickerAppearance: 'monthOnly' } } },
              ],
            },
            {
              name: 'technologies',
              type: 'relationship',
              relationTo: 'skills',
              hasMany: true,
              admin: {
                description:
                  'Pick from Skills (or create one here). Each technology links to the Skills page and marks this project as evidence.',
              },
            },
            {
              name: 'experience',
              label: 'Context (experience)',
              type: 'relationship',
              relationTo: 'experience',
              admin: { description: 'Optional: the role/organization this project was done in.' },
            },
            linksField,
          ],
        },
        {
          label: 'Media',
          description:
            'Images come from the Media library (alt text required in each language). The cover is also the social share image.',
          fields: [
            {
              name: 'cover',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Shown at the top of the page and in lists.' },
            },
            {
              name: 'gallery',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: { description: 'Additional images, shown in order in the Media section.' },
            },
            {
              name: 'videoUrl',
              label: 'Video URL',
              type: 'text',
              admin: { description: 'Optional link to a video (http/https).' },
              validate: (v: unknown) => !v || isHttpUrl(v) || 'Must be an http(s) URL.',
            },
          ],
        },
        {
          label: 'SEO',
          description:
            'Search and social titles for this project, per language. Required before publishing a language.',
          fields: [seoGroup()],
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Show in “Selected work” on the homepage (first 6, by sort order).',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
  ],
});

export const Experience = editorial('experience', {
  labels: { singular: 'Experience entry', plural: 'Experience' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    description: 'Roles shown on /experience (newest first), the CV page and the homepage.',
    defaultColumns: ['title', 'organization', 'startDate', 'translationStatus', '_status'],
    listSearchableFields: ['title', 'organization'],
  },
  defaultSort: '-startDate',
  fields: [
    {
      name: 'organization',
      type: 'text',
      required: true,
      admin: { description: 'Proper name — not translated.' },
    },
    { name: 'title', label: 'Role / title', type: 'text', localized: true, required: true },
    { name: 'description', type: 'richText', localized: true },
    {
      name: 'startDate',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'monthOnly' },
        description: 'Leave empty when the start date is not known — no period is then shown (never guess).',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'monthOnly' },
        description: 'Leave empty for a current role (“Present”).',
      },
    },
    { name: 'technologies', type: 'relationship', relationTo: 'skills', hasMany: true },
    linksField,
    {
      name: 'projects',
      type: 'join',
      collection: 'projects',
      on: 'experience',
      admin: { allowCreate: false },
    },
  ],
});

export const Education = editorial('education', {
  labels: { singular: 'Education entry', plural: 'Education' },
  admin: {
    group: 'Content',
    useAsTitle: 'degree',
    description: 'Shown on the About and CV pages (no page of its own).',
    defaultColumns: ['degree', 'institution', 'startDate', 'translationStatus', '_status'],
    listSearchableFields: ['degree', 'institution'],
  },
  defaultSort: '-startDate',
  fields: [
    { name: 'institution', type: 'text', localized: true, required: true },
    { name: 'degree', type: 'text', localized: true, required: true },
    { name: 'field', type: 'text', localized: true },
    { name: 'startDate', type: 'date', admin: { date: { pickerAppearance: 'monthOnly' } } },
    { name: 'endDate', type: 'date', admin: { date: { pickerAppearance: 'monthOnly' } } },
    {
      name: 'datePrecision',
      type: 'select',
      defaultValue: 'month',
      options: [
        { label: 'Month and year', value: 'month' },
        { label: 'Year only', value: 'year' },
      ],
      admin: {
        description: 'Choose “Year only” when only the years are known — the month is then never shown.',
      },
    },
    { name: 'description', type: 'richText', localized: true },
    {
      name: 'document',
      label: 'Supporting document (PDF)',
      type: 'upload',
      relationTo: 'documents',
      admin: { description: 'Optional, e.g. a diploma. Linked from the About page.' },
    },
  ],
});

export const Certificates = editorial('certificates', {
  labels: { singular: 'Certificate', plural: 'Certificates' },
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    description: 'Shown on /certificates (newest first) and the homepage.',
    defaultColumns: ['name', 'issuer', 'issueDate', 'translationStatus', '_status'],
    listSearchableFields: ['name', 'issuer', 'credentialId'],
  },
  defaultSort: '-issueDate',
  fields: [
    {
      name: 'name',
      type: 'text',
      localized: true,
      required: true,
      admin: { description: 'Exact title as printed on the certificate (IL: do not translate blindly).' },
    },
    { name: 'issuer', type: 'text', required: true },
    { name: 'issueDate', type: 'date', admin: { date: { pickerAppearance: 'monthOnly' } } },
    { name: 'credentialId', label: 'Credential ID', type: 'text' },
    {
      name: 'verificationUrl',
      label: 'Verification URL',
      type: 'text',
      admin: { description: 'The issuer’s own verification page, if one exists.' },
      validate: (v: unknown) => !v || isHttpUrl(v) || 'Must be an http(s) URL.',
    },
    { name: 'description', type: 'textarea', localized: true },
    {
      name: 'attachment',
      type: 'upload',
      relationTo: ['media', 'documents'], // image OR PDF (T3)
      admin: {
        description:
          'Certificate image or PDF, if available. Certificates may be published without a file (owner decision, 2026-09-28).',
      },
    },
  ],
});

export const SKILL_CATEGORIES = [
  'ai-ml',
  'programming',
  'backend',
  'frontend',
  'mobile',
  'devops-infrastructure',
  'databases',
  'tools',
  'other',
];

const SKILL_CATEGORY_LABELS: Record<string, string> = {
  'ai-ml': 'AI / ML',
  programming: 'Programming',
  backend: 'Backend',
  frontend: 'Frontend',
  mobile: 'Mobile',
  'devops-infrastructure': 'DevOps / Infrastructure',
  databases: 'Databases',
  tools: 'Tools',
  other: 'Other',
};

export const Skills = editorial('skills', {
  labels: { singular: 'Skill', plural: 'Skills' },
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    description:
      'Grouped by category on /skills. Projects that use a skill appear as its evidence automatically.',
    defaultColumns: ['name', 'category', 'displayOrder', 'translationStatus', '_status'],
    listSearchableFields: ['name'],
  },
  defaultSort: 'displayOrder',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Technology name — not translated (IL). No proficiency percentages (CONTENT_MODEL).',
      },
    },
    {
      name: 'label',
      type: 'text',
      localized: true,
      admin: { description: 'Optional localized display label.' },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: labelled(SKILL_CATEGORIES, SKILL_CATEGORY_LABELS),
    },
    {
      name: 'proficiencyLabel',
      type: 'text',
      localized: true,
      admin: { description: 'Only if the owner explicitly provides one. Never a number/percentage.' },
      validate: (v: unknown) =>
        !v ||
        (typeof v === 'string' && !/\d\s*%|^\s*\d+\s*$/.test(v)) ||
        'Numeric proficiency scores are not allowed.',
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 100,
      admin: { description: 'Lower numbers appear first.' },
    },
    {
      name: 'evidence',
      type: 'join',
      collection: 'projects',
      on: 'technologies',
      admin: { allowCreate: false },
    },
  ],
});

/** Slug-change redirects (T9). Public read (the app resolves them); written by hooks or admins. */
export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: { singular: 'Redirect', plural: 'Redirects' },
  admin: {
    group: 'System',
    useAsTitle: 'from',
    description: 'Created automatically when a published project slug changes. Edit only if needed.',
    defaultColumns: ['from', 'to', 'statusCode', 'updatedAt'],
  },
  access: { read: () => true, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'from', type: 'text', required: true, unique: true, index: true },
    { name: 'to', type: 'text', required: true },
    {
      name: 'statusCode',
      type: 'select',
      defaultValue: '308',
      options: [
        { label: '308 Permanent', value: '308' },
        { label: '307 Temporary', value: '307' },
      ],
    },
  ],
};
