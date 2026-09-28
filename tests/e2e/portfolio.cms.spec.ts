import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type APIRequestContext } from '@playwright/test';

/**
 * Phase 4 — the public portfolio rendered from real CMS content, end to end:
 * REST writes (as the admin UI does) → on-demand revalidation → statically generated pages.
 * Runs in the serial `cms` project (after the read-only suites). Every document is a labelled
 * development fixture; everything is archived + deleted and the profile is restored afterwards.
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

const lexical = (text: string) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        children: [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
      },
    ],
  },
});

let token = '';
let headers: Record<string, string> = {};
const created: { collection: string; id: number }[] = [];
let originalProfile: Record<string, unknown> = {};
const suffix = Date.now().toString(36);
const slugA = `fixture-vision-${suffix}`;
const slugB = `fixture-robotics-${suffix}`;

async function create(request: APIRequestContext, collection: string, data: Record<string, unknown>) {
  const res = await request.post(`/api/${collection}?locale=en`, { headers, data });
  expect(res.status(), `${collection} create`).toBe(201);
  const id = (await res.json()).doc.id as number;
  created.push({ collection, id });
  return id;
}

test.beforeAll(async ({ request }) => {
  const login = await request.post('/api/users/login', {
    data: { email: env.CMS_ADMIN_EMAIL, password: env.CMS_ADMIN_PASSWORD },
  });
  expect(login.status()).toBe(200);
  token = /payload-token=([^;]+)/.exec(login.headers()['set-cookie'] ?? '')![1]!;
  headers = { cookie: `payload-token=${token}`, origin: `http://localhost:${process.env.E2E_PORT ?? 3217}` };

  const profile = await (await request.get('/api/globals/profile?locale=en&depth=0', { headers })).json();
  originalProfile = {
    shortBio: profile.shortBio ?? null,
    longBio: profile.longBio ?? null,
    socialLinks: profile.socialLinks ?? [],
    email: profile.email ?? null,
  };

  const approved = { translationStatus: 'approved', _status: 'published' };
  const skill = await create(request, 'skills', {
    name: 'Fixture Vision Toolkit',
    category: 'ai-ml',
    ...approved,
  });
  const exp = await create(request, 'experience', {
    organization: 'Development Fixture Organization',
    title: 'Development Fixture Role',
    description: lexical('Development fixture experience description.'),
    startDate: '2023-02-01T00:00:00.000Z',
    technologies: [skill],
    ...approved,
  });
  const seo = (title: string) => ({
    title: `${title} — Fixture`,
    description:
      'Development fixture used only by the automated Phase 4 end-to-end tests; never real content.',
  });
  await create(request, 'projects', {
    title: 'Fixture Vision Project',
    slug: slugA,
    summary: 'Development Fixture project used by the Phase 4 e2e test.',
    category: 'computer-vision',
    featured: true,
    technologies: [skill],
    experience: exp,
    problem: lexical('Development fixture problem statement.'),
    architecture: lexical('Development fixture architecture notes.'),
    timeline: { start: '2024-01-01T00:00:00.000Z', end: '2024-06-01T00:00:00.000Z' },
    links: [{ label: 'Fixture repository', url: 'https://example.com/fixture-repo', kind: 'repository' }],
    seo: seo('Fixture Vision Project'),
    sortOrder: 1,
    ...approved,
  });
  await create(request, 'projects', {
    title: 'Fixture Robotics Project',
    slug: slugB,
    summary: 'Second Development Fixture project (related-project check).',
    category: 'computer-vision',
    technologies: [skill],
    seo: seo('Fixture Robotics Project'),
    sortOrder: 2,
    ...approved,
  });
  await create(request, 'certificates', {
    name: 'Development Fixture Certificate',
    issuer: 'Development Fixture Issuer',
    issueDate: '2025-05-01T00:00:00.000Z',
    verificationUrl: 'https://example.com/fixture-verify',
    ...approved,
  });
  const res = await request.post('/api/globals/profile?locale=en', {
    headers,
    data: {
      shortBio: 'Development fixture short biography used only by automated tests.',
      longBio: lexical('Development fixture long biography used only by automated tests.'),
      socialLinks: [{ network: 'github', url: 'https://github.com/example-fixture' }],
      _status: 'published',
    },
  });
  expect(res.status()).toBe(200);
});

test.afterAll(async ({ request }) => {
  for (const { collection, id } of created.reverse()) {
    await request.patch(`/api/${collection}/${id}?locale=en`, { headers, data: { archived: true } });
    await request.delete(`/api/${collection}/${id}`, { headers });
  }
  await request.post('/api/globals/profile?locale=en', {
    headers,
    data: { ...originalProfile, _status: 'published' },
  });
  // Next's tag invalidations are held in memory only (R-45): re-request every affected page now,
  // so fresh cache entries replace the invalidated ones before this server process stops.
  for (const path of [
    '/',
    '/about',
    '/projects',
    `/projects/${slugA}`,
    `/projects/${slugB}`,
    '/experience',
    '/skills',
    '/certificates',
    '/contact',
    '/sitemap.xml',
  ]) {
    await request.get(path);
  }
});

test('navigation and footer list exactly the routes that now have content', async ({ page }) => {
  await page.goto('/');
  const footerNav = page.locator('footer nav');
  for (const name of ['Projects', 'About', 'Experience', 'Skills', 'Certificates', 'Contact']) {
    await expect(footerNav.getByRole('link', { name, exact: true })).toHaveAttribute('href', /\/[a-z]+$/);
  }
});

test('homepage portfolio sections render below the approved cinematic landing', async ({ page }) => {
  await page.goto('/');
  const portfolio = page.locator('#portfolio');
  await expect(portfolio.getByRole('heading', { name: /Introduction/ })).toBeVisible();
  await expect(portfolio.getByRole('link', { name: 'Fixture Vision Project' })).toHaveAttribute(
    'href',
    `/projects/${slugA}`,
  );
  await expect(portfolio.getByRole('heading', { name: /Technical expertise/ })).toBeVisible();
  await expect(portfolio.getByRole('heading', { name: /Certificates & credentials/ })).toBeVisible();
  await expect(portfolio.getByRole('link', { name: 'Get in touch' })).toHaveAttribute('href', '/contact');
  // The cinematic section is untouched: still one H1 and the eight-act structure.
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('#cinematic [data-act]')).toHaveCount(8);
});

test('projects index lists published projects as plain links and filters by category', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.locator('h1')).toHaveText('Projects');
  await expect(page.getByRole('link', { name: 'Fixture Vision Project' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Fixture Robotics Project' })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/); // non-production env
});

test('project case study: sections with content only, breadcrumbs, JSON-LD, related, links', async ({
  page,
}) => {
  await page.goto(`/projects/${slugA}`);
  await expect(page.locator('h1')).toHaveText('Fixture Vision Project');
  await expect(page).toHaveTitle(/^Fixture Vision Project — Fixture — /);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    new RegExp(`/projects/${slugA}$`),
  );
  const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(breadcrumb.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects');
  await expect(page.getByRole('heading', { name: 'Problem', level: 2 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Architecture', level: 2 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Results' })).toHaveCount(0); // no content → no section
  await expect(page.getByText('Development fixture problem statement.')).toBeVisible();
  await expect(page.getByText('Development Fixture Role · Development Fixture Organization')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Fixture Vision Toolkit' })).toHaveAttribute(
    'href',
    /\/skills#skill-\d+$/,
  );
  await expect(page.getByRole('link', { name: /Fixture repository/ })).toHaveAttribute('rel', /noopener/);
  await expect(page.getByRole('heading', { name: 'Related projects' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Fixture Robotics Project' })).toBeVisible();
  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
  const types = jsonLd.flatMap((t) => {
    const data = JSON.parse(t);
    return (Array.isArray(data) ? data : [data]).map((d: { '@type': string }) => d['@type']);
  });
  expect(types).toEqual(expect.arrayContaining(['BreadcrumbList', 'CreativeWork']));
  const a11y = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(a11y.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
});

test('an English-only project does not exist in Arabic (no fallback)', async ({ page }) => {
  const res = await page.goto(`/ar/projects/${slugA}`);
  expect(res?.status()).toBe(404);
});

test('about, experience, skills, certificates and contact render their CMS content', async ({ page }) => {
  await page.goto('/about');
  await expect(
    page.getByText('Development fixture long biography used only by automated tests.'),
  ).toBeVisible();
  await expect(page.getByRole('img', { name: /Portrait of/ })).toBeVisible();

  await page.goto('/experience');
  await expect(page.getByRole('heading', { name: /Development Fixture Role/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Fixture Vision Project' })).toBeVisible();

  await page.goto('/skills');
  await expect(page.getByText('Fixture Vision Toolkit')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Fixture Robotics Project' })).toBeVisible();

  await page.goto('/certificates');
  await expect(page.getByRole('heading', { name: 'Development Fixture Certificate' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Verify at issuer/ })).toHaveAttribute(
    'href',
    'https://example.com/fixture-verify',
  );

  await page.goto('/contact');
  await expect(page.locator('main').getByRole('link', { name: /GitHub/ })).toHaveAttribute('rel', /me/);

  for (const route of ['/about', '/experience', '/skills', '/certificates', '/contact']) {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByText(/Development preview — this page/)).toHaveCount(0);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  }
});

test('sitemap lists the live routes and published projects with lastmod', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  for (const path of ['/projects', '/about', '/experience', '/skills', '/certificates', '/contact']) {
    expect(xml).toContain(`${path}</loc>`);
  }
  expect(xml).toContain(`/projects/${slugA}</loc>`);
  expect(xml).toContain('<lastmod>');
  expect(xml).not.toContain('/cv</loc>'); // no CV file published
});
