import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const round = process.argv[2] ?? 'latest';
const base = process.env.BASE ?? 'http://localhost:4321';
const pages = { home: '/', case: '/work/form-guide-redesign/' };
const viewports = { desktop: { width: 1440, height: 900 }, 'tablet-landscape': { width: 1024, height: 768 }, tablet: { width: 768, height: 1024 }, mobile: { width: 375, height: 812 } };

const ok = await fetch(base).then((r) => r.ok).catch(() => false);
if (!ok) {
  console.error(`Start the dev server first (npm run dev), or set BASE. Tried ${base}`);
  process.exit(1);
}

mkdirSync(`docs/review/${round}`, { recursive: true });
const browser = await chromium.launch();
for (const [vpName, viewport] of Object.entries(viewports)) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  for (const [name, path] of Object.entries(pages)) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    // Load every lazy image (mid-page ones never enter the viewport in a full-page capture), then settle at the top.
    await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; }));
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => Promise.all([...document.images].map((img) => img.decode().catch(() => {}))));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `docs/review/${round}/${name}-${vpName}.png`, fullPage: true });
    console.log(`✓ ${name}-${vpName}`);
  }
  await context.close();
}
await browser.close();
