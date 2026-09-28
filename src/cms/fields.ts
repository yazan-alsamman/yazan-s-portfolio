import type { CollectionBeforeDeleteHook, Field } from 'payload';
import { APIError } from 'payload';
import { adminOnlyField } from './access';

/**
 * Shared field builders. Content policy (CONTENT_MODEL, AGENT_ENGINEERING_RULES):
 * - no fields for data the owner has not supplied (no invented proficiency scores, metrics…);
 * - `sourceNote` records the provenance of every factual entry (R-02 mitigation) and is
 *   readable by admins only (field-level access, T8).
 */

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugField(): Field {
  return {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    localized: false, // IA §1: one slug shared by both locales
    admin: {
      position: 'sidebar',
      description:
        'Lowercase, hyphen-separated (e.g. vision-system). Changing a published slug keeps the old URL working (permanent redirect).',
    },
    validate: (value: unknown) =>
      typeof value === 'string' && SLUG_PATTERN.test(value)
        ? true
        : 'Use lowercase letters, numbers and single hyphens (e.g. "vision-system").',
  };
}

/** Localized SEO fields (T9). Length limits follow common SERP display bounds (SEO_MASTER §8–10). */
export function seoGroup(help: { group?: string; title?: string; description?: string } = {}): Field {
  return {
    name: 'seo',
    type: 'group',
    admin: { description: help.group ?? 'Unique, human-written. Required before publishing in each locale.' },
    fields: [
      {
        name: 'title',
        type: 'text',
        localized: true,
        validate: lengthValidator(10, 70, 'SEO title'),
        ...(help.title ? { admin: { description: help.title } } : {}),
      },
      {
        name: 'description',
        type: 'textarea',
        localized: true,
        validate: lengthValidator(50, 170, 'SEO description'),
        ...(help.description ? { admin: { description: help.description } } : {}),
      },
    ],
  };
}

function lengthValidator(min: number, max: number, label: string) {
  return (value: unknown) => {
    if (value == null || value === '') return true; // completeness is enforced per locale by the publication gate
    if (typeof value !== 'string') return `${label} must be text`;
    const length = value.trim().length;
    if (length < min || length > max)
      return `${label} must be ${min}–${max} characters (currently ${length}).`;
    return true;
  };
}

/**
 * Per-locale translation/review state (Pre-Phase-2 publication gate, T1/T6).
 * Arabic content becomes public ONLY when its locale value is `approved` (by a human reviewer).
 * English is original copy: `approved` means "ready", set by the owner on publish.
 */
export function translationStatusField(): Field {
  return {
    name: 'translationStatus',
    type: 'select',
    localized: true,
    defaultValue: 'draft',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'In review', value: 'in_review' },
      { label: 'Approved', value: 'approved' },
    ],
    admin: {
      position: 'sidebar',
      description: 'Per language. Public pages only show a language when it is Approved.',
    },
  };
}

export function archiveFields(): Field[] {
  return [
    {
      name: 'archived',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Archived items disappear from the public site but keep their history.',
      },
    },
    {
      name: 'archivedAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true, condition: (data) => Boolean(data?.archived) },
    },
  ];
}

export function sourceNoteField(): Field {
  return {
    name: 'sourceNote',
    type: 'textarea',
    access: { read: adminOnlyField, create: adminOnlyField, update: adminOnlyField },
    admin: {
      position: 'sidebar',
      description: 'Where this fact comes from (owner confirmation, certificate file…). Never public.',
    },
  };
}

/** Sets/clears archivedAt when the archived flag changes. */
export function stampArchivedAt(data: Record<string, unknown>, previous?: Record<string, unknown>) {
  if (data.archived && !previous?.archived) data.archivedAt = new Date().toISOString();
  if (data.archived === false) data.archivedAt = null;
  return data;
}

/** DASHBOARD_SPEC "Safety": hard delete only after archiving. */
export const deleteOnlyArchived: CollectionBeforeDeleteHook = async ({ req, id, collection }) => {
  const doc = await req.payload.findByID({
    collection: collection.slug,
    id,
    depth: 0,
    req,
    overrideAccess: true,
    draft: true,
  });
  if (!(doc as { archived?: boolean }).archived) {
    throw new APIError('Archive this item before deleting it permanently.', 400, undefined, true);
  }
};

/**
 * Sidebar panel "On the public site" (Phase 5): per language, live with links or the reasons
 * it is not. A `ui` field — no database column, no migration.
 */
export function publicStatusField(
  target: 'projects' | 'experience' | 'education' | 'certificates' | 'skills' | 'profile' | 'cv',
): Field {
  return {
    name: 'publicStatus',
    type: 'ui',
    admin: {
      position: 'sidebar',
      components: { Field: { path: '/cms/admin/PublicStatus', serverProps: { target } } },
    },
  };
}
