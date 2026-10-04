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

test('hero copy: name, one line on what drives him, no intro paragraph, no eyebrow', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#hero-title')).toHaveText('Edwyn Chen');
  await expect(page.locator('.hero__role')).toHaveText('Melbourne-based product designer making the world more accessible and beautiful, one screen at a time.');
  await expect(page.locator('.hero__line')).toHaveCount(0);
  await expect(page.locator('.hero__copy .label')).toHaveCount(0);
});

test('nav brand is the wordmark (the brush mark alone on phones) with an accessible name', async ({ page, isMobile }) => {
  await page.goto('/');
  await expect(page.locator('header').getByRole('link', { name: 'Edwyn Chen, home' })).toBeVisible();
  // exactly one of the two drawings shows: the full wordmark, or on phones (four nav links) the mark alone
  await expect(page.locator('.nav__brand svg.logo:visible')).toHaveCount(1);
  await expect(page.locator(isMobile ? '.nav__brand svg.logo--mark' : '.nav__brand svg.nav__logo')).toBeVisible();
});

test('footer: summary, Southern Cross, legal links and back to top on the copyright line', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  await expect(footer).not.toContainText('Made in Melbourne');
  await expect(footer).toContainText('Product designer making the world more accessible and beautiful one screen at a time.');
  await expect(footer.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('href', 'https://www.linkedin.com/in/edwynchen/');
  await expect(footer.getByRole('link', { name: /Behance/ })).toHaveAttribute('href', 'https://www.behance.net/edwynchen');
  await expect(footer.locator('.footer__cross')).toHaveAttribute('aria-hidden', 'true');
  const base = footer.locator('.footer__base');
  await expect(base).toContainText('© ');
  await expect(base.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute('href', '/privacy/');
  await expect(base.getByRole('link', { name: 'Terms of use' })).toHaveAttribute('href', '/terms/');
  await base.getByRole('link', { name: /Back to top/ }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test('privacy and terms pages exist and read plainly', async ({ page }) => {
  for (const [path, h] of [['/privacy/', 'Privacy policy'], ['/terms/', 'Terms of use']]) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(h);
    await expect(page.locator('.legal__updated')).toContainText('Last updated');
  }
});

test('hovering a case study plate changes its rim, nothing lifts or zooms', async ({ page, isMobile }) => {
  test.skip(isMobile, 'hover');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const plate = page.locator('.work__plate').first();
  const rest = await plate.evaluate((el) => getComputedStyle(el).outlineColor);
  await plate.scrollIntoViewIfNeeded();
  await plate.hover();
  await expect.poll(() => plate.evaluate((el) => getComputedStyle(el).outlineColor)).not.toBe(rest);
  await expect(plate.locator('.work__cover')).toHaveCSS('transform', 'none');
  const shadow = await plate.evaluate((el) => getComputedStyle(el).boxShadow);
  await page.mouse.move(0, 0);
  await expect.poll(() => plate.evaluate((el) => getComputedStyle(el).boxShadow)).toBe(shadow);
});
