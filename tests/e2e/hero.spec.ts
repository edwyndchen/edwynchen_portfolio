import { expect, test } from '@playwright/test';

const LAYERS = ['far', 'peaks', 'mid', 'tram'];

test('hero scene loads every layer and cloud', async ({ page }) => {
  await page.goto('/');
  for (const name of LAYERS) {
    const img = page.locator(`.hero__scene img[src="/hero/${name}.webp"]`);
    await expect(img).toHaveCount(1);
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
  expect(await page.locator('.hero__scene .hero__cloud').count()).toBe(9);
  await expect(page.locator('.hero__scene svg.hero__cross')).toHaveCount(1);
  await expect(page.locator('.hero__scene')).toHaveAttribute('aria-hidden', 'true');
});

test('copy sits above the artwork, not on top of it', async ({ page }) => {
  await page.goto('/');
  const copy = await page.locator('.hero__copy').boundingBox();
  const scene = await page.locator('.hero__scene').boundingBox();
  expect(copy && scene && copy.y + copy.height <= scene.y + 1).toBe(true);
});

test('tram moves when motion is allowed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const tram = page.locator('[data-tram]');
  await page.waitForTimeout(1500);
  const a = await tram.boundingBox();
  await page.waitForTimeout(1500);
  const b = await tram.boundingBox();
  expect(a && b && Math.abs(b.x - a.x)).toBeGreaterThan(3);
});

test('reduced motion: scene is still, tram parked and visible, copy visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const tram = page.locator('[data-tram]');
  const a = await tram.boundingBox();
  await page.waitForTimeout(1500);
  const b = await tram.boundingBox();
  expect(a?.x).toBe(b?.x);
  await expect(tram).toHaveCSS('opacity', '1');
  await expect(page.locator('#hero-title')).toHaveCSS('opacity', '1');
});
