import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('home has one h1 and the three sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  for (const id of ['work', 'about', 'contact']) await expect(page.locator(`section#${id}`)).toBeAttached();
});

test('work section links to all four case studies in order', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('#work a[href^="/work/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  expect(hrefs).toEqual([
    '/work/form-guide-redesign/',
    '/work/punters-design-system/',
    '/work/eonx-design-system/',
    '/work/pay-by-account/',
  ]);
});

test('contact has a mailto link', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#contact a[href^="mailto:"]')).toBeVisible();
});

test('home has no axe violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});
