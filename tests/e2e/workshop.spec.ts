import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('nav: Work, About, Contact, then the Workshop as its own button, marked current on its page', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop bar');
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.locator('.nav__links a')).toHaveText([/work/i, /about/i, /contact/i]);
  await expect(nav.locator('.nav__workshop')).toHaveText(/workshop/i);
  await page.goto('/workshop/');
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: /workshop/i })).toHaveAttribute('aria-current', 'page');
});

test('phone nav: Menu opens and closes the page links, Workshop stays in the bar', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone bar');
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Menu' });
  await expect(page.locator('.nav__workshop')).toBeVisible();
  await expect(page.locator('.nav__links')).toBeHidden();
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.nav__links a')).toHaveText([/work/i, /about/i, /contact/i]);
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
  await expect(page.locator('.nav__links')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test('Workshop lists entries as cards, with status, date and skills (drafts show in dev)', async ({ page }) => {
  await page.goto('/workshop/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Paint still wet');
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

test('contact form: labelled fields, Netlify wiring, honeypot, posts to /thanks/ without JS', async ({ page }) => {
  await page.goto('/');
  const form = page.locator('form[name="contact"]');
  await expect(form).toHaveAttribute('data-netlify', 'true');
  await expect(form).toHaveAttribute('netlify-honeypot', 'company');
  await expect(form).toHaveAttribute('action', '/thanks/');
  await expect(form.locator('input[name="form-name"]')).toHaveValue('contact');
  for (const name of ['Name', 'Email', 'Message']) await expect(form.getByLabel(name, { exact: true })).toBeVisible();
  await expect(form.getByLabel('Email', { exact: true })).toHaveAttribute('type', 'email');
});

test('contact form: inline errors name each problem and focus the first one', async ({ page }) => {
  await page.goto('/');
  const form = page.locator('form[name="contact"]');
  await form.getByLabel('Email', { exact: true }).fill('not-an-email');
  await form.getByRole('button', { name: 'Send message' }).click();
  const name = form.getByLabel('Name', { exact: true });
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#cf-name-err')).toHaveText('Add your name.');
  await expect(page.locator('#cf-email-err')).toContainText('looks incomplete');
  await expect(page.locator('#cf-message-err')).toHaveText('Write a short message.');
  // fixing a field clears its error as you type
  await name.fill('Ed');
  await expect(name).toHaveAttribute('aria-invalid', 'false');
  await expect(page.locator('#cf-name-err')).toHaveText('');
});

test('contact form: a good message sends in place and confirms', async ({ page }) => {
  await page.route('**/', (route) => (route.request().method() === 'POST' ? route.fulfill({ status: 200, body: '' }) : route.continue()));
  await page.goto('/');
  const form = page.locator('form[name="contact"]');
  await form.getByLabel('Name', { exact: true }).fill('Test Person');
  await form.getByLabel('Email', { exact: true }).fill('test@example.com');
  await form.getByLabel('Message', { exact: true }).fill('Hello');
  await form.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('.contact__done')).toHaveText(/message sent/);
  await expect(page.locator('.contact__done')).toBeFocused();
});

test('contact form: a failed send keeps the message and offers email instead', async ({ page }) => {
  await page.route('**/', (route) => (route.request().method() === 'POST' ? route.fulfill({ status: 500, body: '' }) : route.continue()));
  await page.goto('/');
  const form = page.locator('form[name="contact"]');
  await form.getByLabel('Name', { exact: true }).fill('Test Person');
  await form.getByLabel('Email', { exact: true }).fill('test@example.com');
  await form.getByLabel('Message', { exact: true }).fill('Hello');
  await form.getByRole('button', { name: 'Send message' }).click();
  await expect(form.locator('[data-status]')).toContainText('didn’t send');
  await expect(form.locator('[data-status] a[href^="mailto:"]')).toBeVisible();
  await expect(form.getByLabel('Message', { exact: true })).toHaveValue('Hello');
});

test('thanks page exists and is kept out of search', async ({ page }) => {
  await page.goto('/thanks/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Thanks, message sent.');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

test('Acknowledgement of Country sits below the footer, headed, with the Aboriginal flag', async ({ page }) => {
  await page.goto('/');
  const country = page.getByRole('complementary', { name: 'Acknowledgement of Country' });
  await expect(country).toContainText('Wurundjeri Woi-wurrung people of the Kulin Nation');
  await expect(country).toContainText('Elders, past and present');
  await expect(country.getByRole('img', { name: 'Australian Aboriginal flag' })).toBeVisible();
  // it comes after the footer
  expect(await page.evaluate(() => {
    const f = document.querySelector('footer')!, c = document.querySelector('.country')!;
    return Boolean(f.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING);
  })).toBe(true);
});
