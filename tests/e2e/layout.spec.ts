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
    await expect(page.getByRole('link', { name: label, exact: true }).first()).toBeAttached();
  }
});

test('body background is porcelain', async ({ page }) => {
  await page.goto('/');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe('rgb(251, 250, 247)');
});
