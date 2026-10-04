import { test, expect } from '@playwright/test';

test('page changes paint in with brush strokes when motion is allowed (cross-document view transition)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const rules = await page.evaluate(() =>
    [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules].map((r) => r.cssText); } catch { return []; } }).join('\n'),
  );
  expect(rules).toMatch(/@view-transition\s*{\s*navigation:\s*auto/);
  expect(rules).toContain('brush-reveal.png');
  // the nav keeps its own name so it is not painted over
  expect(await page.locator('.nav').evaluate((el) => getComputedStyle(el).viewTransitionName)).toBe('site-nav');
  const res = await page.request.get('/transitions/brush-reveal.png');
  expect(res.ok()).toBe(true);
});

test('reduced motion: no page transition at all', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.locator('.nav').evaluate((el) => getComputedStyle(el).viewTransitionName)).toBe('none');
});
