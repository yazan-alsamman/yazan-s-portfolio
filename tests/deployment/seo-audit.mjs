/**
 * Repeatable SEO audit (Phase 7 — SEO_MASTER §38). Read-only: crawls a running build and fails on
 * any SEO integrity error. Pages are loaded WITHOUT JavaScript (what a non-rendering crawler sees).
 *
 *   BASE_URL=http://localhost:3217  SITE_URL=https://yazanalsamman.com  PRODUCTION=true \
 *     node tests/deployment/seo-audit.mjs
 *
 *   BASE_URL   where to fetch pages (the build under test);
 *   SITE_URL   the canonical origin the build was configured with (default: BASE_URL) —
 *              canonical/hreflang/sitemap URLs must use it; they are fetched via BASE_URL;
 *   PRODUCTION "true" for a SITE_ENV=production build: sitemap pages must be indexable and
 *              robots.txt must allow the site (otherwise non-production must disallow all).
 *
 * Checks: robots.txt; sitemap.xml (canonical origin, no private/duplicate URLs, every URL 200 and
 * self-canonical); on every crawled page: title + description present and unique, one <h1>,
 * canonical present/absolute/self, img alt present, hreflang targets exist and are reciprocal,
 * valid JSON-LD without placeholder values, og:image reachable, no internal link to a 404 or
 * redirect, no indexable page absent from the sitemap, no noindex page in it. Admin/API/private
 * media never crawled.
 */
import { chromium, request as pwRequest } from '@playwright/test';

const BASE = (process.env.BASE_URL ?? '').replace(/\/$/, '');
const SITE = (process.env.SITE_URL ?? BASE).replace(/\/$/, '');
const PRODUCTION = process.env.PRODUCTION === 'true';
if (!BASE) throw new Error('BASE_URL is required');

const errors = [];
const notes = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);
const toFetch = (url) => (url.startsWith(SITE) ? BASE + url.slice(SITE.length) : url);
const toSite = (url) => (url.startsWith(BASE) ? SITE + url.slice(BASE.length) : url);
const PRIVATE = /\/(admin|api)(\/|$)|\/design-system/;

// IGNORE_HTTPS_ERRORS=1 only for a rehearsal behind a self-signed certificate (Phase 9 dry run).
const ignoreHTTPSErrors = process.env.IGNORE_HTTPS_ERRORS === '1';
const api = await pwRequest.newContext({ maxRedirects: 0, ignoreHTTPSErrors });

// robots.txt
const robots = await (await api.get(`${BASE}/robots.txt`)).text();
if (PRODUCTION) {
  if (!/Allow: \/\s/.test(robots)) fail('robots.txt', 'production must allow /');
  for (const p of ['/admin', '/api'])
    if (!robots.includes(`Disallow: ${p}`)) fail('robots.txt', `must disallow ${p}`);
  if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`))
    fail('robots.txt', 'must advertise the canonical sitemap');
} else if (!/Disallow: \/\s*$/m.test(robots)) fail('robots.txt', 'non-production must disallow everything');

// sitemap.xml
const sitemapXml = await (await api.get(`${BASE}/sitemap.xml`)).text();
const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const sitemapAlternates = [...sitemapXml.matchAll(/hreflang="([^"]+)"\s+href="([^"]+)"/g)].map((m) => m[2]);
if (new Set(sitemapUrls).size !== sitemapUrls.length) fail('sitemap', 'duplicate URLs');
for (const url of [...sitemapUrls, ...sitemapAlternates]) {
  if (!url.startsWith(SITE)) fail('sitemap', `non-canonical origin: ${url}`);
  if (PRIVATE.test(url)) fail('sitemap', `private URL: ${url}`);
  if (/localhost|127\.0\.0\.1/.test(url) && PRODUCTION) fail('sitemap', `development URL: ${url}`);
  if (PRODUCTION && !url.startsWith('https://')) fail('sitemap', `not HTTPS: ${url}`);
}

// Crawl: sitemap URLs + everything linked from them (same origin, public only).
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ javaScriptEnabled: false, ignoreHTTPSErrors });
const page = await context.newPage();
const queue = [...new Set([`${SITE}/`.replace(/\/$/, '') || SITE, ...sitemapUrls])];
const seen = new Set();
const pages = [];
const linkStatus = new Map();

async function status(url) {
  if (!linkStatus.has(url)) linkStatus.set(url, (await api.get(toFetch(url))).status());
  return linkStatus.get(url);
}

while (queue.length) {
  const url = queue.shift();
  if (seen.has(url) || PRIVATE.test(url)) continue;
  seen.add(url);
  const response = await page.goto(toFetch(url));
  const code = response?.status() ?? 0;
  linkStatus.set(url, code);
  if (code !== 200) {
    fail(url, `HTTP ${code}`);
    continue;
  }
  const info = await page.evaluate(() => {
    const attr = (sel, name) => document.querySelector(sel)?.getAttribute(name) ?? null;
    return {
      title: document.title,
      description: attr('meta[name="description"]', 'content'),
      robots: attr('meta[name="robots"]', 'content') ?? '',
      canonical: attr('link[rel="canonical"]', 'href'),
      h1: document.querySelectorAll('h1').length,
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      imgsWithoutAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).map((i) => i.src),
      hreflang: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => [
        l.getAttribute('hreflang'),
        l.getAttribute('href'),
      ]),
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
      ogImage: attr('meta[property="og:image"]', 'content'),
      links: [...document.querySelectorAll('a[href]')].map((a) => a.href),
    };
  });
  pages.push({ url, ...info });
  for (const link of info.links) {
    const u = new URL(link);
    if (u.origin !== new URL(BASE).origin) continue;
    const site = toSite(`${u.origin}${u.pathname}`).replace(/\/$/, '') || SITE;
    if (PRIVATE.test(u.pathname)) {
      if (!/\/api\/(media|documents)\/file\//.test(u.pathname))
        fail(url, `links to a private route ${u.pathname}`);
      continue;
    }
    if (!seen.has(site)) queue.push(site);
  }
}

const count = (key) => pages.reduce((m, p) => m.set(p[key], (m.get(p[key]) ?? 0) + 1), new Map());
const titles = count('title');
const descriptions = count('description');
const byUrl = new Map(pages.map((p) => [p.url, p]));

for (const p of pages) {
  const indexable = !/noindex/.test(p.robots);
  if (!p.title) fail(p.url, 'missing <title>');
  else if (titles.get(p.title) > 1) fail(p.url, `duplicate title "${p.title}"`);
  if (!p.description) fail(p.url, 'missing meta description');
  else if (descriptions.get(p.description) > 1) fail(p.url, 'duplicate meta description');
  if (p.h1 !== 1) fail(p.url, `${p.h1} <h1> elements`);
  if (!p.canonical) fail(p.url, 'missing canonical');
  else if (!p.canonical.startsWith(SITE)) fail(p.url, `canonical on another origin: ${p.canonical}`);
  else if (p.canonical !== p.url) fail(p.url, `canonical ${p.canonical} is not self-referencing`);
  if (!['en', 'ar'].includes(p.lang)) fail(p.url, `lang="${p.lang}"`);
  if (p.dir !== (p.lang === 'ar' ? 'rtl' : 'ltr')) fail(p.url, `dir="${p.dir}" for lang="${p.lang}"`);
  for (const src of p.imgsWithoutAlt) fail(p.url, `img without alt: ${src}`);
  if (PRODUCTION && sitemapUrls.includes(p.url) && !indexable) fail(p.url, 'in the sitemap but noindex');
  if (PRODUCTION && indexable && !sitemapUrls.includes(p.url))
    fail(p.url, 'indexable but missing from the sitemap');
  for (const [lang, href] of p.hreflang) {
    if (!href.startsWith(SITE)) fail(p.url, `hreflang ${lang} on another origin`);
    const target = byUrl.get(href);
    if ((await status(href)) !== 200) fail(p.url, `hreflang ${lang} → ${href} is HTTP ${await status(href)}`);
    else if (target && lang !== 'x-default' && !target.hreflang.some(([, h]) => h === p.url))
      fail(p.url, `hreflang ${lang} → ${href} is not reciprocal`);
  }
  for (const raw of p.jsonLd) {
    try {
      const json = JSON.parse(raw);
      if (/OWNER_INPUT|TODO|lorem|placeholder|example\.com/i.test(JSON.stringify(json)))
        fail(p.url, 'JSON-LD contains placeholder values');
    } catch {
      fail(p.url, 'invalid JSON-LD');
    }
  }
  if (!p.ogImage) fail(p.url, 'missing og:image');
  else if (
    PRIVATE.test(new URL(p.ogImage).pathname) &&
    !/\/api\/media\/file\/.+-\d+x\d+\.webp$/.test(p.ogImage)
  )
    fail(p.url, `og:image is not a public derivative: ${p.ogImage}`);
  else if ((await status(p.ogImage)) !== 200) fail(p.url, `og:image HTTP ${await status(p.ogImage)}`);
  for (const link of p.links) {
    const u = new URL(link);
    if (u.origin !== new URL(BASE).origin || PRIVATE.test(u.pathname)) continue;
    const code = await status(toSite(`${u.origin}${u.pathname}`).replace(/\/$/, '') || SITE);
    if (code !== 200) fail(p.url, `internal link ${u.pathname} → HTTP ${code}`);
  }
}
for (const url of sitemapUrls) if (!byUrl.has(url)) fail('sitemap', `${url} was not crawlable`);

notes.push(
  `${pages.length} pages crawled, ${sitemapUrls.length} sitemap URLs, ${linkStatus.size} URLs checked`,
);
await browser.close();
await api.dispose();

console.log(
  JSON.stringify(
    {
      base: BASE,
      site: SITE,
      production: PRODUCTION,
      notes,
      pages: pages.map((p) => ({
        url: p.url,
        title: p.title,
        robots: p.robots,
        lang: p.lang,
        hreflang: p.hreflang.map(([l]) => l).join(','),
      })),
      errors,
    },
    null,
    1,
  ),
);
process.exit(errors.length ? 1 : 0);
