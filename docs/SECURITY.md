# Security Requirements

## Dashboard

The admin dashboard is private and must be treated as a production application.

Required considerations:

- secure authentication
- secure password hashing if password auth is used
- session security
- secure cookies
- brute-force/rate limiting
- authorization
- input validation
- output encoding
- CSRF protection where applicable
- safe file uploads
- MIME/type validation
- file-size limits
- safe filename handling
- malware scanning strategy if appropriate
- content sanitization
- audit logging for important changes

## Secrets

Never commit:
- passwords
- API keys
- private tokens
- production credentials
- private certificates

## Media Uploads

Uploaded files must not automatically become executable content.

Validate:
- extension,
- MIME,
- actual file signature where practical,
- size,
- image dimensions,
- PDF validity.

## Public Content

CMS content may contain user-entered text.

Use safe rendering rules.
Avoid raw HTML unless there is a strong reason and robust sanitization.

## Dependency Security

Before production:
- audit dependencies,
- remove unnecessary packages,
- resolve high-severity issues where practical,
- document exceptions.

## Headers

Evaluate:
- CSP
- HSTS
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- frame protections

Do not deploy a CSP copied blindly from another project. It must be compatible with the actual 3D/media architecture.

## Backup

Document:
- database backup,
- media backup,
- restore procedure,
- retention policy.

## Security Acceptance

The final report must explicitly list:
- known risks,
- mitigations,
- accepted residual risks.
