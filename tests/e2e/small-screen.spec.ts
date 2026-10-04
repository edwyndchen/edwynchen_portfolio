import { expect, test } from '@playwright/test';

// Smallest common phone width: nothing should cause sideways scrolling.
for (const path of ['/', '/work/form-guide-redesign/']) {
  test(`no horizontal overflow at 320px on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('no horizontal overflow at 1440px with motion running', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  // step through the pinned About stage, where the cloud walls travel off the sides
  for (const f of [0.6, 1.2, 1.8, 2.6]) {
    await page.evaluate((f) => {
      const about = document.querySelector('#about') as HTMLElement;
      window.scrollTo(0, about.getBoundingClientRect().top + window.scrollY + window.innerHeight * f);
    }, f);
    await page.waitForTimeout(800);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  }
});
