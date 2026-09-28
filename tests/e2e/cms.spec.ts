import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type APIRequestContext } from '@playwright/test';

/**
 * Phase 2 — CMS behaviour over HTTP against the running production build (dev database).
 * Serial + desktop-only because it mutates CMS data. All created documents are labelled
 * development fixtures and are archived + deleted; the one temporary profile edit is restored.
 */
test.describe.configure({ mode: 'serial' });
// Runs in the dedicated 'cms' Playwright project, after the read-only suites (see playwright.config.ts).

function localEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m) out[m[1]!] = m[2]!;
  }
  return out;
}
const env = localEnv();

async function login(request: APIRequestContext): Promise<string> {
  const res = await request.post('/api/users/login', {
    data: { email: env.CMS_ADMIN_EMAIL, password: env.CMS_ADMIN_PASSWORD },
  });
  expect(res.status()).toBe(200);
  const cookie = res.headers()['set-cookie'] ?? '';
  const token = /payload-token=([^;]+)/.exec(cookie)?.[1];
  expect(token, 'auth cookie issued').toBeTruthy();
  expect(cookie).toMatch(/HttpOnly/i);
  expect(cookie).toMatch(/SameSite=Lax/i);
  return token!;
}

// Same-site requests carry the server's site origin (SITE_URL = the e2e server URL, see
// playwright.config); Payload's CSRF check ignores
// the auth cookie for any other origin.
const auth = (token: string, origin = `http://localhost:${process.env.E2E_PORT ?? 3217}`) => ({
  cookie: `payload-token=${token}`,
  origin,
});

test('T7 — no public sign-up: anonymous first-register and create are refused', async ({ request }) => {
  const first = await request.post('/api/users/first-register', {
    data: { email: 'probe@example.invalid', password: 'probe-password-123456' },
  });
  expect(first.status()).toBe(403);
  const create = await request.post('/api/users', {
    data: { email: 'probe@example.invalid', password: 'probe-password-123456' },
  });
  expect(create.status()).toBe(403);
});

test('T8 — anonymous API access is limited to public, published content', async ({ request }) => {
  expect((await request.get('/api/users')).status()).toBe(403);
  expect((await request.get('/api/audit-log')).status()).toBe(403);
  const res = await request.get('/api/projects?draft=true&limit=100');
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.docs.every((d: { _status: string }) => d._status === 'published')).toBe(true);
});

test('admin UI is private and never indexable', async ({ page, request }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login/);
  const res = await request.get('/admin/login');
  expect(res.headers()['x-robots-tag']).toMatch(/noindex/);
  // During the client-side /admin → /admin/login redirect the head can briefly hold the tag twice;
  // every robots tag present must say noindex (and there must be at least one).
  const robots = page.locator('meta[name="robots"]');
  await expect(robots.first()).toHaveAttribute('content', /noindex/);
  expect(
    await robots.evaluateAll((els) => els.every((e) => /noindex/.test(e.getAttribute('content') ?? ''))),
  ).toBe(true);
});

test('admin login page has no axe violations (WCAG 2 A/AA)', async ({ page }) => {
  await page.goto('/admin/login');
  await page.waitForSelector('form');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
});

test('T6 over REST — draft invisible, publish visible, archive hidden, delete only when archived', async ({
  request,
}) => {
  const token = await login(request);
  const slug = `cms-trial-project-e2e-${Date.now().toString(36)}`;
  const doc = {
    title: 'CMS Trial Project',
    slug,
    summary: 'Development Fixture used only by the Phase 2 e2e test.',
    seo: {
      title: 'CMS Trial Project — Development Fixture',
      description: 'Development fixture used only by automated CMS tests; never production content.',
    },
    translationStatus: 'approved',
  };
  const created = await request.post('/api/projects?draft=true&locale=en', {
    headers: auth(token),
    data: { ...doc, _status: 'draft' },
  });
  expect(created.status()).toBe(201);
  const id = (await created.json()).doc.id;
  const anonCount = async () =>
    (
      await (
        await request.get(`/api/projects?where[slug][equals]=${slug}&draft=true`, { headers: { cookie: '' } })
      ).json()
    ).totalDocs;
  try {
    expect(await anonCount()).toBe(0);
    // REST writes always name the locale (as the admin UI does); publishing sends the full document.
    expect(
      (
        await request.patch(`/api/projects/${id}?locale=en`, {
          headers: auth(token),
          data: { ...doc, _status: 'published' },
        })
      ).status(),
    ).toBe(200);
    expect(await anonCount()).toBe(1);
    expect((await request.delete(`/api/projects/${id}`, { headers: auth(token) })).status()).toBe(400);
    expect(
      (
        await request.patch(`/api/projects/${id}?locale=en`, {
          headers: auth(token),
          data: { archived: true },
        })
      ).status(),
    ).toBe(200);
    expect(await anonCount()).toBe(0);
  } finally {
    await request.patch(`/api/projects/${id}?draft=true`, { headers: auth(token), data: { archived: true } });
    expect((await request.delete(`/api/projects/${id}`, { headers: auth(token) })).status()).toBe(200);
  }
});

test('CSRF — an admin cookie sent from a foreign origin is not honoured', async ({ request }) => {
  const token = await login(request);
  const res = await request.post('/api/projects', {
    headers: auth(token, 'https://evil.example'),
    data: { title: 'CSRF probe', slug: `csrf-probe-${Date.now()}`, summary: 'x', _status: 'draft' },
  });
  expect(res.status()).toBe(403);
});

test('revalidation — a CMS publish updates the static public page without a rebuild', async ({
  request,
  page,
}) => {
  const token = await login(request);
  const original = 'Artificial Intelligence Engineer';
  const probe = 'Artificial Intelligence Engineer (revalidation probe)';
  await page.goto('/');
  await expect(page.locator('h1')).toContainText(original);
  try {
    const res = await request.post('/api/globals/profile?locale=en', {
      headers: auth(token),
      data: { title: probe, _status: 'published' },
    });
    expect(res.status()).toBe(200);
    await page.goto('/');
    await expect(page.locator('h1')).toContainText(probe);
  } finally {
    await request.post('/api/globals/profile?locale=en', {
      headers: auth(token),
      data: { title: original, _status: 'published' },
    });
  }
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText(`Yazan Al Samman — ${original}`);
});

test('signed revalidation endpoint rejects unsigned/forged requests and accepts a valid signature', async ({
  request,
}) => {
  const body = JSON.stringify({ sources: ['profile'] });
  expect(
    (
      await request.post('/api/internal/revalidate', {
        data: body,
        headers: { 'content-type': 'application/json' },
      })
    ).status(),
  ).toBe(401);
  const ts = Math.floor(Date.now() / 1000);
  const forged = await request.post('/api/internal/revalidate', {
    data: body,
    headers: {
      'content-type': 'application/json',
      'x-revalidate-timestamp': String(ts),
      'x-revalidate-signature': '0'.repeat(64),
    },
  });
  expect(forged.status()).toBe(401);
  const signature = createHmac('sha256', env.REVALIDATE_SECRET!).update(`${ts}.${body}`).digest('hex');
  const ok = await request.post('/api/internal/revalidate', {
    data: body,
    headers: {
      'content-type': 'application/json',
      'x-revalidate-timestamp': String(ts),
      'x-revalidate-signature': signature,
    },
  });
  expect(ok.status()).toBe(200);
  expect((await ok.json()).revalidated).toContain('cms:profile');
});

test('T7 — logout revokes the session server-side', async ({ request }) => {
  const token = await login(request);
  expect((await request.get('/api/users/me', { headers: auth(token) })).status()).toBe(200);
  await request.post('/api/users/logout', { headers: auth(token) });
  const me = await (await request.get('/api/users/me', { headers: auth(token) })).json();
  expect(me.user).toBeNull();
});
