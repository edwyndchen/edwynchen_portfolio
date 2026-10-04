import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('site data has no unfilled placeholders', () => {
  expect(readFileSync('src/data/site.ts', 'utf8')).not.toContain('ED_SUPPLIED');
});

test('layout has landmarks, skip link and nav', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header nav')).toBeVisible();
  await expect(page.locator('main#main')).toHaveCount(1);
  await expect(page.locator('footer')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  for (const label of ['Work', 'About', 'Contact']) {
    // on phones these sit inside the closed Menu, so look past hidden ones
    await expect(page.getByRole('link', { name: label, exact: true, includeHidden: true }).first()).toBeAttached();
  }
});

test('body background is porcelain', async ({ page }) => {
  await page.goto('/');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe('rgb(250, 248, 242)'); // DS --surface-page #FAF8F2
});

test('every visible nav control is at least 44px wide and tall', async ({ page }) => {
  await page.goto('/');
  for (const a of await page.locator('.nav__links a:visible, .nav__menu:visible').all()) {
    const box = (await a.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});
