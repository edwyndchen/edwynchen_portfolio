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

test('reduced motion: clouds are spread across the scene, not stacked', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const clouds = page.locator('.hero__scene .hero__cloud');
  expect(await clouds.count()).toBe(9);
  const xs: number[] = [];
  for (let i = 0; i < 9; i++) {
    const box = await clouds.nth(i).boundingBox(); // null when hidden (extra clouds are hidden on mobile)
    if (box) xs.push(box.x);
  }
  expect(xs.length).toBeGreaterThan(3);
  expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(20);
});

test('mobile: tram stays inside the scene', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  // fill images must not be cropped (box aspect == artwork aspect), else %-positioned tram drifts off the bridge
  for (const el of await page.locator('.hero__fill').all()) {
    const { box, natural } = await el.evaluate((i: HTMLImageElement) => {
      const r = i.getBoundingClientRect();
      return { box: r.width / r.height, natural: i.naturalWidth / i.naturalHeight };
    });
    expect(Math.abs(box / natural - 1)).toBeLessThan(0.03);
  }
  const tram = (await page.locator('[data-tram]').boundingBox())!;
  const scene = (await page.locator('.hero__scene').boundingBox())!;
  expect(tram.x).toBeGreaterThanOrEqual(scene.x);
  expect(tram.y).toBeGreaterThanOrEqual(scene.y);
  expect(tram.x + tram.width).toBeLessThanOrEqual(scene.x + scene.width);
  expect(tram.y + tram.height).toBeLessThanOrEqual(scene.y + scene.height);
});

async function settleY(page: import('@playwright/test').Page) {
  return page.evaluate(() => Math.round(document.querySelector('.hero__scene')!.getBoundingClientRect().top + window.scrollY));
}
const farTop = (page: import('@playwright/test').Page) => page.locator('.hero__scene [data-depth]').first().evaluate((el) => el.getBoundingClientRect().top + window.scrollY);

test('desktop: layers start fanned out and collapse to the composed view on scroll', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.waitForTimeout(800);
  const melb = page.locator('.hero__scene [data-depth="0.5"]').first();
  const farStart = await farTop(page);
  const melbStart = (await melb.boundingBox())!.y + (await page.evaluate(() => window.scrollY));
  const y = await settleY(page);
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(1500);
  const farSettled = await farTop(page);
  const melbSettled = (await melb.boundingBox())!.y + (await page.evaluate(() => window.scrollY));
  expect(farStart).toBeGreaterThan(farSettled + 20);
  expect(Math.abs(melbStart - melbSettled)).toBeLessThan(4);
});

test('reduced motion: layers do not fan out', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const a = await farTop(page);
  await page.evaluate((v) => window.scrollTo(0, v), await settleY(page));
  await page.waitForTimeout(500);
  expect(Math.abs((await farTop(page)) - a)).toBeLessThan(1);
});
