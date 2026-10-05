import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const SLUGS = ['form-guide-redesign', 'punters-design-system', 'eonx-design-system', 'pay-by-account'];

for (const slug of SLUGS) {
  test(`case study ${slug} renders the template`, async ({ page }) => {
    await page.goto(`/work/${slug}/`);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'At a glance' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'More case studies' }).getByRole('link', { name: /Next/ })).toHaveAttribute('href', /\/work\/.+\//);
  });

  test(`case study ${slug}: no Results panel in the band (the numbers live in the overview and Outcomes)`, async ({ page }) => {
    await page.goto(`/work/${slug}/`);
    await expect(page.locator('.case-band [data-stat]')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Results' })).toHaveCount(0);
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

test('case study: image across the top, then the blue band with title, tags, overview and at a glance', async ({ page }) => {
  await page.goto('/work/form-guide-redesign/');
  const vw = page.viewportSize()!.width;
  const hero = (await page.locator('.case-hero').boundingBox())!;
  expect(hero.width).toBeGreaterThanOrEqual(vw - 1);
  await expect(page.locator('.case-hero__img')).toBeVisible();
  const band = page.locator('.case-band');
  const box = (await band.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(hero.y + hero.height - 2);
  await expect(band.getByRole('heading', { level: 1 })).toHaveText('Form Guide Redesign');
  await expect(band.locator('.case-band__tags li').first()).toHaveText(/Product design/i);
  await expect(band.getByRole('heading', { name: 'Overview' })).toBeVisible();
  await expect(band.getByRole('heading', { name: 'At a glance' })).toBeVisible();
  // the overview lives in the band now, not in the story below
  await expect(page.locator('.prose h2', { hasText: /^Overview$/ })).toHaveCount(0);
});

test('case study quick links: one per section beside the story, they jump there and mark where you are', async ({ page }) => {
  await page.goto('/work/form-guide-redesign/');
  const toc = page.getByRole('navigation', { name: 'On this page' });
  await expect(toc.getByRole('link')).toHaveText(['My role', 'Problem', 'Goals', 'Outcomes', 'Process', 'Learnings', 'Next steps']);
  await toc.getByRole('link', { name: 'Outcomes' }).click();
  await expect(page).toHaveURL(/#outcomes$/);
  await expect(page.locator('#outcomes')).toBeInViewport();
  await expect.poll(() => toc.getByRole('link', { name: 'Outcomes' }).getAttribute('aria-current')).toBe('true');
});
test('Problem has an image; Outcomes and Process have carousels', async ({ page }) => {
  await page.goto('/work/form-guide-redesign/');
  const after = await page.evaluate(() =>
    ['problem', 'outcomes', 'process'].map((id) => {
      let el = document.getElementById(id)?.nextElementSibling;
      while (el && el.tagName !== 'H2') {
        if (el.matches('figure.section-image')) return 'image';
        if (el.matches('section.gallery')) return 'carousel';
        el = el.nextElementSibling;
      }
      return 'none';
    }),
  );
  expect(after).toEqual(['image', 'carousel', 'carousel']);
});

test('carousel: Next and Previous move a slide and the count follows; arrow keys work too', async ({ page }) => {
  await page.goto('/work/form-guide-redesign/');
  const g = page.getByRole('region', { name: 'Outcomes images' });
  await g.scrollIntoViewIfNeeded();
  const count = g.locator('[data-current]');
  await expect(count).toHaveText('1');
  await expect(g.getByRole('button', { name: 'Previous image' })).toBeDisabled();
  await g.getByRole('button', { name: 'Next image' }).click();
  await expect(count).toHaveText('2');
  await g.locator('.gallery__track').press('ArrowRight');
  await expect(count).toHaveText('3');
  await g.getByRole('button', { name: 'Previous image' }).click();
  await expect(count).toHaveText('2');
});

test('case study: the finished work sits in a carousel above My role', async ({ page }) => {
  await page.goto('/work/pay-by-account/');
  const finals = page.locator('.case-finals');
  await expect(finals.getByRole('heading', { name: 'The finished work' })).toBeVisible();
  await expect(finals.locator('[data-gallery]')).toHaveCount(1);
  const g = await finals.boundingBox(), role = await page.locator('.prose h2').first().boundingBox();
  expect(g && role && g.y < role.y).toBe(true);
});
