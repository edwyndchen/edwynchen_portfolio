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
