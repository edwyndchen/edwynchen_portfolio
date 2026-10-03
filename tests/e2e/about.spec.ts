import { expect, test, type Page } from '@playwright/test';

const ALT = 'Brush painting of Edwyn flying in flowing blue-and-white robes, holding a stylus and tablet';

/** Scroll so the top of #about sits at `fraction` of the viewport height. */
async function placeAbout(page: Page, fraction: number) {
  await page.evaluate((f) => {
    const about = document.querySelector('#about') as HTMLElement;
    const top = about.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top - window.innerHeight * f);
  }, fraction);
}

const edOpacity = (page: Page) => page.locator('.about__ed').evaluate((el) => Number(getComputedStyle(el).opacity));

test('Ed\'s figure sits to the right of the About text and loads', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop layout');
  await page.goto('/');
  const ed = page.locator('#about .about__figure img.about__ed');
  await expect(ed).toHaveAttribute('alt', ALT);
  // plain scroll, not scrollIntoViewIfNeeded: Ed's idle float means he is never 'stable' for Playwright
  await ed.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await expect.poll(() => ed.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  const fig = await page.locator('#about .about__figure').boundingBox();
  const h2 = await page.locator('#about-title').boundingBox();
  expect(fig && h2 && fig.x > h2.x + h2.width / 2).toBe(true);
});

test('on phones the figure comes after the text', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile layout');
  await page.goto('/');
  const fig = await page.locator('#about .about__figure').boundingBox();
  const text = await page.locator('#about .about__text').boundingBox();
  expect(fig && text && fig.y > text.y + text.height - 1).toBe(true);
});

test('cloud tower is decorative and in front of Ed', async ({ page }) => {
  await page.goto('/');
  const tower = page.locator('#about .about__tower');
  await expect(tower).toHaveCount(1);
  await expect(tower).toHaveAttribute('alt', '');
  await expect(tower).toHaveAttribute('aria-hidden', 'true');
  const z = await page.evaluate(() => {
    const zi = (s: string) => Number(getComputedStyle(document.querySelector(s) as HTMLElement).zIndex) || 0;
    return { ed: zi('.about__ed'), tower: zi('.about__tower') };
  });
  expect(z.tower).toBeGreaterThan(z.ed);
});

test('a decorative cloud passage sits between the case studies and About', async ({ page }) => {
  await page.goto('/');
  const order = await page.evaluate(() => {
    const work = document.querySelector('#work') as HTMLElement;
    const passage = document.querySelector('[data-cloud-passage]') as HTMLElement | null;
    const about = document.querySelector('#about') as HTMLElement;
    if (!passage) return null;
    const after = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    return after(work, passage) && after(passage, about);
  });
  expect(order).toBe(true);
  const passage = page.locator('[data-cloud-passage]');
  await expect(passage).toHaveAttribute('aria-hidden', 'true');
  const imgs = passage.locator('img');
  expect(await imgs.count()).toBeGreaterThanOrEqual(4);
  for (const img of await imgs.all()) await expect(img).toHaveAttribute('alt', '');
});

test('motion allowed: Ed flies in from the right, out of the cloud tower', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop scrub check');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const ed = page.locator('.about__ed');
  await placeAbout(page, 0.95);
  await page.waitForTimeout(1200);
  expect(await edOpacity(page)).toBeLessThan(0.5);
  const start = await ed.boundingBox();
  await placeAbout(page, 0.15);
  await page.waitForTimeout(1200);
  await expect.poll(() => edOpacity(page)).toBeGreaterThan(0.95);
  const rest = await ed.boundingBox();
  const tower = await page.locator('.about__tower').boundingBox();
  expect(start && rest && start.x > rest.x + 20).toBe(true);
  expect(rest && tower && rest.x < tower.x + rest.width * 0.4).toBe(true);
});

test('reduced motion: Ed is fully visible and still at every scroll position', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const ed = page.locator('.about__ed');
  for (const f of [0.95, 0.15]) {
    await placeAbout(page, f);
    await page.waitForTimeout(400);
    await expect(ed).toHaveCSS('opacity', '1');
    await expect(ed).toHaveCSS('transform', 'none');
  }
});

test('陳 mark beside the heading uses the brush font and is hidden from screen readers', async ({ page }) => {
  await page.goto('/');
  const mark = page.locator('#about .about__mark');
  await expect(mark).toHaveText('陳');
  await expect(mark).toHaveAttribute('aria-hidden', 'true');
  await expect(mark).toHaveCSS('font-family', /Ma Shan Zheng/);
});

test('old portrait frame and placeholder are gone', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.about__placeholder')).toHaveCount(0);
  await expect(page.locator('#about img[src*="ed-portrait"]')).toHaveCount(0);
});
