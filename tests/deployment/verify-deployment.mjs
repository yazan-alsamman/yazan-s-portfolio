/**
 * T14 — production deployment verification (Phase 2; Phase 9: security headers, media policy).
 *
 * Runs against a DEPLOYED instance through its public reverse proxy (not the app port):
 *   BASE_URL=https://host  HTTP_URL=http://host  APP_CONTAINER=<docker name>  \
 *   CMS_ADMIN_EMAIL=… CMS_ADMIN_PASSWORD=…  node tests/deployment/verify-deployment.mjs
 *
 * Every created document is a labelled development fixture and is archived + deleted; the one
 * temporary profile edit is restored. Exits non-zero if any check fails.
 */
import { execFileSync } from 'node:child_process';
import { chromium, request as pwRequest } from '@playwright/test';
import sharp from 'sharp';

const BASE = process.env.BASE_URL;
const HTTP = process.env.HTTP_URL;
const CONTAINER = process.env.APP_CONTAINER;
const EMAIL = process.env.CMS_ADMIN_EMAIL;
const PASSWORD = process.env.CMS_ADMIN_PASSWORD;
if (!BASE || !EMAIL || !PASSWORD)
  throw new Error('BASE_URL, CMS_ADMIN_EMAIL and CMS_ADMIN_PASSWORD are required');

const results = [];
async function check(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, ok: true, detail: detail ?? '' });
  } catch (error) {
    results.push({ name, ok: false, detail: error instanceof Error ? error.message : String(error) });
  }
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
const docker = (...args) => execFileSync('docker', args, { encoding: 'utf8' }).trim();

const api = await pwRequest.newContext({ baseURL: BASE, ignoreHTTPSErrors: true, maxRedirects: 0 });
const browser = await chromium.launch({ channel: 'chrome' });
const page = await (await browser.newContext({ ignoreHTTPSErrors: true })).newPage();

// ---------- Runtime platform ----------
if (CONTAINER) {
  await check('container runs Linux + the intended production command', () => {
    const os = docker('exec', CONTAINER, 'uname', '-sm');
    const cmd = docker('inspect', '-f', '{{json .Config.Cmd}} user={{.Config.User}}', CONTAINER);
    const env = docker('exec', CONTAINER, 'sh', '-c', 'echo NODE_ENV=$NODE_ENV node=$(node -v)');
    assert(os.startsWith('Linux'), `not Linux: ${os}`);
    assert(
      cmd.includes('"node","server.js"') && cmd.includes('user=node'),
      `unexpected command/user: ${cmd}`,
    );
    assert(env.includes('NODE_ENV=production'), env);
    return `${os} | ${cmd} | ${env}`;
  });
}

// ---------- Reverse proxy & status codes ----------
if (HTTP) {
  await check('HTTP → HTTPS redirect at the proxy', async () => {
    const res = await (await pwRequest.newContext({ maxRedirects: 0 })).get(`${HTTP}/`);
    assert(
      res.status() === 301 && (res.headers().location ?? '').startsWith('https://'),
      `got ${res.status()} ${res.headers().location}`,
    );
    return `${res.status()} → ${res.headers().location}`;
  });
}

await check('public homepage 200 via HTTPS proxy, CMS-backed H1, indexable, https canonical', async () => {
  const res = await page.goto(`${BASE}/`);
  assert(res.status() === 200, `status ${res.status()}`);
  const h1 = (await page.locator('h1').innerText()).replace(/\s+/g, ' ').trim();
  assert(h1 === 'Yazan Al Samman — Artificial Intelligence Engineer', `H1: ${h1}`);
  const robots = await page.locator('meta[name="robots"]').getAttribute('content');
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  assert(robots === 'index, follow', `robots ${robots}`);
  assert(canonical === BASE, `canonical ${canonical}`);
  return `H1="${h1}" robots=${robots} canonical=${canonical}`;
});

await check(
  'expected status codes: /ar 404 (copy-review gate), /en 308, unknown 404, robots/sitemap 200',
  async () => {
    const codes = {};
    for (const path of ['/ar', '/en', '/does-not-exist', '/robots.txt', '/sitemap.xml', '/design-system']) {
      codes[path] = (await api.get(path)).status();
    }
    assert(
      codes['/ar'] === 404 && codes['/en'] === 308 && codes['/does-not-exist'] === 404,
      JSON.stringify(codes),
    );
    assert(
      codes['/robots.txt'] === 200 && codes['/sitemap.xml'] === 200 && codes['/design-system'] === 404,
      JSON.stringify(codes),
    );
    const robots = await (await api.get('/robots.txt')).text();
    assert(
      robots.includes('Allow: /') &&
        robots.includes('Disallow: /admin') &&
        robots.includes(`Sitemap: ${BASE}/sitemap.xml`),
      robots,
    );
    return JSON.stringify(codes);
  },
);

// Phase 9: headers set by the app (src/lib/security-headers.ts) and HSTS by the TLS proxy.
await check('security headers on public pages, the admin and the API', async () => {
  const seen = [];
  for (const path of ['/', '/projects', '/admin/login', '/api/users/me']) {
    const h = (await api.get(path)).headers();
    const csp = h['content-security-policy'] ?? '';
    assert(
      csp.includes("default-src 'self'") && csp.includes("frame-ancestors 'none'"),
      `${path} CSP: ${csp}`,
    );
    assert(!csp.includes('unsafe-eval'), `${path} CSP allows eval`);
    assert(h['x-content-type-options'] === 'nosniff', `${path} nosniff`);
    assert(h['x-frame-options'] === 'DENY', `${path} X-Frame-Options`);
    assert(h['referrer-policy'] === 'strict-origin-when-cross-origin', `${path} Referrer-Policy`);
    assert((h['permissions-policy'] ?? '').includes('camera=()'), `${path} Permissions-Policy`);
    if (BASE.startsWith('https://'))
      assert(/max-age=\d{7,}/.test(h['strict-transport-security'] ?? ''), `${path} HSTS`);
    assert(!h['x-powered-by'], `${path} X-Powered-By leaks the framework`);
    seen.push(path);
  }
  return `ok on ${seen.join(', ')}`;
});

// ---------- Admin protection & first-user fix ----------
await check('admin UI reachable but protected and noindex', async () => {
  const res = await api.get('/admin');
  const login = await api.get('/admin/login');
  assert([302, 307].includes(res.status()) || res.status() === 200, `admin ${res.status()}`);
  await page.goto(`${BASE}/admin`);
  await page.waitForURL(/\/admin\/login/);
  assert(/noindex/.test(login.headers()['x-robots-tag'] ?? ''), 'missing X-Robots-Tag');
  return `/admin → ${page.url().replace(BASE, '')}, X-Robots-Tag=${login.headers()['x-robots-tag']}`;
});

await check('first-user signup fix effective: anonymous first-register/create → 403', async () => {
  const a = await api.post('/api/users/first-register', {
    data: { email: 'probe@example.invalid', password: 'probe-password-123456' },
  });
  const b = await api.post('/api/users', {
    data: { email: 'probe@example.invalid', password: 'probe-password-123456' },
  });
  const c = await api.get('/api/users');
  assert(
    a.status() === 403 && b.status() === 403 && c.status() === 403,
    `${a.status()} ${b.status()} ${c.status()}`,
  );
  return `first-register=${a.status()} create=${b.status()} list=${c.status()}`;
});

// ---------- Authentication ----------
let token;
const headers = () => ({ cookie: `payload-token=${token}`, origin: BASE });
await check('authentication: login issues a Secure, HttpOnly, SameSite=Lax cookie', async () => {
  const res = await api.post('/api/users/login', { data: { email: EMAIL, password: PASSWORD } });
  assert(res.status() === 200, `login ${res.status()}`);
  const cookie = res.headers()['set-cookie'] ?? '';
  token = /payload-token=([^;]+)/.exec(cookie)?.[1];
  assert(
    token && /Secure/.test(cookie) && /HttpOnly/i.test(cookie) && /SameSite=Lax/i.test(cookie),
    `cookie flags: ${cookie.replace(/payload-token=[^;]+/, 'payload-token=***')}`,
  );
  return 'Secure; HttpOnly; SameSite=Lax';
});

// ---------- Draft isolation, publishing ----------
const slug = `cms-trial-project-t14-${Date.now().toString(36)}`;
const doc = {
  title: 'CMS Trial Project',
  slug,
  summary: 'Development Fixture used only by the Phase 2 T14 deployment verification.',
  seo: {
    title: 'CMS Trial Project — Development Fixture',
    description: 'Development fixture used only by automated deployment checks; never production content.',
  },
  translationStatus: 'approved',
};
let projectId;
const anonCount = async () =>
  (await (await api.get(`/api/projects?where[slug][equals]=${slug}&draft=true`)).json()).totalDocs;
await check('draft content is not publicly exposed; publishing makes it public', async () => {
  const created = await api.post('/api/projects?draft=true&locale=en', {
    headers: headers(),
    data: { ...doc, _status: 'draft' },
  });
  assert(created.status() === 201, `create ${created.status()}`);
  projectId = (await created.json()).doc.id;
  const beforePublish = await anonCount();
  const pub = await api.patch(`/api/projects/${projectId}?locale=en`, {
    headers: headers(),
    data: { ...doc, _status: 'published' },
  });
  const afterPublish = await anonCount();
  assert(
    beforePublish === 0 && pub.status() === 200 && afterPublish === 1,
    `draft visible=${beforePublish} publish=${pub.status()} after=${afterPublish}`,
  );
  return `anonymous sees draft: ${beforePublish}; after publish: ${afterPublish}`;
});

await check('CSRF: admin cookie from a foreign origin is rejected', async () => {
  const res = await api.post('/api/projects?locale=en', {
    headers: { cookie: `payload-token=${token}`, origin: 'https://evil.example' },
    data: { ...doc, slug: `${slug}-csrf`, _status: 'draft' },
  });
  assert(res.status() === 403, `got ${res.status()}`);
  return `status ${res.status()}`;
});

// ---------- Revalidation ----------
await check('revalidation: CMS publish updates the static homepage without rebuild/restart', async () => {
  const original = 'Artificial Intelligence Engineer';
  const probe = 'Artificial Intelligence Engineer (T14 revalidation probe)';
  try {
    const res = await api.post('/api/globals/profile?locale=en', {
      headers: headers(),
      data: { title: probe, _status: 'published' },
    });
    assert(res.status() === 200, `update ${res.status()}`);
    await page.goto(`${BASE}/`);
    const h1 = await page.locator('h1').innerText();
    assert(h1.includes(probe), `H1 not updated: ${h1}`);
  } finally {
    await api.post('/api/globals/profile?locale=en', {
      headers: headers(),
      data: { title: original, _status: 'published' },
    });
  }
  await page.goto(`${BASE}/`);
  const restored = (await page.locator('h1').innerText()).replace(/\s+/g, ' ').trim();
  assert(restored === `Yazan Al Samman — ${original}`, `not restored: ${restored}`);
  return 'probe title visible after publish; original restored';
});

// ---------- Media on the persistent volume ----------
let mediaId;
let mediaUrl;
await check('media upload through the proxy is served from the volume', async () => {
  const png = await sharp({
    create: { width: 64, height: 64, channels: 3, background: { r: 13, g: 17, b: 23 } },
  })
    .png()
    .toBuffer();
  const res = await api.post('/api/media?locale=en', {
    headers: headers(),
    multipart: {
      file: { name: 'fixture.png', mimeType: 'image/png', buffer: png },
      _payload: JSON.stringify({ alt: 'Development Fixture image (T14)' }),
    },
  });
  assert(res.status() === 201, `upload ${res.status()} ${await res.text()}`);
  const body = await res.json();
  mediaId = body.doc.id;
  // Phase 6 (ADR-008): public pages use re-encoded WebP derivatives; the uploaded original is
  // private (404 for anonymous requests). Phase 9: this check used to fetch the original.
  mediaUrl = body.doc.sizes?.thumbnail?.url;
  assert(mediaUrl, `no thumbnail derivative: ${JSON.stringify(body.doc.sizes)}`);
  const anonymous = await pwRequest.newContext({ ignoreHTTPSErrors: true });
  const file = await anonymous.get(mediaUrl);
  assert(
    file.status() === 200 && (file.headers()['content-type'] ?? '').startsWith('image/webp'),
    `derivative ${file.status()} ${file.headers()['content-type']}`,
  );
  const original = await anonymous.get(body.doc.url);
  assert(original.status() === 404, `anonymous original ${original.status()} (must stay private)`);
  return `${mediaUrl} → 200 ${file.headers()['content-type']}; original → 404 anonymously`;
});

if (CONTAINER && mediaUrl) {
  await check('media persists across a container restart (volume)', async () => {
    docker('restart', CONTAINER);
    for (let i = 0; i < 60; i++) {
      if ((await api.get('/').catch(() => null))?.status() === 200) break;
      await new Promise((r) => setTimeout(r, 1000));
    }
    const file = await (await pwRequest.newContext({ ignoreHTTPSErrors: true })).get(mediaUrl);
    assert(file.status() === 200, `after restart ${file.status()}`);
    return `after restart ${mediaUrl} → 200`;
  });
}

// ---------- Cleanup (archive → delete) ----------
await check('cleanup: fixtures archived then deleted (delete refused before archive)', async () => {
  const early = await api.delete(`/api/projects/${projectId}`, { headers: headers() });
  await api.patch(`/api/projects/${projectId}?locale=en&draft=true`, {
    headers: headers(),
    data: { archived: true },
  });
  const del = await api.delete(`/api/projects/${projectId}`, { headers: headers() });
  let mediaDel = 'n/a';
  if (mediaId) {
    await api.patch(`/api/media/${mediaId}?locale=en`, { headers: headers(), data: { archived: true } });
    mediaDel = String((await api.delete(`/api/media/${mediaId}`, { headers: headers() })).status());
  }
  assert(
    early.status() === 400 && del.status() === 200 && mediaDel === '200',
    `early=${early.status()} delete=${del.status()} media=${mediaDel}`,
  );
  return `early delete=${early.status()}, project delete=${del.status()}, media delete=${mediaDel}`;
});

// ---------- Logout ----------
await check('logout revokes the session', async () => {
  // A restart invalidates nothing server-side for sessions in the DB; log in fresh to test logout.
  const res = await api.post('/api/users/login', { data: { email: EMAIL, password: PASSWORD } });
  token = /payload-token=([^;]+)/.exec(res.headers()['set-cookie'] ?? '')?.[1];
  const before = await (await api.get('/api/users/me', { headers: headers() })).json();
  await api.post('/api/users/logout', { headers: headers() });
  const after = await (await api.get('/api/users/me', { headers: headers() })).json();
  assert(
    before.user && after.user === null,
    `before=${Boolean(before.user)} after=${JSON.stringify(after.user)}`,
  );
  return 'session valid before logout, null after';
});

await browser.close();
await api.dispose();

const failed = results.filter((r) => !r.ok);
for (const r of results)
  console.log(`${r.ok ? 'PASS' : 'FAIL'} | ${r.name}${r.detail ? ` | ${r.detail}` : ''}`);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
