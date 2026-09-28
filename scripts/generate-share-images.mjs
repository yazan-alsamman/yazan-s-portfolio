/**
 * Default share images (Phase 7 — SEO_AND_DISCOVERABILITY "Social Preview", SEO_MASTER §35).
 *
 *   pnpm seo:share-images
 *
 * Renders one 1200 × 630 PNG per locale into src/assets/share/ with the real browser engine
 * (Chrome through Playwright), so Arabic text is shaped correctly by the self-hosted
 * IBM Plex Sans Arabic (ADR-011: "verify Arabic shaping"; satori/next/og does not shape Arabic).
 *
 * Inputs — nothing is invented:
 *   - identity: the owner-confirmed name and title (src/cms/seed-data.ts, OWNER_PROFILE.md);
 *   - portrait: portrait.jpg, read-only and SHA-256-verified; shown with the approved Phase 3
 *     crop (right 6 % and bottom 12 % removed — the third party's hand), never enlarged;
 *   - brand tokens (src/app/globals.css) and the self-hosted fonts (src/fonts).
 * Re-run only when the identity or brand changes; commit the output with its source change.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { confirmedIdentity } from '../src/cms/seed-data.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src/assets/share');
const PORTRAIT_SHA256 = '1c00fa075b97e2ef8a3460b3d62155052533729994041bd7f562ed5177323fca';
const DOMAIN = 'yazanalsamman.com'; // Primary domain (SEO_AND_DISCOVERABILITY)

const portrait = readFileSync(path.join(ROOT, 'portrait.jpg'));
const hash = createHash('sha256').update(portrait).digest('hex');
if (hash !== PORTRAIT_SHA256) throw new Error(`portrait.jpg changed (SHA-256 ${hash}); refusing to render.`);

const font = (file) =>
  `data:font/woff2;base64,${readFileSync(path.join(ROOT, 'src/fonts', file)).toString('base64')}`;
const portraitUrl = `data:image/jpeg;base64,${portrait.toString('base64')}`;

// Portrait box: the cropped source is 506 × 582 px (538·0.94 × 661·0.88); shown at ≤ 1:1.
const CROP = { w: 506, h: 582 };
const BOX = { w: 452, h: 566 }; // scale 566/582 = 0.97 (never enlarged)
const SCALE = BOX.h / CROP.h;

function html(locale) {
  const rtl = locale === 'ar';
  const name = confirmedIdentity.name[locale];
  const title = confirmedIdentity.title[locale];
  return `<!doctype html><html lang="${locale}" dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
@font-face{font-family:Display;src:url(${font('space-grotesk-latin-wght-normal.woff2')}) format('woff2');font-weight:300 700}
@font-face{font-family:Body;src:url(${font('inter-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:Arabic;src:url(${font('ibm-plex-sans-arabic-arabic-600-normal.woff2')}) format('woff2');font-weight:600}
@font-face{font-family:Arabic;src:url(${font('ibm-plex-sans-arabic-arabic-400-normal.woff2')}) format('woff2');font-weight:400}
*{margin:0;box-sizing:border-box}
html,body{width:1200px;height:630px;background:#07090d;overflow:hidden}
body{position:relative;color:#e8edf2;font-family:Body,Arabic,sans-serif}
.grid{position:absolute;inset:0;background-image:linear-gradient(to right,rgba(42,49,59,.55) 1px,transparent 1px);background-size:100px 100%;mask-image:linear-gradient(to bottom,transparent,#000 30%,#000 70%,transparent)}
.glow{position:absolute;width:760px;height:760px;${rtl ? 'left' : 'right'}:-120px;top:-140px;background:radial-gradient(closest-side,rgba(101,230,255,.16),rgba(140,124,255,.08) 55%,transparent)}
.portrait{position:absolute;top:32px;${rtl ? 'left' : 'right'}:48px;width:${BOX.w}px;height:${BOX.h}px;overflow:hidden;border-radius:14px;border:1px solid #2a313b}
.portrait img{position:absolute;top:0;left:${-Math.round((CROP.w * SCALE - BOX.w) * 0.35)}px;width:${Math.round(538 * SCALE)}px;height:${Math.round(661 * SCALE)}px}
.portrait::after{content:'';position:absolute;inset:0;background:linear-gradient(${rtl ? '270deg' : '90deg'},rgba(7,9,13,.55),transparent 38%),linear-gradient(to top,rgba(7,9,13,.35),transparent 30%)}
.copy{position:absolute;top:0;bottom:0;${rtl ? 'right' : 'left'}:72px;width:560px;display:flex;flex-direction:column;justify-content:center;gap:26px}
.label{display:flex;align-items:center;gap:14px;font-family:Display,sans-serif;font-size:22px;letter-spacing:.14em;text-transform:uppercase;color:#b8c1cc;direction:ltr;${rtl ? 'justify-content:flex-end' : ''}}
.dot{width:9px;height:9px;border-radius:50%;background:#65e6ff}
.rule{width:44px;height:1px;background:#636b75}
h1{font-family:${rtl ? 'Arabic' : 'Display'},sans-serif;font-weight:600;font-size:${rtl ? 84 : 76}px;line-height:1.05;letter-spacing:${rtl ? '0' : '-.02em'};color:#f7f9fb}
p{font-family:${rtl ? 'Arabic' : 'Body'},sans-serif;font-weight:400;font-size:${rtl ? 36 : 32}px;line-height:1.3;color:#b8c1cc}
.accent{width:120px;height:3px;background:linear-gradient(90deg,#65e6ff,#8c7cff)}
</style></head><body>
<div class="grid"></div><div class="glow"></div>
<div class="portrait"><img src="${portraitUrl}" alt=""></div>
<div class="copy">
  <div class="label"><span class="dot"></span><span>${DOMAIN}</span><span class="rule"></span></div>
  <h1>${name}</h1>
  <div class="accent"></div>
  <p>${title}</p>
</div>
</body></html>`;
}

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const locale of ['en', 'ar']) {
  await page.setContent(html(locale), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const file = path.join(OUT, `share-${locale}.png`);
  await page.screenshot({ path: file, type: 'png' });
  console.log(`wrote ${path.relative(ROOT, file)}`);
}
await browser.close();
