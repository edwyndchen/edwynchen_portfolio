import { expect, test } from '@playwright/test';

test('the home page carries no flora; it lives on the Workshop', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('img.flora')).toHaveCount(0);
});

test('flora spots are decorative and load', async ({ page }) => {
  await page.goto('/workshop/');
  const flora = page.locator('img.flora');
  expect(await flora.count()).toBeGreaterThanOrEqual(3);
  // (on phones the gum by the tools steps aside, so check the ones that show)
  for (const img of await page.locator('img.flora:visible').all()) {
    await expect(img).toHaveAttribute('alt', '');
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
});

test('flora never causes horizontal scroll', async ({ page }) => {
  await page.goto('/workshop/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('home card covers are decorative (the title link names the card) and load', async ({ page }) => {
  await page.goto('/');
  const covers = page.locator('img.work__cover');
  expect(await covers.count()).toBe(4);
  for (const img of await covers.all()) {
    await expect(img).toHaveAttribute('alt', '');
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
});

test('the case study cover keeps its descriptive alt text', async ({ page }) => {
  await page.goto('/work/form-guide-redesign/');
  expect(((await page.locator('img.case-hero__img').getAttribute('alt')) ?? '').length).toBeGreaterThan(20);
});

// art rule: no cropped edges. Each painting is trimmed tight, so its whole box must sit inside the viewport and
// inside every ancestor that clips it.
for (const path of ['/workshop/', '/work/form-guide-redesign/']) {
  for (const width of [320, 768, 1440]) {
    test(`flora is never cropped at ${width}px on ${path}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      const crops = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('img.flora')].flatMap((img) => {
          const r = img.getBoundingClientRect();
          if (r.width === 0) return []; // not shown at this size
          const out: string[] = [];
          const vw = document.documentElement.clientWidth;
          if (r.left < 0 || r.right > vw) out.push(`${img.getAttribute('src')} outside the viewport`);
          for (let a = img.parentElement; a; a = a.parentElement) {
            const cs = getComputedStyle(a);
            const clipsX = cs.overflowX !== 'visible';
            const clipsY = cs.overflowY !== 'visible';
            if (!clipsX && !clipsY) continue;
            const c = a.getBoundingClientRect();
            if (clipsX && (r.left < c.left - 0.5 || r.right > c.right + 0.5)) out.push(`${img.getAttribute('src')} cut by ${a.className}`);
            if (clipsY && (r.top < c.top - 0.5 || r.bottom > c.bottom + 0.5)) out.push(`${img.getAttribute('src')} cut by ${a.className}`);
          }
          return out;
        }),
      );
      expect(crops).toEqual([]);
    });
  }
}

test('the banksia sits clear of the story text, never behind it', async ({ page }) => {
  await page.goto('/work/form-guide-redesign/');
  const flora = (await page.locator('img.flora--case').boundingBox())!;
  const plate = (await page.locator('.case-body .prose p').first().boundingBox())!;
  const overlap =
    Math.max(0, Math.min(flora.x + flora.width, plate.x + plate.width) - Math.max(flora.x, plate.x)) *
    Math.max(0, Math.min(flora.y + flora.height, plate.y + plate.height) - Math.max(flora.y, plate.y));
  expect(overlap).toBe(0);
});
