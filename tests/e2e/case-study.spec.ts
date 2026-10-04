import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const SLUGS = ['form-guide-redesign', 'punters-design-system', 'eonx-design-system', 'pay-by-account'];
const WITH_METRICS = ['form-guide-redesign', 'punters-design-system', 'eonx-design-system'];

for (const slug of SLUGS) {
  test(`case study ${slug} renders the template`, async ({ page }) => {
    await page.goto(`/work/${slug}/`);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'At a glance' })).toBeVisible();
    if (WITH_METRICS.includes(slug)) {
      await expect(page.locator('[data-stat]').first()).toBeVisible();
    } else {
      await expect(page.locator('[data-stat]')).toHaveCount(0);
    }
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Next/ })).toHaveAttribute('href', /\/work\/.+\//);
  });

  test(`case study ${slug}: results are headed, and the outcome is not repeated beside them`, async ({ page }) => {
    await page.goto(`/work/${slug}/`);
    const outcomeRow = page.locator('.glance dt', { hasText: /^Outcome$/ });
    if (WITH_METRICS.includes(slug)) {
      const results = page.getByRole('region', { name: 'Results' });
      await expect(results.getByRole('heading', { level: 2, name: 'Results' })).toBeVisible();
      await expect(results.locator('[data-stat]').first()).toBeVisible();
      await expect(outcomeRow).toHaveCount(0);
    } else {
      await expect(page.getByRole('heading', { name: 'Results' })).toHaveCount(0);
      await expect(outcomeRow).toHaveCount(1);
    }
  });

  test(`case study ${slug} ends with a way to get in touch`, async ({ page }) => {
    await page.goto(`/work/${slug}/`);
    const contact = page.locator('section#contact');
    await expect(contact.locator('a[href^="mailto:"]')).toBeVisible();
    // after the previous / next links, at the end of the page
    const after = await page.evaluate(() => {
      const nav = document.querySelector('nav.casenav') as Node;
      return Boolean(nav.compareDocumentPosition(document.querySelector('#contact') as Node) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(after).toBe(true);
  });

  test(`case study ${slug} has no axe violations`, async ({ page }) => {
    await page.goto(`/work/${slug}/`);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
  });
}
