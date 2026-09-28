import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

/**
 * Phase 6 — the content & media pipeline end to end, through the real admin UI:
 *   dashboard → create project → upload cover (a real JPEG carrying GPS metadata) → publish →
 *   public project page, plus the file-serving policy over HTTP (private original, public
 *   EXIF-free derivatives, caching/nosniff headers), PDF policy, optimization status, archive.
 * Serial `cms` project; labelled fixtures only; everything is removed at the end.
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
const slug = `media-pipeline-fixture-${Date.now().toString(36)}`;
const state: { projectId?: string; mediaId?: string; original?: string; derivative?: string } = {};

async function signIn(page: Page) {
  await page.goto('/admin/login');
  await page.fill('#field-email', env.CMS_ADMIN_EMAIL!);
  await page.fill('#field-password', env.CMS_ADMIN_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin$/);
}

async function adminHeaders(request: APIRequestContext) {
  const login = await request.post('/api/users/login', {
    data: { email: env.CMS_ADMIN_EMAIL, password: env.CMS_ADMIN_PASSWORD },
  });
  const token = /payload-token=([^;]+)/.exec(login.headers()['set-cookie'] ?? '')?.[1];
  return { cookie: `payload-token=${token}`, origin: ORIGIN };
}

async function jpegWithGps(): Promise<Buffer> {
  return sharp({ create: { width: 1600, height: 900, channels: 3, background: { r: 30, g: 60, b: 90 } } })
    .jpeg({ quality: 85 })
    .withExif({
      IFD0: { Copyright: 'Development fixture' },
      IFD3: {
        GPSLatitudeRef: 'N',
        GPSLatitude: '33/1 30/1 0/1',
        GPSLongitudeRef: 'E',
        GPSLongitude: '36/1 17/1 0/1',
      },
    })
    .toBuffer();
}

test('workflow: create a project, upload its cover in the dashboard, publish → public page shows the optimized image', async ({
  page,
}) => {
  await signIn(page);
  await page.goto('/admin/collections/projects/create?locale=en');
  await page.fill('#field-title', 'Media Pipeline Fixture Project');
  await page.fill('#field-slug', slug);
  await page.fill(
    '#field-summary',
    'Development fixture: verifies the Phase 6 upload → publish → public page workflow.',
  );

  // Media tab → Cover → "Create New" → upload drawer (file + alt text) → Save.
  await page.getByRole('button', { name: 'Media', exact: true }).click();
  await page.locator('#field-cover').getByRole('button', { name: 'Create New' }).click();
  const jpeg = await jpegWithGps();
  await page
    .locator('input[type="file"]')
    .setInputFiles({ name: 'cover-with-gps.jpg', mimeType: 'image/jpeg', buffer: jpeg });
  await page.locator('#field-alt').fill('Development fixture cover image for the media pipeline test');
  await page.getByRole('button', { name: 'Save', exact: true }).last().click();
  await expect(page.locator('#field-cover')).toContainText(/cover-with-gps|\.jpg/i, { timeout: 20_000 });

  await page.getByRole('button', { name: 'SEO', exact: true }).click();
  await page.fill('#field-seo__title', 'Media Pipeline Fixture — e2e');
  await page.fill(
    '#field-seo__description',
    'Development fixture used only by the automated Phase 6 media pipeline end-to-end test; not real content.',
  );
  await page.locator('#field-translationStatus .rs__control').click();
  await page.locator('.rs__option', { hasText: 'Approved' }).first().click();
  await page.getByRole('button', { name: 'Publish changes' }).click();
  await page.waitForURL(/\/admin\/collections\/projects\/\d+/, { timeout: 20_000 });
  state.projectId = /projects\/(\d+)/.exec(page.url())![1]!;

  // Public page: the cover is rendered from the full-size WebP derivative, not the original JPEG.
  await page.goto(`/projects/${slug}`);
  await expect(page.locator('h1')).toHaveText('Media Pipeline Fixture Project');
  const cover = page.getByRole('img', {
    name: 'Development fixture cover image for the media pipeline test',
  });
  await expect(cover).toBeVisible();
  const src = decodeURIComponent((await cover.getAttribute('src')) ?? '');
  expect(src).toMatch(/\/api\/media\/file\/[^&]+-1600x900\.webp/);
  expect(await cover.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  state.derivative = /\/api\/media\/file\/([^&]+\.webp)/.exec(src)![1]!;
});

test('file serving: the original is private, derivatives are public WebP without EXIF/GPS, with safe caching headers', async ({
  request,
  playwright,
}) => {
  const headers = await adminHeaders(request);
  const project = await (
    await request.get(`/api/projects/${state.projectId}?depth=1&locale=en`, { headers })
  ).json();
  state.mediaId = String(project.cover.id);
  state.original = project.cover.filename;

  const anon = await playwright.request.newContext({ baseURL: ORIGIN });
  const original = await anon.get(`/api/media/file/${state.original}`);
  expect(original.status(), 'the original upload is never served publicly').toBe(404);

  const derivative = await anon.get(`/api/media/file/${state.derivative}`);
  expect(derivative.status()).toBe(200);
  expect(derivative.headers()['content-type']).toBe('image/webp');
  expect(derivative.headers()['x-content-type-options']).toBe('nosniff');
  expect(derivative.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
  expect(derivative.headers()['x-robots-tag']).toMatch(/noindex/);
  const meta = await sharp(await derivative.body()).metadata();
  expect(meta.exif, 'no EXIF/GPS in public files').toBeUndefined();
  expect(meta.width).toBe(1600); // never enlarged
  await anon.dispose();

  // Signed-in admins can still retrieve the original (it is preserved, not deleted or altered).
  const adminOriginal = await request.get(`/api/media/file/${state.original}`, { headers });
  expect(adminOriginal.status()).toBe(200);
  expect((await sharp(await adminOriginal.body()).metadata()).exif).toBeDefined();
});

test('dashboard shows the optimization status of the image', async ({ page }) => {
  await signIn(page);
  await page.goto(`/admin/collections/media/${state.mediaId}`);
  await expect(page.locator('#field-optimizationStatus')).toContainText('Ready');
  await expect(page.locator('#field-optimizationDetail')).toHaveValue(/full 1600px/);
  await page.goto('/admin/collections/media');
  await expect(page.getByRole('columnheader', { name: /Optimization/ })).toBeVisible();
});

test('PDF policy: plain PDFs are served inline with noindex/nosniff; PDFs with active content are refused', async ({
  request,
  playwright,
}) => {
  const headers = await adminHeaders(request);
  const plain = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n183\n%%EOF\n',
    'latin1',
  );
  const created = await request.post('/api/documents?locale=en', {
    headers,
    multipart: {
      file: { name: 'fixture.pdf', mimeType: 'application/pdf', buffer: plain },
      _payload: JSON.stringify({ title: 'Development fixture PDF (media e2e)' }),
    },
  });
  expect(created.status(), await created.text()).toBe(201);
  const doc = (await created.json()).doc;
  const anon = await playwright.request.newContext({ baseURL: ORIGIN });
  const pdf = await anon.get(`/api/documents/file/${doc.filename}`);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()['content-type']).toBe('application/pdf');
  expect(pdf.headers()['content-disposition']).toBe('inline');
  expect(pdf.headers()['x-content-type-options']).toBe('nosniff');
  expect(pdf.headers()['x-robots-tag']).toMatch(/noindex/);
  await anon.dispose();

  const active = Buffer.from(
    plain
      .toString('latin1')
      .replace('/Pages 2 0 R >>', '/Pages 2 0 R /OpenAction << /S /JavaScript /JS (x) >> >>'),
    'latin1',
  );
  const refused = await request.post('/api/documents?locale=en', {
    headers,
    multipart: {
      file: { name: 'active.pdf', mimeType: 'application/pdf', buffer: active },
      _payload: JSON.stringify({ title: 'Development fixture active PDF' }),
    },
  });
  expect(refused.status()).toBe(400);
  expect(await refused.text()).toMatch(/active content/);

  await request.patch(`/api/documents/${doc.id}?locale=en`, { headers, data: { archived: true } });
  expect((await request.delete(`/api/documents/${doc.id}`, { headers })).status()).toBe(200);
});

test('archiving the image removes it from the public site (files and page)', async ({
  request,
  playwright,
  page,
}) => {
  const headers = await adminHeaders(request);
  expect(
    (
      await request.patch(`/api/media/${state.mediaId}?locale=en`, { headers, data: { archived: true } })
    ).status(),
  ).toBe(200);
  const anon = await playwright.request.newContext({ baseURL: ORIGIN });
  expect([403, 404]).toContain((await anon.get(`/api/media/file/${state.derivative}`)).status());
  await anon.dispose();
  await page.goto(`/projects/${slug}`);
  await expect(page.locator('h1')).toHaveText('Media Pipeline Fixture Project');
  await expect(page.getByRole('img', { name: /media pipeline test/ })).toHaveCount(0);
});

test.afterAll(async ({ request }) => {
  const headers = await adminHeaders(request);
  if (state.projectId) {
    await request.patch(`/api/projects/${state.projectId}?locale=en`, { headers, data: { archived: true } });
    await request.delete(`/api/projects/${state.projectId}`, { headers });
  }
  const media = await (await request.get('/api/media?limit=50&depth=0', { headers })).json();
  for (const doc of media.docs ?? []) {
    if (doc.originalFilename !== 'cover-with-gps.jpg') continue;
    await request.patch(`/api/media/${doc.id}?locale=en`, { headers, data: { archived: true } });
    await request.delete(`/api/media/${doc.id}`, { headers });
  }
  const docs = await (await request.get('/api/documents?limit=50&depth=0', { headers })).json();
  for (const doc of docs.docs ?? []) {
    if (!['fixture.pdf', 'active.pdf'].includes(doc.originalFilename)) continue;
    await request.patch(`/api/documents/${doc.id}?locale=en`, { headers, data: { archived: true } });
    await request.delete(`/api/documents/${doc.id}`, { headers });
  }
  for (const path of ['/', '/projects', `/projects/${slug}`, '/sitemap.xml']) await request.get(path);
});
