import { test, expect } from '@playwright/test';

const cloudX = (page: import('@playwright/test').Page) =>
  page.locator('.hero__cloud').first().evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);

test('Pause motion: one press stops the endless animations, says so, and is remembered on the next page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Pause motion' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  // clouds drift while playing
  const a = await cloudX(page);
  await page.waitForTimeout(800);
  expect(await cloudX(page)).not.toBe(a);

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveClass(/motion-paused/);
  const b = await cloudX(page);
  await page.waitForTimeout(800);
  expect(await cloudX(page)).toBe(b);

  // remembered: the next page starts paused, before any script runs
  await page.goto('/workshop/');
  await expect(page.locator('html')).toHaveClass(/motion-paused/);
  await expect(page.getByRole('button', { name: 'Pause motion' })).toHaveAttribute('aria-pressed', 'true');

  // and it plays again
  await page.getByRole('button', { name: 'Pause motion' }).click();
  await expect(page.locator('html')).not.toHaveClass(/motion-paused/);
});

test('Pause motion is reachable on phones too, in the bar beside Menu', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone bar');
  await page.goto('/');
  const toggle = page.locator('.nav').getByRole('button', { name: 'Pause motion' });
  await expect(toggle).toBeVisible();
  const box = (await toggle.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});
