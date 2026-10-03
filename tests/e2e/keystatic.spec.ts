import { expect, test } from '@playwright/test';

test('Keystatic admin lists all four case studies', async ({ page }) => {
  await page.goto('/keystatic/collection/caseStudies');
  for (const title of ['Form Guide Redesign', 'Punters Design System', 'EonX Design System', 'Pay By Account']) {
    await expect(page.getByText(title, { exact: true }).first()).toBeVisible({ timeout: 20_000 });
  }
});
