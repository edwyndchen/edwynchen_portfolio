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

  test(`case study ${slug} has no axe violations`, async ({ page }) => {
    await page.goto(`/work/${slug}/`);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
  });
}
