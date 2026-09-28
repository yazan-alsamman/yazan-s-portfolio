# Phase 1 Report

## 1. Phase

**Phase:** 1 — Brand, Design System & Application Foundation
**Date:** 2026-09-27
**Status:** COMPLETE WITH KNOWN LIMITATIONS

## 2. Objective

Build the application foundation and design system: tokens, typography, responsive system, EN/AR + RTL foundation, public shell (header, navigation, mobile menu, footer), primitives, accessibility, SEO and motion foundations, and quality gates. Out of scope: CMS, dashboard, 3D and final content.

## 3. Starting State

- Repository root verified: `git rev-parse --show-toplevel` = the project root (not `C:/Users/Lenovo`). The parent repository was not touched.
- `git status`: the Phase 0.1 documentation diff was still **uncommitted** (owner review pending). Per instruction, **no commits were made in this phase**. Everything below is also uncommitted, and nothing was staged.
- No application code existed.

## Implementation Summary

- **App:** Next.js 16.3.6 (App Router, React 19.3, Turbopack), TypeScript strict, pnpm 11. Home and design-system pages are statically generated in both locales, with standalone output for the VPS.
- **i18n:** next-intl 4.14. English at `/`, Arabic at `/ar`; `lang`/`dir` set on `<html>`. There is no locale detection, cookie or English fallback.
  - The Arabic catalog is type-checked against the English shape.
  - In production, an incomplete locale is not served at all.
- **Design tokens:** a single CSS token layer mapped into Tailwind v4 (`@theme`). Tailwind's default palette, fonts, shadows and breakpoints are removed, so only tokens are usable.
- **Typography:** self-hosted Space Grotesk, Inter and IBM Plex Sans Arabic from committed `.woff2` files. Script-aware line-height and tracking; Arabic never gets letter-spacing or uppercase.
- **Shell:**
  - sticky header whose scrolled state is pure CSS
  - desktop navigation
  - language switcher (same page, other language)
  - dark/light toggle
  - full-screen mobile menu on native `<dialog>`
  - skip link
  - full crawlable footer
  - localized 404
- **Primitives:** Container, Stack, Section, Heading, Text, Label, Button, ButtonLink, TextLink, IconButton, Divider (plain and "measured"), Surface, Card, Tag, MediaFrame, plus inline SVG icons.
- **SEO foundation:**
  - `buildPageMetadata`: title, description, canonical, hreflang, Open Graph, Twitter and robots
  - environment-gated `robots.ts`, `sitemap.ts`
  - Person + WebSite JSON-LD from confirmed fields only
  - home H1 contract; `/en` → 308
- **Home page:** the semantic contract, with an identity H1 and five ordered content sections plus a call to action. Sections render only with verified content. In development they appear as a clearly marked "pending owner input" panel.
- **Internal `/design-system` preview** (both locales) for visual QA. It is `noindex` and disabled in production.
- **Quality gates:** ESLint with a custom **RTL rule that bans physical-direction utilities**, Prettier, Vitest (21 tests), Playwright + axe (64 tests across 2 projects), and env validation that fails the build on bad config.

Not built, by design: Payload/CMS, dashboard, three.js/R3F, the cinematic scene, portrait treatment, legacy content migration, final page content.

## 21st.dev Usage

**Access method.** The 21st MCP server was configured mid-session, so its tools were **not loaded** into this Claude Code session (MCP tools load at startup). I called the same server directly over its HTTP MCP endpoint with the owner's configured key, read from `~/.claude.json` and never printed. Only read-only tools were used: `get_usage`, `search`, `get_component`. **No account-mutating tools were called** (no bookmarks, no publishing).

**Constraint found:** free tier, **2 component-code retrievals per day** (R-30). Both were spent on the highest-value patterns after comparing free preview images.

**Note:** the brief says a "21st.dev skill" is installed. The only installed skill is **ui-ux-pro-max** (installed earlier from `nextlevelbuilder/ui-ux-pro-max-skill`); 21st.dev exists here only as the MCP server. ui-ux-pro-max was also consulted (see below).

| # | Component / pattern | Source | Adaptation | New dependency | Reason |
|---|---|---|---|---|---|
| 1 | **Immersive Full Screen Navigation** | 21st.dev, author *hyperiux*, id 27229 (code retrieved) | **Kept:** clip-path wipe reveal, oversized editorial link type, staggered entrance, brand/footer composition. **Removed:** GSAP (→ CSS transitions + `@starting-style`), the hand-rolled focus trap (→ native `<dialog>.showModal()`: focus containment, Esc, focus return, inert background), stock images, social icons with `#` links, invented location/tagline. **Changed:** wipe starts from the inline-end edge so it mirrors in RTL; the per-character hover split became a whole-label roll (character splitting breaks Arabic letter shaping); `01–08` index numerals added as the precision motif; tokens instead of hard-coded colors. | **None** (the original needed `gsap`) | Its editorial, typographic character fits "premium, architectural, quietly futuristic" and avoids the SaaS drawer look. It is now `src/components/shell/MobileMenu.tsx` + `.menu-dialog` / `.text-roll` in `globals.css`. |
| 2 | **Header 1** (sticky header with scroll blur) | 21st.dev, author *efferd*, id 8964 (code retrieved) | **Kept:** the transparent-to-solid-on-scroll pattern and hairline border. **Removed:** the JS `useScroll` hook and re-render (→ CSS scroll-driven `animation-timeline: scroll()` with a static fallback), shadcn `Button`/`buttonVariants`, the third-party SVG wordmark, "Sign in / Get started" SaaS CTAs, the portal drop-down mobile menu (replaced by #1). | **None** (the original needed shadcn button, `menu-toggle-icon`, `use-scroll`) | A premium sticky header with zero client JS. It is now `.site-header` in `globals.css` + `SiteHeader.tsx`. |
| 3 | Animated underline link (pattern only) | 21st.dev search metadata ("Text Underline", *soralabs*, id 19261: "CSS-only underline"). **Code not retrieved** (quota) | Written from scratch: a background-size underline that grows from the inline-start edge and mirrors via `:dir(rtl)`. | None | Restrained link affordance for nav and footer. `.link-underline`. |

Explored but not used (metadata/preview only): Floating Header, Classic Header with Sheet Menu, Language Selector Dropdown (flag-based; flags are inappropriate for languages), several "premium" glow/highlight buttons (they conflict with the brand's "no neon/glow" rule).

**ui-ux-pro-max** (installed skill, local search): consulted for Next.js font loading (use `next/font`, which was applied), focus appearance (≥2 px, 3:1, which was applied), sticky headers obscuring content (applied `scroll-padding-block-start`) and reduced motion (applied). Its "deploy to Vercel" suggestion was ignored (owner chose VPS).

## Design System

### Tokens (`src/app/globals.css`)
- **Raw brand palette:** all BRAND_IDENTITY values, **unchanged**, defined once as `--brand-*`.
- **Semantic roles**, dark (default) and light: `bg`, `bg-raised`, `surface`, `fg`, `fg-strong`, `fg-muted`, `line`, `line-strong`, `accent`, `accent-text`, `on-accent`, `accent-2`, `link`, `success`, `warning`, `focus`. Components use only these (Tailwind default colors are removed).
- **Refinements** (no brand hex changed; reasons measured):

| Token | Value | Why |
|---|---|---|
| Light `--accent-text` / `--link` | `#007992` | Brand Accent `#007F9A` is **4.35:1** on the light background (below WCAG AA 4.5:1 for body text). `#007992` is **4.71:1**, same hue. `#007F9A` is kept for fills and focus rings. |
| `--line-strong` (dark) | `#636B75` | Steel `#2A313B` is 1.52:1, fine for decorative hairlines but not for component boundaries (WCAG 1.4.11 needs 3:1). The new value is 3.69:1 on the background and 3.17:1 on surfaces. |
| `--line-strong` (light) | `#858D97` | 3.13:1 on the light background. |
| Light `--line`, `--success`, `--warning` | `#D5DBE3`, `#0F7A52`, `#8A5A00` | Not defined in the brand doc; derived for the light mode. |

- **Measured dark contrasts:** Cloud on Obsidian 16.9:1 · Mist 10.9:1 · Cyan 13.6:1 · Signal Blue 7.5:1 · Violet 6.1:1. Light: Text 17.1:1 · Muted 5.3:1.
- **Spacing:** 4 px base (`--spacing: 0.25rem`); fluid `--gutter`.
- **Radii:** 8 / 14 / 24 / 32 px (DESIGN_SYSTEM).
- **Shadows:** `raised`, `overlay`.
- **Borders:** hairline `line`, boundary `line-strong`.
- **Motion:** easing `standard`, `emphasized`, `exit`; durations 100–900 ms.
- **Z-layers:** base, raised, header, menu, skip-link.
- **Breakpoints:** `xs` 360 · `sm` 576 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1600.
- **Content widths:** page 90 rem, prose 42 rem.

### Typography
- **Display/labels:** Space Grotesk (variable 300–700). **Body:** Inter (variable). **Arabic:** IBM Plex Sans Arabic 400–700. All self-hosted from Fontsource 5.3.0 (OFL, licenses in `src/fonts/`).
- **Fluid scale:**
  - display `clamp(2.75rem → 7.25rem)`
  - h1 `2.25 → 4.5rem`
  - h2 `1.75 → 3rem`
  - h3 `1.31 → 1.75rem`
  - lead `1.125 → 1.375rem`
  - body 1rem, small 0.875rem, label/xs 0.75rem, nav 0.875rem, menu `2 → 3.25rem`
- **Latin:** display leading 0.98 with −0.035em tracking; labels uppercase with +0.16em tracking.
- **Arabic** (`:lang(ar)`): display leading 1.3, body 1.9; **tracking 0 and no uppercase**, because tracking breaks cursive joining. Plex Arabic comes first in the stack. Space Grotesk has no Arabic glyphs.

### Components
Primitives are listed in the Implementation Summary. Each one:
- uses semantic HTML
- has a minimum 44 px target where interactive
- shows the global `:focus-visible` ring (2 px, 3:1+)
- uses logical properties for RTL
- respects reduced motion

The `Card` uses a single stretched link (one tab stop). `IconButton` requires an accessible name at the type level. `MediaFrame` requires `alt` and `sizes` and reserves its aspect ratio (no layout shift).

**Brand signature details:** the "measured" rule (a hairline with precision end-ticks), index numerals (`01 —`), the architectural 4/8/12 column guides behind the identity block, and the single cyan signal dot in the wordmark. The "YA" monogram is **not rendered** (owner decision pending).

### Dark / light modes
Dark is the default and primary expression; light is opt-in via the toggle, persisted and applied before paint (ADR-018). Both share type, geometry, spacing and motion; only color roles change. Both were verified visually and with axe.

### Responsive behavior
- **< 360 px:** menu button is icon-only (label kept for screen readers); tighter wordmark tracking below 576 px.
- **< 1024 px:** full-screen menu replaces the desktop nav; the language switcher moves into the menu below 768 px.
- **Grid guides:** 4 → 8 → 12 columns.
- **Layout:** the footer grid collapses to one column; the header height is fixed (4.5 rem) with anchors offset.
- **Verified:** no horizontal overflow at 320, 375, 430, 768, 1024, 1440 and 1920 px on all four routes (EN/AR × home/design-system), including 320 px with web fonts blocked.

## Internationalization

- **English:** `/`, `lang="en" dir="ltr"`, publishable.
- **Arabic:** `/ar`, `lang="ar" dir="rtl"`. **Not publishable yet**, because the Arabic professional title is pending (`profile.title.ar = null`). It is not machine-translated. The Arabic H1 shows `يزن السمان` plus a visible `TODO: OWNER INPUT REQUIRED` marker in development.
  - While unpublishable, Arabic is `noindex`, left out of hreflang and the sitemap, and **returns 404 in production**.
  - The JSON-LD on Arabic pages **omits `jobTitle`** rather than falling back to English.
- **Routing:** next-intl proxy (`src/proxy.ts`) with prefix-only resolution. `/en*` → 308 to the unprefixed URL. No Accept-Language detection, no locale cookie.
- **RTL:**
  - document-level `dir`
  - logical CSS everywhere, enforced by lint (the rule was proven to flag `ml-`, `text-left`, `pr-`, `rounded-l-`, `left-` and pass `ms-`, `ps-`, `start-`, `text-start`)
  - arrows mirrored with `rtl:-scale-x-100`
  - menu wipe and underline origin mirror via `:dir(rtl)`
- **Language switching:** links to the same path in the other locale, with `lang` and `hreflang` on each option. Screen readers get the language name in its own language.
- **Strings:** centralized in `messages/{en,ar}.json`, with namespaces meta, a11y, nav, language, home, footer, errors, designSystem. No Arabic is hard-coded in components; identity comes only from `src/config/profile.ts` (ADR-017).
- **Arabic copy status:** the UI labels were written by me and **need review by the owner's Arabic reviewer** (R-29). Punctuation is locale-correct (for example `،` in the Arabic wordmark label).

## SEO Audit

### Indexability
**PASS** (foundation). Production allows `/` and disallows `/admin`, `/api` and the design-system routes. Non-production sends `Disallow: /` plus `X-Robots-Tag: noindex, nofollow` on all responses, so previews are never indexed. Public pages are `index, follow` only when `SITE_ENV=production` **and** the locale is publishable. There is no global noindex in production.

### Metadata
**PASS** (foundation). There is a unique title and description per page via `buildPageMetadata`. The home title is `Yazan Al Samman — Artificial Intelligence Engineer`, with the description `Official website of Yazan Al Samman, Artificial Intelligence Engineer.` built from confirmed facts only. Titles follow the "topic — name" template (SEO_MASTER §9). Open Graph and Twitter basics are present; the **default share image is deferred to Phase 7**.

### Canonicals
**PASS.** Canonicals are self-referencing, absolute and taken from `SITE_URL` (validated: https in production, no trailing slash). Paths are lowercase with no query strings, and `/en` → 308. Verified in rendered HTML and by unit tests.

### Internal Linking
**PARTIAL** (by design). The footer lists every route and is crawlable. Planned routes are linked **only outside production**, since no production link may point at a page without content. Most routes do not exist yet (Phase 4).

### Structured Data
**PASS** (scope-limited). `Person` + `WebSite` with confirmed name, url and jobTitle only. There is no `alternateName` (owner decision), `sameAs`, `image`, employer, education or location. JSON-LD is escaped against script injection. Not yet validated with Google's Rich Results tool (that needs a public URL).

### International SEO
**PARTIAL.** `lang`, `dir`, hreflang, x-default and locale-aware Open Graph are implemented and tested. Arabic is intentionally not indexable until the Arabic title and Arabic copy review exist.

### Performance
**PARTIAL** (measured locally; not Core Web Vitals). See the Performance section. The LCP element is the HTML H1; CLS is 0.

### Accessibility
**PASS** for the automated axe scope (WCAG 2.0/2.1/2.2 A/AA rules) on all tested pages, themes and locales, plus keyboard checks. Not a full WCAG audit.

### SEO Issues
- No default OG image yet (Phase 7).
- The sitemap and canonicals in local builds use `http://localhost:3000` (the default `SITE_URL`). This is correct behavior; production builds must set `SITE_URL=https://yazanalsamman.com` and `SITE_ENV=production`, and validation enforces it.

### SEO Risks
R-06/R-07 (future 3D), R-21 (entity spelling vs domain; `alternateName` pending), R-31 (Arabic font swap on the LCP heading).

### Required Follow-up
Phase 4: route SEO for each new page. Phase 7: OG images, Arabic metadata after the title, Rich Results validation, per-locale font preload.

## Accessibility

What was actually tested:
- **axe-core** (via `@axe-core/playwright`, tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`): `/`, `/ar`, `/design-system`, `/ar/design-system` × dark and light × desktop (1440) and mobile (Pixel 7). That is **16 page-states with 0 violations**.
- **Keyboard (automated):**
  - the skip link is the first tab stop, visible, and moves to `#main`
  - the mobile menu opens with focus inside the dialog, Esc closes it, focus returns to the trigger and `aria-expanded` updates (EN and AR)
  - the language switch works by keyboard/click and flips `dir`
  - the theme toggle persists
- **Tab order recorded** (EN and AR desktop): skip link → wordmark → 6 nav links → language → theme toggle → footer links. **Every stop has a 2 px solid outline.**
- **Landmarks:** one `header`, `main` and `footer`; one navigation landmark per purpose (duplicate "Language" landmarks were found and fixed by making secondary switchers labelled groups).
- **Contrast:** computed for all token pairs (see Design System).
- **Reduced motion:** verified that transitions collapse to about 0.01 ms under `prefers-reduced-motion: reduce`. Scroll-reveal and menu stagger are disabled.
- **Not tested:** a real screen reader (NVDA, VoiceOver), 200%/400% zoom, Windows high-contrast mode. **No claim of full WCAG compliance.**

## Performance

Local production build (`next start`, localhost, **no network/CPU throttling**: lab data, not field Core Web Vitals):

| Page | JS transferred (gzip) | CSS | Fonts | HTML | LCP element | LCP | CLS |
|---|---|---|---|---|---|---|---|
| `/` 1440 px | 158.7 KB (9 files) | 8.7 KB | 114.3 KB | 8.0 KB | H1 text | 240 ms | 0 |
| `/` 375 px | 158.7 KB | 8.7 KB | 114.3 KB | 8.0 KB | H1 text | 80 ms | 0 |
| `/ar` 1440 px | 158.7 KB | 8.7 KB | 205.9 KB | 8.4 KB | H1 text | 116 ms | 0.0002 |

- **JS is within the ADR-015 budget** (≤ 170 KB gzip on the critical path). It's mostly the React/Next runtime; the app's own client islands are small.
- English pages also fetch one Arabic font file (~43 KB) because the switcher label "العربية" renders Arabic glyphs; this is expected. Arabic pages load four Plex weights, with no preload (R-31).
- Not measured: Lighthouse and throttled mobile runs (planned for Phase 8), and deployed TTFB.

## 10. Tests

### Install
`pnpm install --frozen-lockfile --offline` → **exit 0**. The first online install **failed** (registry timeouts on `playwright-core` and `typescript-eslint` metadata; slow network). It was retried with longer timeouts and succeeded. pnpm 11 blocked three install scripts; they are denied on purpose in `pnpm-workspace.yaml`, and all tooling was verified working without them.

### Lint
`pnpm lint` (ESLint 9.39.5 + eslint-config-next core-web-vitals + typescript + custom RTL rule) → **exit 0, 0 problems.** Earlier runs caught and fixed a raw `<a>` for internal navigation and two `any` types.

### Format
`pnpm format:check` → **"All matched files use Prettier code style!"**

### Typecheck
`pnpm typecheck` (`tsc --noEmit`, strict + `noUncheckedIndexedAccess`) → **exit 0.**

### Unit
`pnpm test` (Vitest 5.0.2) → **3 files, 21 tests passed.** Coverage:
- env validation (production https, trailing slash, preview flag)
- URL, canonical and hreflang generation
- structured-data rules (no alternateName or sameAs, no English jobTitle on Arabic)
- EN/AR key parity and no silently identical strings
- placeholder and publishability rules
- production navigation limited to live routes
- a repository-wide scan for non-canonical name spellings

### E2E
`pnpm test:e2e` (Playwright 1.63 + axe, local Chrome, desktop and mobile projects) → **64 tests.**
- The final six fresh-build runs gave **5 × 64/64 passed and 1 run with 1 failure** (the first of the six) that could not be captured. It was not reproduced in the 5 runs that followed, 3 of them with retries enabled.
- Earlier intermittent failures **were** identified: the 320 px overflow test failing before web fonts loaded. That was a **real bug**: with fallback fonts the English header overflowed by 15 px. It was fixed in the layout and covered by a new fonts-blocked regression test.
- The remaining intermittent failure is tracked as R-28; CI now retries once so the next occurrence is named.
- 30 further entries are skipped by design (the viewport and font matrix runs only on desktop; the menu tests only on mobile).

### Production Build
`pnpm build` (Next 16.3.6, Turbopack) → **exit 0.** Static: `/en`, `/ar`, `/en/design-system`, `/ar/design-system`, `robots.txt`, `sitemap.xml`, `icon.svg`, `_not-found`. Dynamic: the catch-all 404 and the proxy.

### Visual QA
Real rendered screenshots were captured and reviewed (not only code review). They are stored in the session scratchpad (not committed); the report describes the findings.
- Home at 1440 and 1920 (EN dark and light, AR dark), 768, 375 (EN, AR), 320, 360.
- Open mobile menu at 430 (EN, AR).
- Design-system at 1440 (EN light, AR dark) and 375 (AR light).
- Scrolled header and the Arabic 404.

Issues found and fixed during QA:
- the Arabic H1 placeholder stretched to full width
- the mobile menu panel showed "Site menu" instead of the name
- 15 px overflow at 320 px
- duplicate language landmarks
- an Arabic accessible name using a Latin comma

**Console:** no errors or warnings on any page. The one logged 404 is the intentional 404 test page's own status.

## 11. Files Created

```text
.env.example
.prettierignore
.prettierrc.json
eslint.config.mjs
next.config.ts
package.json
playwright.config.ts
pnpm-lock.yaml
pnpm-workspace.yaml
postcss.config.mjs
tsconfig.json
vitest.config.mts
messages/en.json
messages/ar.json
src/proxy.ts
src/app/layout.tsx
src/app/not-found.tsx
src/app/globals.css
src/app/fonts.ts
src/app/icon.svg
src/app/robots.ts
src/app/sitemap.ts
src/app/[locale]/layout.tsx
src/app/[locale]/page.tsx
src/app/[locale]/not-found.tsx
src/app/[locale]/[...rest]/page.tsx
src/app/[locale]/design-system/page.tsx
src/components/icons.tsx
src/components/ui/actions.tsx
src/components/ui/layout.tsx
src/components/ui/media.tsx
src/components/ui/surfaces.tsx
src/components/ui/typography.tsx
src/components/shell/DevPlaceholder.tsx
src/components/shell/GridLines.tsx
src/components/shell/HeaderNav.tsx
src/components/shell/LanguageSwitcher.tsx
src/components/shell/MobileMenu.tsx
src/components/shell/SiteFooter.tsx
src/components/shell/SiteHeader.tsx
src/components/shell/SkipLink.tsx
src/components/shell/ThemeToggle.tsx
src/components/shell/Wordmark.tsx
src/config/home.ts
src/config/media.ts
src/config/navigation.ts
src/config/profile.ts
src/fonts/*.woff2 (6 files) + LICENSE-*.txt (3 files)
src/i18n/messages.ts
src/i18n/navigation.ts
src/i18n/request.ts
src/i18n/routing.ts
src/lib/cn.ts
src/lib/env.ts
src/lib/i18n/available.ts
src/lib/i18n/publishability.ts
src/lib/seo/metadata.ts
src/lib/seo/structured-data.ts
src/lib/seo/urls.ts
tests/unit/env.test.ts
tests/unit/i18n.test.ts
tests/unit/seo.test.ts
tests/e2e/shell.spec.ts
docs/reports/PHASE_1_REPORT.md
```

## 12. Files Modified

```text
docs/architecture/ARCHITECTURE_DECISIONS.md   ADR-018, ADR-019, Phase 1 amendments table
docs/architecture/RISK_REGISTER.md            R-27 … R-31
docs/architecture/INFORMATION_ARCHITECTURE.md internal /design-system route; revision line
```

`portrait.jpg` is **unchanged** (SHA-256 `1c00fa07…3fca` verified). It was not imported, resized or displayed. `src/config/media.ts` records its metadata and the slot for the high-resolution original. No derivatives were generated.

## 13. Architecture Decisions

See `docs/architecture/ARCHITECTURE_DECISIONS.md`. Summary of Phase 1 changes:

| Decision | Reason | Alternatives | Consequences |
|---|---|---|---|
| **TypeScript 6.0.3 / ESLint 9.39.5** instead of the latest (7.0.2 / 10.x) | typescript-eslint supports `<6.1`; the React, import and a11y plugins support ESLint ≤ 9 | Latest versions (broken lint toolchain) | Upgrade later when the tooling catches up |
| **Self-hosted fonts from committed files** via `next/font/local` | No build- or run-time network dependency; deterministic VPS builds | `next/font/google` (fetches from Google at build time) | ~420 KB of font files in the repo; Arabic not preloaded (R-31) |
| **Dark default, light opt-in, persisted before paint** (ADR-018) | Dark-first brand; keeps static generation | System preference; server cookie | Inline script needs a CSP hash (R-27) |
| **Unpublishable locale → 404 in production** | ADR-006 "no silent fallback" made enforceable | Serve with noindex | Arabic launches automatically once its title and copy are complete |
| **`/en` → 308 via `next.config` redirects** | next-intl issues 307 | Accept 307 | Duplicate URL consolidated permanently |
| **Development preview surfaces** (ADR-019) | Visual QA without fake content | Fake sample pages (forbidden) | Must stay disabled in production (enforced by env validation) |
| **CSS-only motion; no GSAP/motion library** | Performance, dependency policy | GSAP (the 21st component used it) | 0 KB motion JS |
| **Native `<dialog>` for the menu** | Native focus trap, Esc, inert and focus return | Custom trap (21st original) | Less code, fewer a11y bugs |

## 14. Content Verification

Factual content introduced: only OWNER_PROFILE facts, namely the name (EN/AR), the title (EN) and the domain. Everything else on the pages is UI chrome or labelled sample text on the internal preview. No biography, projects, skills, experience, certificates, social links, email or phone were added. The Arabic title is a visible `TODO: OWNER INPUT REQUIRED` marker in development and absent in production.

## 15. Security

- Secret scan of the working tree: clean. `.env*` is ignored; only `.env.example` (no secrets) was added.
- Env validation fails the build on insecure production config (http URL, preview enabled).
- No `dangerouslySetInnerHTML` with user data: only the static theme script and escaped JSON-LD built from constants.
- External links use `rel="noopener noreferrer"`. `poweredByHeader: false`.
- Dependency audit was not run in this phase (Phase 9). pnpm install scripts: 3 denied deliberately.
- The 21st.dev API key was read from local config for HTTP calls and never printed or written to the repo.

## 16. Known Issues

1. **Intermittent e2e failure** (1 in 6 fresh-build runs, test not captured). R-28; CI retry + trace configured.
2. **Arabic is incomplete:** title pending; UI strings unreviewed (R-29). Arabic is noindex locally and 404 in production until complete.
3. **Planned routes 404 in development** (they are listed in the dev navigation by design; hidden in production).
4. **No default OG image and no favicon identity:** `icon.svg` is a neutral provisional mark, not a logo.
5. **`next start` warns under `output: standalone`.** Production must use `node .next/standalone/server.js` with static assets copied (Phase 9/10 runbook).
6. **Arabic font not preloaded** (R-31).
7. **Performance measured only locally without throttling;** no Lighthouse/CWV yet.
8. **No screen-reader, zoom or high-contrast testing yet.**
9. **21st.dev MCP tools not loaded in-session** (needs a Claude Code restart); daily retrieval quota of 2.
10. **Nothing committed:** the Phase 0.1 diff and all Phase 1 files await owner review and commit.

## 17. Risks

New: R-27 CSP vs inline scripts · R-28 intermittent e2e · R-29 unreviewed Arabic UI strings · R-30 21st.dev quota · R-31 Arabic font swap. Existing high risks unchanged: R-02, R-05 content, R-04 portrait resolution, R-22 title vs AI evidence, R-23 VPS operations.

## 18. Assumptions

1. Dark-by-default (not following the OS preference) is acceptable for the brand. It's reversible (ADR-018).
2. The Arabic UI labels I wrote are acceptable as working copy until reviewed.
3. Header navigation shows six items (Projects, About, Experience, Certificates, CV, Contact); Skills and Home appear in the menu and footer (IA §3).
4. The neutral favicon is acceptable until a brand mark decision is made.

## Owner Decisions Required

| ID | Decision | Status |
|---|---|---|
| D-6 | **Arabic professional title** (official wording, not machine-translated) | Pending. Blocks Arabic publication only |
| D-7 | **`Person.alternateName`** ("Yazan Alsamman", matching the domain) | Pending |
| D-8 | **"YA" monogram**: keep, change or drop (currently not rendered; the favicon is neutral) | Pending |
| D-5 | **High-resolution portrait original** (≥ 2400 px long edge, same shoot) | Pending. Needed before Phase 3 |
| D-1 | Review and **commit** the Phase 0.1 + Phase 1 changes (nothing committed by the agent) | Pending |
| D-2 | GitHub remote (`gh` not installed; owner must authenticate) | Pending |
| D-9 (new) | **Arabic reviewer** for `messages/ar.json` (M-11) | Pending |
| D-10 (new) | Confirm **dark-by-default** (not following the OS light setting) | Recommended: confirm |
| D-11 (new) | Restart Claude Code so the 21st MCP tools load natively, and decide whether the free quota (2/day) is sufficient | Optional |

## Next Phase Readiness

**READY FOR PHASE 2**

- **Ready:** the application foundation, i18n routing, token system, shell, primitives, SEO utilities (metadata/canonical/hreflang/sitemap/robots/JSON-LD), env validation, and the lint/type/unit/e2e/build gates. The profile config (`src/config/profile.ts`) and the home section contract (`src/config/home.ts`) are the seams the CMS will replace.
- **Phase 2 prerequisites:**
  - owner commits the current work (D-1)
  - Docker/PostgreSQL availability on this machine (unverified)
  - Payload trial per ADR-003 T1–T14
- **Not blocking Phase 2:** Arabic title, portrait, monogram, alternateName.

## 19. Recommended Next Prompt

Phase 2: in this repository, run the Payload CMS 3 implementation trial (ADR-003 T1–T14) against PostgreSQL:
- localized collections (projects, experience, education, certificates, skills, CV, media, site settings/profile) with `DRAFT → PUBLISHED → ARCHIVED`
- a repository layer that replaces `src/config/profile.ts` and `src/config/home.ts` as data sources
- on-demand revalidation
- auth/access control
- the admin bundle kept out of public chunks

Record PASS/FAIL per criterion and switch to the custom-dashboard fallback if the decision rule triggers. Use development fixtures only (clearly marked); no invented personal data.

## 20. Final Verdict

**COMPLETE WITH KNOWN LIMITATIONS**

STOP — Phase 2 has not been started.
