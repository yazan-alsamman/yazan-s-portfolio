import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Phase 4 — public portfolio routes, read-only checks against the current (empty) CMS.
 * The e2e server runs a non-production SITE_ENV, where a content route without published
 * content renders a development notice and is noindex (production returns 404 — covered by
 * the unit-tested route gate and navigation logic).
 */

const ROUTES = ['/about', '/projects', '/experience', '/skills', '/certificates', '/cv', '/contact'];

test.describe('portfolio routes without content (development preview)', () => {
  for (const locale of ['', '/ar']) {
    for (const route of ROUTES) {
      test(`${locale}${route}: one H1, development notice, noindex, no overflow`, async ({ page }) => {
        const res = await page.goto(`${locale}${route}`);
        expect(res?.status()).toBe(200);
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
        await expect(page.getByText(/Development preview|معاينة تطوير/)).toBeVisible();
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  }

  test('empty routes are absent from the sitemap', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    for (const route of ROUTES) expect(xml).not.toContain(`${route}<`);
  });

  test('Arabic route is RTL with localized heading and metadata', async ({ page }) => {
    await page.goto('/ar/projects');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('h1')).toHaveText('المشاريع');
    await expect(page).toHaveTitle(/^المشاريع — /);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/ar\/projects$/);
  });

  test('unknown project slug is a localized 404', async ({ page }) => {
    const res = await page.goto('/projects/does-not-exist');
    expect(res?.status()).toBe(404);
  });

  for (const route of ['/projects', '/about']) {
    test(`${route} has no axe violations (WCAG 2.2 A/AA)`, async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });
  }
});
