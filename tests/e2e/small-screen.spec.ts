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

test('About placeholder character uses the brush calligraphy font', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.about__placeholder')).toHaveCSS('font-family', /Ma Shan Zheng/);
});
