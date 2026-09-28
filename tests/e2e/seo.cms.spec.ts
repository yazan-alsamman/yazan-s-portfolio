import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

/**
 * Phase 7 — SEO, share images and page-aware localization, end to end on real CMS content:
 *   - the language switcher links to the same page in the other language when it exists there,
 *     else its section, else home (R-47) — never to a 404;
 *   - every page has a 1200 × 630 share image (built-in brand image per locale, the owner's
 *     "SEO & sharing" image, or a project cover) with `summary_large_image`;
 *   - "SEO & sharing" (Site Settings, R-48) overrides the home title/description only in
 *     locales where it is approved; canonical/hreflang stay page-aware.
 * Serial `cms` project; labelled fixtures only; everything is restored at the end.
 */
test.describe.configure({ mode: 'serial' });

function localEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m) out[m[1]!] = m[2]!;
  }
  return out;
}
const env = localEnv();
const ORIGIN = `http://localhost:${process.env.E2E_PORT ?? 3217}`;
const suffix = Date.now().toString(36);
const shared = `seo-fixture-shared-${suffix}`;
const englishOnly = `seo-fixture-english-${suffix}`;
let headers: Record<string, string> = {};
const created: { collection: string; id: number }[] = [];
let shareMediaId = 0;

const seo = (title: string) => ({
  title: `${title} — Fixture`,
  description:
    'Development fixture used only by the automated Phase 7 SEO end-to-end tests; never real content.',
});
const seoAr = {
  title: 'مشروع تجريبي — بيانات اختبار',
  description:
    'بيانات اختبار تُستخدم فقط في اختبارات المرحلة السابعة الآلية، وليست محتوى حقيقياً للموقع إطلاقاً.',
};

async function login(request: APIRequestContext) {
  const res = await request.post('/api/users/login', {
    data: { email: env.CMS_ADMIN_EMAIL, password: env.CMS_ADMIN_PASSWORD },
  });
  expect(res.status()).toBe(200);
  const token = /payload-token=([^;]+)/.exec(res.headers()['set-cookie'] ?? '')![1]!;
  headers = { cookie: `payload-token=${token}`, origin: ORIGIN };
}

async function create(request: APIRequestContext, collection: string, data: Record<string, unknown>) {
  const res = await request.post(`/api/${collection}?locale=en`, { headers, data });
  expect(res.status(), `${collection} create: ${await res.text()}`).toBe(201);
  const id = (await res.json()).doc.id as number;
  created.push({ collection, id });
  return id;
}

async function meta(page: Page, selector: string) {
  return page.locator(selector).first().getAttribute('content');
}

async function switchHref(page: Page, to: 'en' | 'ar') {
  // A not-found page's content is rendered from the RSC payload after hydration, not in the
  // server HTML (Next 16), so wait for the switcher instead of racing it (Phase 9, R-66).
  await expect(page.locator(`a[hreflang="${to}"]`).first()).toBeAttached();
  const hrefs = await page
    .locator(`a[hreflang="${to}"]`)
    .evaluateAll((els) => els.map((e) => e.getAttribute('href')));
  expect(hrefs.length, 'switcher links (header + footer)').toBeGreaterThan(0);
  expect(new Set(hrefs).size, 'every switcher on the page agrees').toBe(1);
  return hrefs[0]!;
}

test.beforeAll(async ({ request }) => {
  await login(request);
  const approved = { translationStatus: 'approved', _status: 'published' };
  const sharedId = await create(request, 'projects', {
    title: 'SEO Fixture Shared Project',
    slug: shared,
    summary: 'Development fixture project that exists in English and Arabic (Phase 7 test).',
    seo: seo('SEO Fixture Shared Project'),
    ...approved,
  });
  const ar = await request.patch(`/api/projects/${sharedId}?locale=ar`, {
    headers,
    data: {
      title: 'مشروع تجريبي مشترك',
      summary: 'مشروع تجريبي موجود بالإنجليزية والعربية لاختبار المرحلة السابعة.',
      seo: seoAr,
      ...approved,
    },
  });
  expect(ar.status(), await ar.text()).toBe(200);
  await create(request, 'projects', {
    title: 'SEO Fixture English-only Project',
    slug: englishOnly,
    summary: 'Development fixture project that exists in English only (Phase 7 test).',
    seo: seo('SEO Fixture English-only Project'),
    ...approved,
  });
  const jpeg = await sharp({
    create: { width: 1600, height: 900, channels: 3, background: { r: 20, g: 40, b: 70 } },
  })
    .jpeg()
    .toBuffer();
  const media = await request.post('/api/media?locale=en', {
    headers,
    multipart: {
      file: { name: 'seo-share-fixture.jpg', mimeType: 'image/jpeg', buffer: jpeg },
      _payload: JSON.stringify({ alt: 'Development fixture share image (English alt only)' }),
    },
  });
  expect(media.status(), await media.text()).toBe(201);
  shareMediaId = (await media.json()).doc.id;
  created.push({ collection: 'media', id: shareMediaId });
});

test.afterAll(async ({ request }) => {
  await login(request);
  // Restore "SEO & sharing" to its empty default in both languages.
  for (const locale of ['en', 'ar']) {
    await request.post(`/api/globals/site-settings?locale=${locale}`, {
      headers,
      data: { seo: { title: null, description: null }, shareImage: null, translationStatus: 'draft' },
    });
  }
  for (const { collection, id } of created.reverse()) {
    await request.patch(`/api/${collection}/${id}?locale=en`, { headers, data: { archived: true } });
    await request.delete(`/api/${collection}/${id}`, { headers });
  }
  // R-45: re-request affected pages so fresh cache entries replace the invalidated ones.
  for (const path of [
    '/',
    '/ar',
    '/projects',
    '/ar/projects',
    `/projects/${shared}`,
    `/ar/projects/${shared}`,
    `/projects/${englishOnly}`,
    '/about',
    '/ar/about',
    '/sitemap.xml',
  ]) {
    await request.get(path);
  }
});

test.describe('page-aware language switcher (R-47)', () => {
  test('static page → the same page in the other language, both directions', async ({ page }) => {
    await page.goto('/about');
    expect(await switchHref(page, 'ar')).toBe('/ar/about');
    await page.goto('/ar/about');
    expect(await switchHref(page, 'en')).toBe('/about');
  });

  test('project in both languages → the same project (slug preserved), both directions', async ({ page }) => {
    await page.goto(`/projects/${shared}`);
    expect(await switchHref(page, 'ar')).toBe(`/ar/projects/${shared}`);
    await page.locator('a[hreflang="ar"]').first().click();
    await expect(page).toHaveURL(new RegExp(`/ar/projects/${shared}$`));
    await expect(page.locator('h1')).toHaveText('مشروع تجريبي مشترك');
    expect(await switchHref(page, 'en')).toBe(`/projects/${shared}`);
  });

  test('project without an Arabic version → the Arabic projects index, never a 404', async ({
    page,
    request,
  }) => {
    await page.goto(`/projects/${englishOnly}`);
    const href = await switchHref(page, 'ar');
    expect(href).toBe('/ar/projects');
    expect((await request.get(`/ar/projects/${englishOnly}`)).status()).toBe(404); // the page really is absent
    expect((await request.get(href)).status()).toBe(200);
  });

  test('home ↔ home; unknown routes map to an existing page', async ({ page }) => {
    await page.goto('/');
    expect(await switchHref(page, 'ar')).toBe('/ar');
    await page.goto('/projects/does-not-exist');
    expect(await switchHref(page, 'ar')).toBe('/ar/projects');
    await page.goto('/no-such-page');
    expect(await switchHref(page, 'ar')).toBe('/ar');
  });
});

test.describe('share images and social metadata', () => {
  test('pages without their own image use the built-in brand image of their language', async ({
    page,
    request,
  }) => {
    for (const [path, locale, alt] of [
      ['/', 'en', 'Yazan Al Samman — Artificial Intelligence Engineer'],
      ['/ar', 'ar', 'يزن السمان — مهندس ذكاء صنعي'],
      [`/projects/${shared}`, 'en', 'Yazan Al Samman — Artificial Intelligence Engineer'],
    ] as const) {
      await page.goto(path);
      const url = (await meta(page, 'meta[property="og:image"]'))!;
      expect(url).toMatch(new RegExp(`^${ORIGIN}/_next/static/media/share-${locale}\\.[\\w-]+\\.png$`));
      expect(await meta(page, 'meta[property="og:image:width"]')).toBe('1200');
      expect(await meta(page, 'meta[property="og:image:height"]')).toBe('630');
      expect(await meta(page, 'meta[property="og:image:alt"]')).toBe(alt);
      expect(await meta(page, 'meta[name="twitter:card"]')).toBe('summary_large_image');
      expect(await meta(page, 'meta[name="twitter:image"]')).toBe(url);
      const image = await request.get(url.replace(ORIGIN, ''));
      expect(image.status()).toBe(200);
      expect(image.headers()['content-type']).toBe('image/png');
    }
  });

  test('Open Graph basics: canonical URL, localized locale, page-aware alternates', async ({ page }) => {
    await page.goto(`/projects/${shared}`);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBe(`${ORIGIN}/projects/${shared}`);
    expect(await meta(page, 'meta[property="og:url"]')).toBe(canonical);
    expect(await meta(page, 'meta[property="og:type"]')).toBe('article');
    expect(await meta(page, 'meta[property="og:locale"]')).toBe('en_US');
    expect(await meta(page, 'meta[property="og:title"]')).toBe(
      'SEO Fixture Shared Project — Fixture — Yazan Al Samman', // same template as <title>
    );
    // Arabic is not publishable yet (copy review pending): no hreflang to it anywhere.
    await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveCount(0);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', canonical!);
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
      'href',
      canonical!,
    );
    await page.goto(`/ar/projects/${shared}`);
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe(
      `${ORIGIN}/ar/projects/${shared}`,
    );
    expect(await meta(page, 'meta[property="og:locale"]')).toBe('ar_AR');
    expect(await meta(page, 'meta[name="robots"]')).toMatch(/noindex/); // gated locale
    // A page outside the publishable cluster declares no alternates (they could not be reciprocal).
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    await expect(page.locator('meta[property="og:locale:alternate"]')).toHaveCount(0);
  });

  test('"SEO & sharing" overrides the home title, description and share image — only where approved', async ({
    page,
    request,
  }) => {
    const res = await request.post('/api/globals/site-settings?locale=en', {
      headers,
      data: {
        seo: {
          title: 'Fixture home title — Phase 7 test',
          description: 'Development fixture home description used only by the automated Phase 7 SEO test.',
        },
        shareImage: shareMediaId,
        translationStatus: 'approved',
        _status: 'published',
      },
    });
    expect(res.status(), await res.text()).toBe(200);

    await page.goto('/');
    await expect(page).toHaveTitle('Fixture home title — Phase 7 test');
    expect(await meta(page, 'meta[name="description"]')).toBe(
      'Development fixture home description used only by the automated Phase 7 SEO test.',
    );
    const image = (await meta(page, 'meta[property="og:image"]'))!;
    expect(decodeURIComponent(image)).toMatch(/\/api\/media\/file\/[^/]+-1600x900\.webp$/); // derivative, not the original
    expect(await meta(page, 'meta[property="og:image:alt"]')).toBe(
      'Development fixture share image (English alt only)',
    );
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent())!);
    expect(ld['@graph'][1].description).toBe(
      'Development fixture home description used only by the automated Phase 7 SEO test.',
    );
    // The H1 is page content, not SEO text: unchanged.
    await expect(page.locator('h1')).toContainText('Yazan Al Samman');

    // Arabic: settings not approved there and the image has no Arabic alt → Arabic defaults.
    await page.goto('/ar');
    await expect(page).toHaveTitle('يزن السمان — مهندس ذكاء صنعي');
    expect(await meta(page, 'meta[property="og:image"]')).toMatch(/share-ar\.[\w-]+\.png$/);
  });

  test('"SEO & sharing" is a visible dashboard screen that adds no accessibility issues of its own', async ({
    page,
  }) => {
    await page.goto('/admin/login');
    await page.fill('#field-email', env.CMS_ADMIN_EMAIL!);
    await page.fill('#field-password', env.CMS_ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin$/);
    const axeRules = async (path: string) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .include('main')
        .analyze();
      return results.violations.map((v) => v.id);
    };
    // Baseline: Payload's stock global edit screen (CV) — its own violations are recorded in R-53.
    const baseline = await axeRules('/admin/globals/cv');
    const rules = await axeRules('/admin/globals/site-settings');
    await expect(page.getByRole('heading', { name: 'SEO & sharing' })).toBeVisible();
    await expect(page.locator('#field-seo__title')).toBeVisible();
    await expect(page.locator('#field-shareImage')).toBeVisible();
    await expect(page.locator('#field-featuredProjects')).toHaveCount(0); // retired (R-48)
    expect(
      rules.filter((id) => !baseline.includes(id)),
      'no violation types beyond stock Payload',
    ).toEqual([]);
  });
});

test('sitemap: only publishable locales and published pages (gated Arabic absent)', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml).toContain(`${ORIGIN}/projects/${shared}</loc>`);
  expect(xml).toContain(`${ORIGIN}/projects/${englishOnly}</loc>`);
  expect(xml).not.toContain('/ar');
  expect(xml).not.toMatch(/\/admin|\/api\//);
});
