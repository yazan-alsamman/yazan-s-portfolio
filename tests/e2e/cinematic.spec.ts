import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Phase 3 — cinematic landing. The WebGL layer is an enhancement: every assertion about
 * content is made against the HTML layer, and every failure mode must end in the static
 * composition (never a blank stage).
 */

const root = (page: Page) => page.locator('#cinematic');

async function scrollToProgress(page: Page, p: number) {
  await page.evaluate((p) => {
    const r = document.getElementById('cinematic')!;
    window.scrollTo(0, r.offsetTop + p * r.offsetHeight - window.innerHeight / 2);
  }, p);
}

test.describe('cinematic landing — content layer', () => {
  test('identity, act headings and portrait are real HTML (crawlable, no canvas-only text)', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('#cinematic h1')).toContainText('Yazan Al Samman');
    await expect(page.locator('#cinematic h2')).toHaveText([
      /Computation/,
      /Intelligence/,
      /Engineering/,
      /Systems/,
      /Human intent/,
      /The work/,
    ]);
    // Portrait stays in the accessibility tree in every mode, with the owner's name as alt.
    await expect(page.getByRole('img', { name: 'Portrait of Yazan Al Samman' })).toHaveCount(1);
    // The stage (static composition + canvas) is decorative.
    await expect(page.locator('.cine-stage')).toHaveAttribute('aria-hidden', 'true');
  });

  test('the server HTML already contains the identity before any JS runs', async ({ request }) => {
    const html = await (await request.get('/')).text();
    expect(html).toContain('id="home-title"');
    expect(html).toContain('Yazan Al Samman');
    expect(html).toContain('Every system begins as a signal.');
    expect(html).toContain('data-cinematic="pending"');
  });

  test('skip-intro link jumps past the scroll narrative to the portfolio', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Skip the intro' }).click();
    await expect(page).toHaveURL(/#portfolio$/);
    const top = await page.locator('#portfolio').evaluate((el) => el.getBoundingClientRect().top);
    expect(top).toBeLessThan(200);
  });

  test('skip-intro link is reachable by keyboard right after the header controls', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'keyboard order checked on desktop');
    await page.goto('/');
    const skip = page.getByRole('link', { name: 'Skip the intro' });
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      if (await skip.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
  });
});

test.describe('cinematic landing — WebGL enhancement', () => {
  test('WebGL canvas mounts lazily, reports stats and never blocks scrolling', async ({ page }) => {
    // GPU-bound: shares one GPU with every parallel worker, so it gets a wider budget than the
    // 30 s default (measured 8–9 s alone; exceeded 30 s once under full-suite load, Phase 4).
    test.setTimeout(60_000);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto('/');
    await expect(root(page)).toHaveAttribute('data-cinematic', 'webgl', { timeout: 15_000 });
    await expect(page.locator('#cinematic canvas')).toHaveCount(1);
    await scrollToProgress(page, 0.5);
    // Stats are published every 120 frames: wait for a snapshot taken after the scroll.
    await expect
      .poll(() => page.evaluate(() => window.__cinematic?.p ?? 0), { timeout: 15_000 })
      .toBeGreaterThan(0.3);
    const stats = await page.evaluate(() => window.__cinematic!);
    expect(stats.drawCalls).toBeGreaterThan(0);
    expect(stats.drawCalls).toBeLessThan(60);
    expect(stats.triangles).toBeLessThan(50_000);
    expect(errors).toEqual([]);
  });

  test('the 3D chunk is not part of the initial page load', async ({ request }) => {
    // Server HTML only: at runtime the lazy chunk is (correctly) injected after idle time.
    const html = await (await request.get('/')).text();
    const referenced = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]!);
    expect(referenced.length).toBeGreaterThan(0);
    for (const src of referenced) {
      const body = await (await request.get(src)).text();
      expect(body.includes('WebGLRenderer'), `${src} must not bundle three.js`).toBe(false);
    }
  });
});

test.describe('cinematic landing — fallbacks', () => {
  test('reduced motion: static composition, no canvas, visible HTML portrait', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto('/');
    await expect(root(page)).toHaveAttribute('data-cinematic', 'static');
    await page.waitForTimeout(2500); // past the idle-time loader window
    await expect(page.locator('#cinematic canvas')).toHaveCount(0);
    await expect(page.locator('.cine-static')).toBeVisible();
    await scrollToProgress(page, 0.75);
    await expect(page.getByRole('img', { name: 'Portrait of Yazan Al Samman' })).toBeInViewport();
    await context.close();
  });

  test('WebGL unavailable: static composition instead of a blank canvas', async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        ...rest: unknown[]
      ) {
        return /webgl/.test(type)
          ? null
          : (original as (...a: unknown[]) => unknown).call(this, type, ...rest);
      } as typeof original;
    });
    await page.goto('/');
    await expect(root(page)).toHaveAttribute('data-cinematic', 'static');
    await page.waitForTimeout(2500);
    await expect(page.locator('#cinematic canvas')).toHaveCount(0);
    await expect(page.locator('.cine-static')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('3D chunk failing to load leaves the static composition in place', async ({ page }) => {
    // The chunk that bundles three.js fails (simulated network failure); everything else loads.
    await page.route('**/_next/static/chunks/**', async (route) => {
      const response = await route.fetch();
      const body = await response.text();
      if (body.includes('WebGLRenderer')) return route.abort('failed');
      return route.fulfill({ response, body });
    });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    await expect(page.locator('#cinematic canvas')).toHaveCount(0);
    await expect(page.locator('.cine-static')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    await expect(root(page)).toHaveAttribute('data-cinematic', 'static');
  });
});

test.describe('cinematic landing — layout & accessibility', () => {
  for (const path of ['/', '/ar']) {
    test(`no horizontal overflow across the narrative (${path})`, async ({ page }) => {
      await page.goto(path);
      for (const p of [0, 0.3, 0.5, 0.75, 0.95]) {
        await scrollToProgress(page, p);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `overflow at p=${p}`).toBeLessThanOrEqual(0);
      }
    });
  }

  test('axe: cinematic section in static mode (reduced motion) has no violations', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .include('#cinematic')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
    await context.close();
  });
});
