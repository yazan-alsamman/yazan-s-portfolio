import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe('document foundation', () => {
  test('English home: lang/dir, single H1 with confirmed identity, canonical', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Yazan Al Samman — Artificial Intelligence Engineer');
    await expect(page).toHaveTitle('Yazan Al Samman — Artificial Intelligence Engineer');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('main#main')).toHaveCount(1);
  });

  test('Arabic home: lang="ar" dir="rtl", confirmed Arabic identity, no English fallback', async ({
    page,
  }) => {
    await page.goto('/ar');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('يزن السمان — مهندس ذكاء صنعي');
    await expect(page).toHaveTitle('يزن السمان — مهندس ذكاء صنعي');
    await expect(page.locator('body')).not.toContainText('TODO: OWNER INPUT REQUIRED');
    // Copy review pending (D-9): Arabic must not be indexable or advertised yet.
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('English page does not advertise Arabic via hreflang while Arabic is unpublishable', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveCount(0);
  });

  test('/en permanently redirects to the unprefixed canonical URL', async ({ request }) => {
    const response = await request.get('/en', { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers()['location']).toBe('/');
  });

  test('unknown routes return a localized, noindex 404', async ({ page }) => {
    const response = await page.goto('/ar/does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
});

test.describe('keyboard & navigation', () => {
  test('skip link is the first tab stop and moves focus to main', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test('language switch keeps the page and flips direction', async ({ page, isMobile }) => {
    await page.goto('/');
    if (isMobile) {
      await page.getByRole('button', { name: 'Menu' }).click();
    }
    await page.locator('a[hreflang="ar"]:visible').first().click();
    await expect(page).toHaveURL(/\/ar$/);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('theme toggle switches and persists across reloads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: 'Switch to light theme' }).first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});

test.describe('mobile menu (native dialog)', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile only');

  for (const path of ['/', '/ar']) {
    test(`opens, traps focus, closes with Escape and restores focus (${path})`, async ({ page }) => {
      await page.goto(path);
      const trigger = page.locator('button[aria-haspopup="dialog"]');
      await trigger.click();
      const dialog = page.locator('dialog.menu-dialog');
      await expect(dialog).toBeVisible();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      // Focus must be inside the dialog.
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  }
});

test.describe('responsive integrity', () => {
  for (const width of [320, 375, 430, 768, 1024, 1440, 1920]) {
    for (const path of ['/', '/ar', '/design-system', '/ar/design-system']) {
      test(`no horizontal overflow at ${width}px on ${path}`, async ({ page, isMobile }) => {
        test.skip(isMobile, 'viewport matrix runs on the desktop project');
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        await expectNoHorizontalOverflow(page);
      });
    }
  }
});

test.describe('font-loading resilience', () => {
  for (const path of ['/', '/ar']) {
    test(`no horizontal overflow at 320px with web fonts blocked (${path})`, async ({ page, isMobile }) => {
      test.skip(isMobile, 'runs on the desktop project');
      await page.route('**/*.woff2', (route) => route.abort());
      await page.setViewportSize({ width: 320, height: 700 });
      await page.goto(path, { waitUntil: 'networkidle' });
      await expectNoHorizontalOverflow(page);
    });
  }
});

test.describe('reduced motion', () => {
  test('transitions collapse when prefers-reduced-motion is set', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/design-system');
    const duration = await page
      .getByRole('button', { name: 'Primary action' })
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(parseFloat(duration)).toBeLessThan(0.001);
  });
});

test.describe('accessibility (axe, WCAG 2.2 A/AA rules)', () => {
  for (const path of ['/', '/ar', '/design-system', '/ar/design-system']) {
    for (const theme of ['dark', 'light'] as const) {
      test(`${path} — ${theme} theme has no axe violations`, async ({ page }) => {
        await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
        await page.goto(path);
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        const summary = results.violations.map(
          (v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s) — ${v.nodes[0]?.target}`,
        );
        expect(summary).toEqual([]);
      });
    }
  }
});
