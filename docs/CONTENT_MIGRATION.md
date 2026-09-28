# Legacy Content Migration

## Legacy Source

`https://yazan-alsamman.github.io`

**Owner-confirmed** (Phase 0.1, 2026-09-27) as Yazan Al Samman's personal website. The earlier spec spelling `yazan-alsaman.github.io` (single "m") was a typo; that host returns 404.

"Owner-confirmed site" means the site is his. It does **not** mean every statement on it is correct. Each fact still goes through the verification and cleanup in `docs/content/LEGACY_CONTENT_INVENTORY.md`, and only facts in `docs/content/OWNER_PROFILE.md` count as confirmed identity.

## Important

The legacy site is a **content reference**, not a design reference.

The new project must not copy its visual design, layout or styling.

## Migration Procedure

Claude Code must:

1. Attempt to access the legacy site.
2. If accessible, inventory all pages and public content.
3. Extract factual content.
4. Separate:
   - identity
   - biography
   - education
   - experience
   - skills
   - projects
   - certificates
   - contact
   - links
5. Preserve exact facts.
6. Record uncertain or ambiguous facts.
7. Never silently improve facts.
8. Never invent missing information.
9. Map the verified information into the new content model.
10. Produce a migration inventory.

## If Legacy Site Is Unavailable

Do not fabricate content.

Request or inspect:
- source repository,
- exported HTML,
- screenshots,
- CV,
- certificates,
- project files.

The current public URL may be temporarily unavailable; this is not evidence that its content does not exist.

## Verification Matrix

Create:

`docs/content/LEGACY_CONTENT_INVENTORY.md`

Columns:

| Field | Legacy Source | New Field | Verified | Notes |
|---|---|---|---|---|

Every important public claim should have a source.

## Portrait

The owner will provide a portrait file.

Do not use a web-found image as a substitute.

## External Research

Public search may discover potentially matching profiles or projects, but those must not be assumed to belong to Yazan solely because names match.

Owner-provided source material takes precedence.
