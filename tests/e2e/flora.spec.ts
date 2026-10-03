import { expect, test } from '@playwright/test';

test('flora spots are decorative and load', async ({ page }) => {
  await page.goto('/');
  const flora = page.locator('img.flora');
  expect(await flora.count()).toBeGreaterThanOrEqual(3);
  for (const img of await flora.all()) {
    await expect(img).toHaveAttribute('alt', '');
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
});

test('flora never causes horizontal scroll', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('case study covers load with alt text', async ({ page }) => {
  await page.goto('/');
  const covers = page.locator('img.work__cover');
  expect(await covers.count()).toBe(4);
  for (const img of await covers.all()) {
    expect(((await img.getAttribute('alt')) ?? '').length).toBeGreaterThan(20);
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
});
