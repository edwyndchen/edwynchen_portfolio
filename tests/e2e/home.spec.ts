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
  // reduced motion: skips the hero fade-in so axe never samples mid-fade colours
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});

test('hero copy: name, role line, intro, no eyebrow', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#hero-title')).toHaveText('Edwyn Chen');
  await expect(page.locator('.hero__role')).toHaveText("I'm a product designer and design systems specialist.");
  await expect(page.locator('.hero__line')).toContainText('bounce rate down 52%');
  await expect(page.locator('.hero__copy .label')).toHaveCount(0);
});

test('nav brand is the wordmark with an accessible name', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Edwyn Chen, home' })).toBeVisible();
  await expect(page.locator('.nav__brand svg.logo')).toHaveCount(1);
});

test('footer has the Southern Cross and no "Made in Melbourne"', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer')).not.toContainText('Made in Melbourne');
  await expect(page.locator('footer svg[aria-hidden="true"]')).toHaveCount(1);
});
