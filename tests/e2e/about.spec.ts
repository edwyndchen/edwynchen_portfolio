import { expect, test, type Page } from '@playwright/test';

const ALT = 'Brush painting of Edwyn flying in flowing blue-and-white robes, holding a stylus and tablet';

const edOpacity = (page: Page) => page.locator('.about__ed').evaluate((el) => Number(getComputedStyle(el).opacity));

/** Wait for the pinned stage to publish its scroll range, then scroll to `p` (0..1) through the pin. */
async function toPin(page: Page, p: number) {
  await expect(page.locator('#about')).toHaveAttribute('data-pin-end', /\d/);
  await page.evaluate((p) => {
    const s = document.querySelector('#about') as HTMLElement;
    const start = Number(s.dataset.pinStart);
    const end = Number(s.dataset.pinEnd);
    window.scrollTo(0, Math.round(start + (end - start) * p));
  }, p);
  // scrub: 1 lags the scroll by about a second
  await page.waitForTimeout(1600);
}

/** Inner (billowing) edge of each cloud wall, in viewport px: box left + the wall's --inner fraction of its width. */
const wallEdges = (page: Page) =>
  page.evaluate(() => {
    const edge = (sel: string) => {
      const el = document.querySelector(sel) as HTMLElement;
      const r = el.getBoundingClientRect();
      return r.left + Number(getComputedStyle(el).getPropertyValue('--inner')) * r.width;
    };
    return { left: edge('.about__wall--left'), right: edge('.about__wall--right'), vw: window.innerWidth };
  });

test('Ed\'s figure sits to the right of the About text and loads', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop layout');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const ed = page.locator('#about .about__figure .about__ed img.about__ed-still');
  await expect(ed).toHaveAttribute('alt', ALT);
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

test('two decorative cloud walls sit between the case studies and the About content', async ({ page }) => {
  await page.goto('/');
  const order = await page.evaluate(() => {
    const work = document.querySelector('#work') as HTMLElement;
    const walls = document.querySelector('[data-about-walls]') as HTMLElement | null;
    const heading = document.querySelector('#about-title') as HTMLElement;
    if (!walls) return null;
    const after = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    return after(work, walls) && after(walls, heading);
  });
  expect(order).toBe(true);
  const walls = page.locator('[data-about-walls]');
  await expect(walls).toHaveAttribute('aria-hidden', 'true');
  const imgs = walls.locator('img');
  await expect(imgs).toHaveCount(2);
  for (const img of await imgs.all()) await expect(img).toHaveAttribute('alt', '');
  // the old passage, sprites and tower are gone
  await expect(page.locator('[data-cloud-passage], .about__tower')).toHaveCount(0);
});

// the figure sits inside the one-screen phone stage with the bio, so it comes before the list (and is seen there)
test('reading order stays heading, bio, figure, list', async ({ page }) => {
  await page.goto('/');
  const order = await page.evaluate(() => {
    const els = ['#about-title', '#about .about__text p', '#about .about__figure', '#about .about__caps'].map((s) => document.querySelector(s) as Node);
    return els.every((el, i) => i === 0 || Boolean(els[i - 1].compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING));
  });
  expect(order).toBe(true);
});

test('motion allowed, desktop: the walls part, Ed descends, then glides to the right', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop choreography');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  await toPin(page, 0.002);
  let w = await wallEdges(page);
  expect(w.left).toBeGreaterThan(w.vw / 2); // closed: the left wall reaches past the centre
  expect(await edOpacity(page)).toBeLessThan(0.2);

  await toPin(page, 0.45);
  w = await wallEdges(page);
  expect(w.right - w.left).toBeGreaterThanOrEqual(w.vw * 0.25);

  await toPin(page, 1);
  await expect.poll(() => edOpacity(page)).toBeGreaterThan(0.95);
  const ed = await page.locator('.about__ed').boundingBox();
  expect(ed && ed.x + ed.width / 2 > w.vw / 2).toBe(true);
  const h2 = page.locator('#about-title');
  await expect(h2).toBeInViewport();
  await expect(page.locator('.about__text')).toHaveCSS('opacity', '1');
  const hb = await h2.boundingBox();
  expect(hb && hb.x < w.vw / 2).toBe(true);
  // the walls have drifted fully off-screen
  w = await wallEdges(page);
  expect(w.left).toBeLessThan(0);
  expect(w.right).toBeGreaterThan(w.vw);
});

test('motion allowed, mobile: Ed descends centred and lands below the text', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile choreography');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await toPin(page, 0.002);
  expect(await edOpacity(page)).toBeLessThan(0.2);
  await toPin(page, 1);
  await expect.poll(() => edOpacity(page)).toBeGreaterThan(0.95);
  const ed = await page.locator('.about__ed').boundingBox();
  const text = await page.locator('.about__text').boundingBox();
  const vw = page.viewportSize()!.width;
  expect(ed && Math.abs(ed.x + ed.width / 2 - vw / 2)).toBeLessThan(vw * 0.06);
  expect(ed && text && ed.y > text.y + text.height - 12).toBe(true);
});

test('desktop nav link to About lands on the finished layout, not the closed clouds', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop pin');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('#about')).toHaveAttribute('data-pin-end', /\d/);
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'About' }).click();
  await expect.poll(() => edOpacity(page), { timeout: 8000 }).toBeGreaterThan(0.95);
  await expect(page.locator('#about-title')).toBeInViewport();
});

test('desktop nav link to About moves keyboard focus to the About section', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop pin (the jump is intercepted in JS)');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('#about')).toHaveAttribute('data-pin-end', /\d/);
  const link = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'About' });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#about')).toBeFocused();
  // the next Tab continues from About, not from the nav
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => Boolean(document.activeElement?.closest('#about, #contact, footer')))).toBe(true);
});

test('desktop: arriving on /#about lands on the finished layout with focus in About', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop pin');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#about');
  await expect(page.locator('#about')).toBeFocused();
  await expect(page.locator('#about-title')).toBeInViewport();
});

test('reduced motion: no pin, no walls, Ed at rest and the text visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const about = page.locator('#about');
  await about.evaluate((el) => el.scrollIntoView());
  await page.waitForTimeout(400);
  expect(await about.evaluate((el) => el.parentElement?.classList.contains('pin-spacer') ?? false)).toBe(false);
  await expect(page.locator('[data-about-walls]')).toBeHidden();
  const ed = page.locator('.about__ed');
  await expect(ed).toHaveCSS('opacity', '1');
  await expect(ed).toHaveCSS('transform', 'none');
  await expect(page.locator('#about-title')).toBeVisible();
  await expect(page.locator('.about__text')).toHaveCSS('opacity', '1');
});

test('motion allowed: only the fabric moves in the wind, and only while on screen', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const ed = page.locator('.about__ed');
  await expect(ed).toHaveClass(/is-windy/);
  // one painting, warped in place: no second copy to double the outlines
  await expect(page.locator('.about__ed img')).toHaveCount(1);
  await expect(page.locator('.about__ed-still')).toHaveCSS('filter', /url\("?#ed-wind"?\)/);
  // the stillness map is painted and laid over the painting (face, hands and torso held still)
  const map = page.locator('#ed-wind feImage');
  expect(await map.getAttribute('href')).toMatch(/^data:image\/svg\+xml,/);
  expect(Number(await map.getAttribute('width'))).toBeGreaterThan(0);
  const freq = () => page.locator('#ed-wind feTurbulence').getAttribute('baseFrequency');
  // off-screen (top of the page): paused
  const a = await freq();
  await page.waitForTimeout(500);
  expect(await freq()).toBe(a);
  // on screen: breathing
  await page.evaluate(() => (document.querySelector('#about') as HTMLElement).dataset.pinEnd && window.scrollTo(0, Number((document.querySelector('#about') as HTMLElement).dataset.pinEnd)));
  await expect.poll(freq, { timeout: 4000 }).not.toBe(a);
});

test('reduced motion: no wind, the painting is the still copy alone', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.about__ed')).not.toHaveClass(/is-windy/);
  await expect(page.locator('.about__ed-still')).toHaveCSS('filter', 'none');
});

test('陳 mark beside the heading uses the Chinese font and is hidden from screen readers', async ({ page }) => {
  await page.goto('/');
  const mark = page.locator('#about .about__mark');
  await expect(mark).toHaveText('陳');
  await expect(mark).toHaveAttribute('aria-hidden', 'true');
  await expect(mark).toHaveCSS('font-family', /Cactus Classical Serif/);
});

// The CSS check alone once passed while the glyph fell back to a system font (Ma Shan Zheng has no traditional 陳),
// so ask the browser which font actually drew it
test('陳 is drawn by Cactus Classical Serif itself, not a fallback', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'needs the Chrome DevTools protocol');
  await page.goto('/');
  const mark = page.locator('#about .about__mark');
  await mark.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument');
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#about .about__mark' });
  const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
  expect(fonts.map((f) => f.familyName)).toEqual(['Cactus Classical Serif']);
});

test('old portrait frame and placeholder are gone', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.about__placeholder')).toHaveCount(0);
  await expect(page.locator('#about img[src*="ed-portrait"]')).toHaveCount(0);
});
