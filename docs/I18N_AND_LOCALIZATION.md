# Internationalization

## Supported Locales

- English: `en`
- Arabic: `ar`

## Requirements

Arabic must be a real localized experience.

Do not:
- translate only navigation,
- mirror English text automatically,
- hardcode Arabic inside components,
- use machine-generated Arabic without review for important professional copy.

## Direction

English:
`dir="ltr"`

Arabic:
`dir="rtl"`

Direction must be applied at the application/document level.

## URL Strategy

Choose one consistent architecture:

Option A:
- `/en/...`
- `/ar/...`

Option B:
- default English at `/`
- Arabic at `/ar/...`

Document the decision before implementation.

## Translation Keys

All reusable UI strings should be centralized.

Suggested namespaces:

- `common`
- `navigation`
- `hero`
- `about`
- `projects`
- `experience`
- `skills`
- `certificates`
- `cv`
- `contact`
- `footer`
- `errors`
- `dashboard`

## Arabic Typography

Verify:
- shaping,
- line height,
- punctuation,
- numerals,
- mixed Arabic/Latin technology names,
- URLs,
- code snippets,
- date formatting.

## Content Model

Professional content should have explicit English and Arabic fields when the content is intended to be localized.

Do not blindly translate proper names, technology names or certificate titles.
