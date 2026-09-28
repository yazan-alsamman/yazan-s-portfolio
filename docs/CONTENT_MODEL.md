# Content Model

## Source of Truth

All public-facing factual content must have one identifiable source of truth.

Do not duplicate the same fact in multiple hardcoded components.

## Entities

### Profile
- name
- professional title
- short bio
- long bio
- portrait
- location (only if explicitly supplied)
- social links
- contact links

### Project
- id
- slug
- title_en
- title_ar
- summary_en
- summary_ar
- description_en
- description_ar
- technologies[]
- category
- role
- timeline
- links[]
- media[]
- featured
- status
- sort_order
- created_at
- updated_at

### Experience
- organization
- title
- description_en
- description_ar
- start_date
- end_date
- technologies[]
- links[]

### Certificate
- name_en
- name_ar
- issuer
- date
- credential_id
- verification_url
- media

### Skill
- name
- category
- proficiency_label if explicitly provided
- evidence/projects[]
- display_order

Do not create fake proficiency percentages.

### CV
- file
- locale
- version
- updated_at

### SiteSettings
- SEO defaults
- social profiles
- contact
- navigation
- feature flags

## Content Integrity

If information cannot be verified:

- mark it as missing,
- ask for source material,
- do not invent it.

This rule is absolute.
