# Admin Dashboard / CMS Specification

## Objective

Create a private dashboard through which Yazan can maintain the portfolio without editing source code.

## Authentication

The dashboard must be protected.

At minimum:
- secure authentication,
- secure password/session handling,
- rate limiting,
- CSRF protection where applicable,
- secure cookies,
- logout/revocation,
- no credentials in source control.

The exact auth architecture must be proposed and documented before implementation.

## Dashboard Areas

### Overview
- content counts
- published/draft counts
- recent changes
- media summary
- system status

### Projects
CRUD:
- title EN
- title AR
- slug
- short description EN/AR
- full description EN/AR
- problem
- solution
- architecture
- technologies
- role
- date
- links
- images
- video
- featured flag
- publication status
- sort order

### Experience
- organization
- role
- start/end dates
- description EN/AR
- technologies
- links
- visibility

### Education
- institution
- degree
- field
- dates
- description
- supporting document

### Certificates
- certificate name
- issuer
- issue date
- credential ID
- verification URL
- image/PDF
- description

### Skills
Categorized skills:
- AI / ML
- Programming
- Backend
- Frontend
- Mobile
- DevOps / Infrastructure
- Databases
- Tools
- Other

### CV
- current CV file
- localized metadata
- download visibility
- version
- updated date

### Media Library
- upload
- preview
- metadata
- alt text EN/AR
- usage tracking
- delete/archive
- optimization status

### Site Settings
- profile identity
- SEO defaults
- social links
- contact information
- locale settings
- featured content
- landing scene configuration where safely configurable

## Publishing Model

Use explicit states:

`DRAFT -> REVIEW -> PUBLISHED -> ARCHIVED`

If review is unnecessary for a single-admin installation, the architecture may simplify to:

`DRAFT -> PUBLISHED -> ARCHIVED`

The decision must be documented.

## Safety

Deleting content should require confirmation.

Prefer soft-delete/archive where practical.

Changes to public content should be auditable.

## Dashboard UX

The dashboard should be:
- fast,
- functional,
- clean,
- desktop-first but responsive,
- keyboard accessible.

Do not make the admin panel visually compete with the public portfolio.

The public site is the cinematic product.
The dashboard is the operational product.
