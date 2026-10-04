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
    await expect(page.getByRole('navigation', { name: 'More case studies' }).getByRole('link', { name: /Next/ })).toHaveAttribute('href', /\/work\/.+\//);
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

test('case study hero spans the full width with its image, title over it', async ({ page, isMobile }) => {
  await page.goto('/work/form-guide-redesign/');
  const hero = (await page.locator('.case-hero').boundingBox())!;
  const vw = page.viewportSize()!.width;
  expect(hero.width).toBeGreaterThanOrEqual(vw - 1);
  await expect(page.locator('.case-hero__img')).toBeVisible();
  await expect(page.locator('.case-hero h1')).toBeVisible();
  if (!isMobile) expect(hero.height).toBeGreaterThan(page.viewportSize()!.height * 0.75);
});

test('case study quick links: one per section, they jump there and mark where you are', async ({ page }) => {
  await page.goto('/work/form-guide-redesign/');
  const toc = page.getByRole('navigation', { name: 'On this page' });
  await expect(toc.getByRole('link')).toHaveText(['Overview', 'My role', 'Problem', 'Goals', 'Outcomes', 'Process', 'Learnings', 'Next steps']);
  await toc.getByRole('link', { name: 'Outcomes' }).click();
  await expect(page).toHaveURL(/#outcomes$/);
  await expect(page.locator('#outcomes')).toBeInViewport();
  await expect.poll(() => toc.getByRole('link', { name: 'Outcomes' }).getAttribute('aria-current')).toBe('true');
});

test('case study has an image (or its placeholder) after Problem, Outcomes and Process', async ({ page }) => {
  await page.goto('/work/form-guide-redesign/');
  const after = await page.evaluate(() =>
    ['problem', 'outcomes', 'process'].map((id) => {
      // walk forward from the heading to the next h2: a section image must sit in between
      let el = document.getElementById(id)?.nextElementSibling;
      while (el && el.tagName !== 'H2') { if (el.matches('figure.section-image')) return true; el = el.nextElementSibling; }
      return false;
    }),
  );
  expect(after).toEqual([true, true, true]);
});
