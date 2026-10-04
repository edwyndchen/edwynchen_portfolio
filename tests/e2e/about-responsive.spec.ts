import { test, expect, type Page } from '@playwright/test';

// The About stage at tablet and phone sizes, motion on. Runs once (desktop project) at explicit viewports.
test.skip(({ isMobile }) => isMobile, 'viewports are set per test');

async function openStaged(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.evaluate(() => document.querySelectorAll<HTMLImageElement>('#about img').forEach((i) => (i.loading = 'eager')));
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#about')).toHaveClass(/is-staged/);
  await expect.poll(() => page.locator('#about').getAttribute('data-pin-end')).not.toBeNull();
  const at = async (f: number) => {
    const { s, e } = await page.evaluate(() => {
      const a = document.querySelector<HTMLElement>('#about')!;
      return { s: Number(a.dataset.pinStart), e: Number(a.dataset.pinEnd) };
    });
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(s + (e - s) * f));
    await page.waitForTimeout(1500);
  };
  return at;
}

const inView = (page: Page, sel: string) =>
  page.locator(sel).evaluate((el) => {
    const r = el.getBoundingClientRect();
    const nav = document.querySelector('.nav')!.getBoundingClientRect().bottom;
    return r.top >= nav - 1 && r.bottom <= window.innerHeight + 1 && r.left >= -1 && r.right <= window.innerWidth + 1;
  });

for (const [w, h] of [[768, 1024], [1024, 768]]) {
  test(`tablet ${w}x${h}: two columns, Ed lands right of the text, nothing overflows`, async ({ page }) => {
    const at = await openStaged(page, w, h);
    await at(1);
    const text = await page.locator('#about .about__text').boundingBox();
    const ed = await page.locator('#about .about__ed').boundingBox();
    expect(ed!.x).toBeGreaterThan(text!.x + text!.width * 0.5);
    await expect(page.locator('#about .about__text')).toHaveCSS('opacity', '1');
    await expect(page.locator('#about .about__more')).toHaveCSS('opacity', '1');
    expect(await inView(page, '#about-title')).toBe(true);
    expect(await inView(page, '#about .about__ed')).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });
}

for (const [w, h] of [[390, 844], [375, 667]]) {
  test(`phone ${w}x${h}: heading, bio and Ed share one pinned screen; the text never fades`, async ({ page }) => {
    const at = await openStaged(page, w, h);
    // mid-part: the walls are opening off the text, which is there at full strength
    await at(0.35);
    await expect(page.locator('#about .about__text')).toHaveCSS('opacity', '1');
    expect(await inView(page, '#about-title')).toBe(true);
    expect(await inView(page, '#about .about__text p:last-of-type')).toBe(true);
    // landed: Ed whole on the same screen, below the bio
    await at(1);
    expect(await inView(page, '#about .about__ed')).toBe(true);
    const bio = await page.locator('#about .about__text').boundingBox();
    const ed = await page.locator('#about .about__ed').boundingBox();
    expect(ed!.y).toBeGreaterThanOrEqual(bio!.y + bio!.height - 8);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });
}
