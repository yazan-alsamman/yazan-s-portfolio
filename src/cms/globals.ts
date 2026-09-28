import type { GlobalConfig } from 'payload';
import { adminOnly } from './access';
import { publicStatusField, seoGroup, sourceNoteField, translationStatusField } from './fields';
import { auditGlobal, globalRevalidate } from './hooks';

/**
 * Globals. Drafts/versions on each; anonymous reads receive the published version only
 * (Local API with `draft: false` / REST without `?draft=true`).
 */

const globalAccess = { read: () => true, update: adminOnly, readVersions: adminOnly, readDrafts: adminOnly };

/**
 * Profile — canonical identity (ADR-017). Replaces the Phase 1 seam `src/config/profile.ts`.
 * Seeded from docs/content/OWNER_PROFILE.md (owner-confirmed facts only).
 * Optional fields stay empty until the owner supplies them — never invented.
 */
export const Profile: GlobalConfig = {
  slug: 'profile',
  label: 'Profile & contact',
  admin: {
    group: 'Site',
    description:
      'Your identity (homepage H1, metadata), biography (About page), portrait, social profiles and public email (Contact page).',
  },
  access: globalAccess,
  versions: { drafts: { autosave: false, validate: false }, max: 50 },
  hooks: { afterChange: [globalRevalidate('profile'), auditGlobal('profile')] },
  fields: [
    publicStatusField('profile'),
    { name: 'name', type: 'text', localized: true, required: true },
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
      admin: { description: 'Professional title (owner-approved per language).' },
    },
    {
      name: 'shortBio',
      type: 'textarea',
      localized: true,
      maxLength: 400,
      admin: { description: 'Homepage introduction and the lead on the About page (max 400 characters).' },
    },
    {
      name: 'longBio',
      label: 'Long biography',
      type: 'richText',
      localized: true,
      admin: { description: 'The About page exists only when this has text in that language.' },
    },
    {
      name: 'portrait',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional. When empty, the About page uses the approved portrait.jpg.' },
    },
    {
      name: 'socialLinks',
      type: 'array',
      admin: { description: 'Owner-confirmed profiles only (used for JSON-LD sameAs).' },
      fields: [
        {
          name: 'network',
          type: 'select',
          required: true,
          options: ['github', 'linkedin', 'instagram', 'other'].map((v) => ({ label: v, value: v })),
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          validate: (v: unknown) => {
            try {
              return ['http:', 'https:'].includes(new URL(String(v)).protocol) || 'Must be an http(s) URL.';
            } catch {
              return 'Must be an http(s) URL.';
            }
          },
        },
      ],
    },
    {
      name: 'email',
      type: 'email',
      admin: { description: 'Public contact email — only if the owner chooses one.' },
    },
    translationStatusField(),
    sourceNoteField(),
  ],
};

/**
 * SEO & sharing (the "Site Settings" global) — site-level SEO defaults (ADR-011, Phase 7, R-48).
 * Everything is optional: empty values fall back to the code defaults (the home title
 * "<name> — <title>" and the reviewed catalog description, both built from the confirmed
 * identity; the generated brand share image). Page-level SEO stays on each page's content.
 * Phase 7 removed the unused "featured projects" list: featured work is the project
 * "Featured" checkbox + sort order (Phase 5).
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'SEO & sharing',
  admin: {
    group: 'Site',
    description:
      'Site-wide search and share defaults. Leave a field empty to keep the built-in default. Page titles and descriptions of projects are edited on each project.',
  },
  access: globalAccess,
  versions: { drafts: { autosave: false, validate: false }, max: 50 },
  hooks: { afterChange: [globalRevalidate('site-settings'), auditGlobal('site-settings')] },
  fields: [
    seoGroup({
      group:
        'Home page in search results and share previews. Used in a language only when its Translation status is Approved.',
      title: 'Empty = “<name> — <title>” from Profile & contact.',
      description:
        'Empty = “Official website of <name>, <title>.” (also the site description in structured data).',
    }),
    {
      name: 'shareImage',
      label: 'Default share image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Shown when a page without its own image is shared (projects use their cover). Landscape, ideally 1200 × 630 or larger, with alt text in each language. Empty = the built-in brand image.',
      },
    },
    translationStatusField(),
  ],
};

/** CV (T5): one PDF per locale, version, visibility; updatedAt is automatic. */
export const CV: GlobalConfig = {
  slug: 'cv',
  label: 'CV',
  admin: {
    group: 'Site',
    description:
      'One PDF per language. The /cv page and footer link exist only when “Download visible” is on.',
  },
  access: globalAccess,
  versions: { drafts: { autosave: false, validate: false }, max: 50 },
  hooks: { afterChange: [globalRevalidate('cv'), auditGlobal('cv')] },
  fields: [
    publicStatusField('cv'),
    {
      name: 'file',
      type: 'upload',
      relationTo: 'documents',
      localized: true,
      admin: { description: 'CV PDF for this language.' },
    },
    {
      name: 'label',
      type: 'text',
      localized: true,
      admin: { description: 'Button text (default: “Download CV”).' },
    },
    { name: 'version', type: 'text', admin: { description: 'e.g. 2026-09. Shown next to the download.' } },
    {
      name: 'downloadVisible',
      label: 'Download visible',
      type: 'checkbox',
      localized: true,
      defaultValue: false,
      admin: { description: 'Per language. Turn on to publish the CV page and download link.' },
    },
    {
      name: 'webCv',
      label: 'Publish the web CV',
      type: 'checkbox',
      localized: true,
      defaultValue: false,
      admin: {
        description:
          'Per language. Publishes the /cv page built from the site’s own content (experience, education, skills, certificates, contact) — with or without a PDF.',
      },
    },
    translationStatusField(),
    sourceNoteField(),
  ],
};
