import { expect, test } from '@playwright/test';

test('home page loads with the site title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Edwyn Chen/);
});

test('dev server shows no error overlay or page errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.waitForTimeout(2000);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  expect(errors).toEqual([]);
});
