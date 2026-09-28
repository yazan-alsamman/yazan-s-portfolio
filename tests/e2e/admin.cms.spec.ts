import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Phase 5 — the dashboard, driven through the real admin UI (not the API):
 * sign in → overview → create a project → publish EN → public page → add Arabic → publish →
 * /ar page → archive → public 404 → delete (confirmation), plus media upload and the
 * library delete guard. Runs in the serial `cms` project; every document is a labelled
 * development fixture and is removed at the end.
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
// The e2e server runs with SITE_URL = its own URL (playwright.config), so the browser's Origin
// is the trusted one — exactly like an editor on the real site. CSRF stays strict.
const ORIGIN = `http://localhost:${process.env.E2E_PORT ?? 3217}`;
const slug = `admin-ui-fixture-${Date.now().toString(36)}`;
let projectId = '';

async function signIn(page: Page) {
  await page.goto('/admin/login');
  await page.fill('#field-email', env.CMS_ADMIN_EMAIL!);
  await page.fill('#field-password', env.CMS_ADMIN_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin$/);
}

async function chooseSelect(page: Page, fieldId: string, option: string) {
  await page.locator(`#${fieldId} .rs__control`).click();
  await page.locator('.rs__option', { hasText: option }).first().click();
}

async function publish(page: Page) {
  await page.getByRole('button', { name: 'Publish changes' }).click();
  await expect(page.locator('.payload-toast-container')).toContainText(/successfully|Updated|published/i, {
    timeout: 15_000,
  });
}

test('anonymous visitors are sent to the login screen; the login screen is branded and private', async ({
  page,
  request,
}) => {
  await page.goto('/admin/collections/projects');
  await expect(page).toHaveURL(/\/admin\/login/);
  // exact: Next's route announcer may also contain "… — Portfolio CMS".
  await expect(page.getByText('Portfolio CMS', { exact: true })).toBeVisible();
  expect((await request.get('/admin/login')).headers()['x-robots-tag']).toMatch(/noindex/);
  expect((await request.get('/api/audit-log')).status()).toBe(403);
});

test('overview shows content status, public pages per language, recent changes and system status', async ({
  page,
}) => {
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Portfolio overview' })).toBeVisible();
  for (const name of ['Content status', 'Public pages', 'Recent changes', 'Library & system']) {
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  }
  await expect(page.getByText(/migrations applied: \d+/)).toBeVisible();
  await expect(
    page.getByText(/Arabic is not published in production until the Arabic copy review/),
  ).toBeVisible();
  const a11y = await new AxeBuilder({ page })
    .include('section[aria-label]')
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(a11y.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
});

test('create a project in the dashboard and publish it in English → the public page shows it', async ({
  page,
}) => {
  await signIn(page);
  await page.goto('/admin/collections/projects/create?locale=en');
  await expect(page.getByRole('button', { name: 'Locale' })).toContainText('English');
  await page.fill('#field-title', 'Dashboard Fixture Project');
  await page.fill('#field-slug', slug);
  await page.fill(
    '#field-summary',
    'Development fixture created through the dashboard UI by the Phase 5 e2e test.',
  );
  await page.getByRole('button', { name: 'Details', exact: true }).click();
  await chooseSelect(page, 'field-category', 'Computer vision');
  await page.getByRole('button', { name: 'SEO', exact: true }).click();
  await page.fill('#field-seo__title', 'Dashboard Fixture Project — e2e');
  await page.fill(
    '#field-seo__description',
    'Development fixture created through the dashboard UI by the automated Phase 5 end-to-end test only.',
  );
  await chooseSelect(page, 'field-translationStatus', 'Approved');
  await publish(page);
  await page.waitForURL(/\/admin\/collections\/projects\/\d+/);
  projectId = /projects\/(\d+)/.exec(page.url())![1]!;

  // The sidebar panel reports where it is live (as of this save).
  await page.reload();
  const panel = page.getByLabel('On the public site');
  await expect(panel).toContainText('English: live');
  await expect(panel.getByRole('link', { name: `/projects/${slug}` })).toBeVisible();
  await expect(panel).toContainText(/العربية: not public/);

  await page.goto(`/projects/${slug}`);
  await expect(page.locator('h1')).toHaveText('Dashboard Fixture Project');
  await page.goto('/projects');
  await expect(page.getByRole('link', { name: 'Dashboard Fixture Project' })).toBeVisible();
});

test('add the Arabic version (explicit locale, no fallback) → /ar page appears only after approval', async ({
  page,
}) => {
  await signIn(page);
  // Before: English-only project has no Arabic page (no fallback).
  expect((await page.goto(`/ar/projects/${slug}`))?.status()).toBe(404);

  await page.goto(`/admin/collections/projects/${projectId}?locale=ar`);
  await expect(page.getByRole('button', { name: 'Locale' })).toContainText('العربية');
  // Arabic fields start empty — English is never copied in.
  await expect(page.locator('#field-title')).toHaveValue('');
  await page.fill('#field-title', 'مشروع تجريبي من لوحة التحكم');
  await page.fill(
    '#field-summary',
    'بيانات اختبار أُنشئت عبر واجهة لوحة التحكم في اختبار المرحلة الخامسة فقط.',
  );
  await page.getByRole('button', { name: 'SEO', exact: true }).click();
  await page.fill('#field-seo__title', 'مشروع تجريبي — اختبار آلي');
  await page.fill(
    '#field-seo__description',
    'بيانات اختبار أُنشئت عبر واجهة لوحة التحكم بواسطة اختبار المرحلة الخامسة الآلي فقط، وليست محتوى حقيقياً.',
  );
  await chooseSelect(page, 'field-translationStatus', 'Approved');
  await publish(page);

  await page.goto(`/ar/projects/${slug}`);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('h1')).toHaveText('مشروع تجريبي من لوحة التحكم');
  // English is untouched by the Arabic edit.
  await page.goto(`/projects/${slug}`);
  await expect(page.locator('h1')).toHaveText('Dashboard Fixture Project');
});

test('archive hides it from the public site; delete requires archive + confirmation', async ({ page }) => {
  await signIn(page);
  await page.goto(`/admin/collections/projects/${projectId}?locale=en`);
  await page.locator('#field-archived').check();
  await publish(page);
  expect((await page.goto(`/projects/${slug}`))?.status()).toBe(404);

  await page.goto(`/admin/collections/projects/${projectId}?locale=en`);
  await page.locator('.doc-controls__popup button, button[aria-label="More options"]').first().click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText(/delete/i);
  await dialog
    .getByRole('button', { name: /Confirm|Delete/ })
    .last()
    .click();
  await page.waitForURL(/\/admin\/collections\/projects(\?|$)/, { timeout: 15_000 });
  const res = await page.request.get(`/api/projects/${projectId}?draft=true`);
  expect(res.status()).toBe(404);
});

test('media: upload with alt text in the dashboard; deleting is refused until archived and unused', async ({
  page,
}) => {
  await signIn(page);
  await page.goto('/admin/collections/media/create?locale=en');
  // 1×1 PNG
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64',
  );
  await page
    .locator('input[type="file"]')
    .setInputFiles({ name: 'fixture.png', mimeType: 'image/png', buffer: png });
  await page.fill('#field-alt', 'Development fixture image uploaded by the Phase 5 e2e test');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForURL(/\/admin\/collections\/media\/\d+/, { timeout: 20_000 });
  const mediaId = /media\/(\d+)/.exec(page.url())![1]!;

  const headers = { origin: ORIGIN };
  // Not archived → refused with an explanation.
  const refused = await page.request.delete(`/api/media/${mediaId}`, { headers });
  expect(refused.status()).toBe(400);
  expect(await refused.text()).toMatch(/Archive this file before deleting it/);
  // Archive, then delete succeeds (unused).
  const archived = await page.request.patch(`/api/media/${mediaId}?locale=en`, {
    headers,
    data: { archived: true },
  });
  expect(archived.status(), await archived.text()).toBe(200);
  expect((await page.request.delete(`/api/media/${mediaId}`, { headers })).status()).toBe(200);
});

test('dashboard has no horizontal overflow at 1440, 1280, 1024 and 390', async ({ page }) => {
  await signIn(page);
  for (const width of [1440, 1280, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/admin', '/admin/collections/projects/create?locale=en', '/admin/globals/profile']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${path} @ ${width}px`).toBeLessThanOrEqual(0);
    }
  }
});

test.afterAll(async ({ request }) => {
  // Safety net if a step failed midway: archive + delete the fixture project, warm public pages.
  const login = await request.post('/api/users/login', {
    data: { email: env.CMS_ADMIN_EMAIL, password: env.CMS_ADMIN_PASSWORD },
  });
  const token = /payload-token=([^;]+)/.exec(login.headers()['set-cookie'] ?? '')?.[1];
  const headers = { cookie: `payload-token=${token}`, origin: ORIGIN };
  const found = await (
    await request.get(`/api/projects?where[slug][equals]=${slug}&draft=true&depth=0`, { headers })
  ).json();
  for (const doc of found.docs ?? []) {
    await request.patch(`/api/projects/${doc.id}?locale=en`, { headers, data: { archived: true } });
    await request.delete(`/api/projects/${doc.id}`, { headers });
  }
  const media = await (await request.get('/api/media?limit=50&depth=0', { headers })).json();
  for (const doc of media.docs ?? []) {
    if (doc.originalFilename !== 'fixture.png') continue;
    await request.patch(`/api/media/${doc.id}?locale=en`, { headers, data: { archived: true } });
    await request.delete(`/api/media/${doc.id}`, { headers });
  }
  for (const path of [
    '/',
    '/ar',
    '/projects',
    '/ar/projects',
    `/projects/${slug}`,
    `/ar/projects/${slug}`,
    '/sitemap.xml',
  ]) {
    await request.get(path);
  }
});
