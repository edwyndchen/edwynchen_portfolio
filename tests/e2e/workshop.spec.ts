import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('nav: Work, About, Contact, then a hairline and the Workshop as a plain link, marked current on its page', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop bar');
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.locator('.nav__links a')).toHaveText([/work/i, /about/i, /contact/i, /workshop/i]);
  await expect(nav.locator('.nav__rule')).toBeVisible();
  // same link style as the rest: no button frame
  expect(await nav.locator('.nav__workshop').evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe('0px');
  await page.goto('/workshop/');
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: /workshop/i })).toHaveAttribute('aria-current', 'page');
});

test('phone nav: Menu opens and closes all four links, Workshop included', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone bar');
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Menu' });
  await expect(page.locator('.nav__workshop')).toBeHidden();
  await expect(page.locator('.nav__links')).toBeHidden();
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.nav__links a')).toHaveText([/work/i, /about/i, /contact/i, /workshop/i]);
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
  await expect(page.locator('.nav__links')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test('Workshop lists entries as cards, with status, date and skills (drafts show in dev)', async ({ page }) => {
  await page.goto('/workshop/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Workshop');
  const cards = page.locator('[data-entry]');
  expect(await cards.count()).toBeGreaterThan(0);
  const first = cards.first();
  await expect(first.getByRole('heading', { level: 2 })).toBeVisible();
  await expect(first.locator('.wcard__status')).toHaveText(/On the easel|Fired|Sketch/);
  await expect(first.locator('time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
});

test('skills filter: toggles are real buttons, filter the cards and say how many show', async ({ page }) => {
  await page.goto('/workshop/');
  const cards = page.locator('[data-entry]');
  const total = await cards.count();
  test.skip(total < 2, 'needs two or more entries');
  const react = page.getByRole('button', { name: 'React' });
  await expect(react).toHaveAttribute('aria-pressed', 'false');
  await react.click();
  await expect(react).toHaveAttribute('aria-pressed', 'true');
  const shown = await cards.evaluateAll((els) => els.filter((e) => !(e as HTMLElement).hidden).length);
  expect(shown).toBeLessThan(total);
  await expect(page.locator('[data-count]')).toHaveText(`Showing ${shown} of ${total} pieces`);
  await react.click();
  await expect(page.locator('[data-entry]:not([hidden])')).toHaveCount(total);
});

test('Workshop has no axe violations', async ({ page }) => {
  await page.goto('/workshop/');
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(r.violations).toEqual([]);
});

test('contact: no form now (Ed, 2026-10-05), just the heading and icon links that name themselves', async ({ page }) => {
  await page.goto('/');
  const contact = page.locator('#contact');
  await expect(contact.locator('form')).toHaveCount(0);
  await expect(contact.getByRole('link', { name: /^Email / })).toHaveAttribute('href', /^mailto:/);
  await expect(contact.getByRole('link', { name: /LinkedIn/ })).toBeVisible();
});

test('Acknowledgement of Country sits below the footer, headed, with the Aboriginal flag', async ({ page }) => {
  await page.goto('/');
  const country = page.getByRole('complementary', { name: 'Acknowledgement of Country' });
  await expect(country).toContainText('Wurundjeri Woi-wurrung people of the Kulin Nation');
  await expect(country).toContainText('Elders, past and present');
  await expect(country.getByRole('img', { name: 'Australian Aboriginal flag' })).toBeVisible();
  await expect(country.getByRole('img', { name: 'Torres Strait Islander flag' })).toBeVisible();
  // it comes after the footer
  expect(await page.evaluate(() => {
    const f = document.querySelector('footer')!, c = document.querySelector('.country')!;
    return Boolean(f.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING);
  })).toBe(true);
});

test('the paint scroll is on the home page only; case studies keep just the line and the links', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#contact [data-paint]')).toHaveCount(1);
  const href = await page.locator('#work h3 a').first().getAttribute('href');
  await page.goto(href!);
  await expect(page.locator('#contact [data-paint]')).toHaveCount(0);
  await expect(page.locator('#contact').getByRole('link', { name: /^Email / })).toBeVisible();
});
