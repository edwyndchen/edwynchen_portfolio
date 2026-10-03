# Porcelain Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Ed's new portfolio site: a Chinese blue-and-white porcelain art style with hidden Australian details, an animated layered Melbourne hero, and CMS-editable case study pages.

**Architecture:** Astro 7 static site with the Netlify adapter (required for the Keystatic admin route). Case studies live as Markdoc files in `src/content/case-studies/`, edited through Keystatic at `/keystatic` and read by an Astro content collection. All artwork is generated in Higgsfield to one shared style prompt, processed with sharp into WebP, and animated with GSAP.

**Tech Stack:** astro@7.3.5, @astrojs/react@7.0.0, @astrojs/markdoc@2.0.9, @astrojs/netlify@8.2.6, @keystatic/core@0.6.9, @keystatic/astro@6.0.0, react/react-dom 19, gsap@3.15.0, sharp, vitest@5.0.3, @playwright/test@1.63.0, @axe-core/playwright@4.13.0. Node 24 (installed at /opt/homebrew/bin/node).

**Spec:** `docs/2026-10-03-porcelain-portfolio-design.md` (same folder as this plan). Read it before starting any task.

**Art decisions (2026-10-03, override any older wording below):** Task 1 is DONE. Style is porcelain *brushwork* (not engraving), model Seedream 5.0 Pro, approved hero reference job `7fe457e1-a346-44db-a466-2c1e0affc431`. Hero has only the Arts Centre Spire and Flinders Street Station (no 108, no Eureka, no other buildings). No corner ornaments anywhere: plates are a plain double keyline; flora are free-floating separate plants. All details in `docs/image-prompts.md`.

**Verified 2026-10-03:** Astro 7 + Keystatic + Markdoc + Netlify adapter builds successfully with `glob` from `astro/loaders`, `z` from `astro/zod`, `getCollection`/`render` from `astro:content`. Without an adapter, the build fails with `NoAdapterInstalled`, so the adapter is required.

## Global Constraints

- Project root: `/Users/ed/Claude/Cowork/UI UX Design/porcelain-portfolio/`. All paths below are relative to it unless absolute.
- Never modify `UI UX Design/porcelain-experiment/` or `UI UX Design/Portfolio/`. Read only.
- Palette tokens (exact): `--porcelain #FBFAF7`, `--cobalt-ink #142B6F`, `--cobalt #1F3FA8`, `--cobalt-wash #A9B8E6`, `--wattle-gold #B8862B`, `--gold-text #8A6420`. No other colours in CSS except these tokens and transparency variants of them.
- `--cobalt-wash` and `--wattle-gold` are decorative only, never used for text.
- Gold covers no more than ~3% of any viewport.
- WCAG 2.1 AA: all text pairs ≥4.5:1 (verified: cobalt-ink 12.54, cobalt 8.62, gold-text 5.13 on porcelain).
- `prefers-reduced-motion: reduce` means no drift, no parallax, no tram movement, no reveal animation. Content is fully visible with JS off.
- Animate only `transform` and `opacity`.
- Hero art total (all `public/hero/*.webp`) under 600KB.
- Copy rules: before writing or editing any user-facing copy, read `/Users/ed/Claude/Cowork/00_Resources/voice-principles.md`. Australian spelling, no em dashes, sentence case headings, whole-number metrics (except ratings like 3.5/5), outcome-first case studies.
- Chinese motifs stay Chinese (no Mount Fuji, no cherry blossom clichés). Australian details are never labelled or explained on the page.
- Higgsfield generation has approval gates: never generate the next batch until Ed approves the current one in chat.
- Commit after every task, inside the project's own git repo (created in Task 2).

## File structure

```
porcelain-portfolio/
  docs/                         spec, plan, image-prompts.md, review/ (screenshots per round)
  art/                          raw Higgsfield downloads (PNG). Not served.
    hero/  flora/  covers/  test/
  public/
    hero/                       optimised hero layers (WebP)
    flora/                      free-floating flora spots (WebP)
    images/case-studies/<slug>/ cover.webp (+ any body images uploaded via Keystatic)
  scripts/
    art-manifest.mjs            list of art files: source PNG → output WebP, width, group
    optimise-art.mjs            runs sharp over the manifest, enforces hero budget
    import-case-studies.mjs     one-off: Portfolio/final/*.md → src/content/case-studies/*.mdoc
    screenshots.mjs             review screenshots at 1440 and 375
  src/
    content.config.ts           Astro collection schema
    content/case-studies/*.mdoc case study content (Keystatic writes here)
    data/site.ts                name, contact details, nav
    lib/contrast.ts             WCAG contrast maths + token reader
    lib/parse-case-study.mjs    pure parser used by the import script
    lib/case-studies.ts         sort + prev/next helpers
    scripts/hero-motion.ts      hero GSAP motion (pure helpers + initHero)
    scripts/reveal.ts           scroll reveals for sections
    styles/tokens.css           design tokens
    styles/global.css           base styles
    layouts/BaseLayout.astro
    components/                 Nav, Footer, Seal, SouthernCross, Hero, WorkPlates, About, Contact,
                                AtAGlance, StatPanels, CaseNav, Plate, Flora
    pages/index.astro
    pages/work/[slug].astro
  tests/unit/*.test.ts          vitest
  tests/e2e/*.spec.ts           playwright + axe
  keystatic.config.ts
  astro.config.mjs
```

---

### Task 1: Higgsfield style lock (approval gate)

Do this first, so Ed approves the art style before code depends on it.

**Files:**
- Create: `docs/image-prompts.md`
- Create: `art/test/` (downloaded test images)

**Interfaces:**
- Produces: the approved `STYLE` block and model choice, recorded in `docs/image-prompts.md`. Tasks 7 and 9 copy them verbatim.

- [ ] **Step 1: Write `docs/image-prompts.md`** with this content:

````markdown
# Image prompts

_All artwork for the porcelain portfolio. Append the STYLE block to every prompt. Model and approval status recorded per batch._

## STYLE block (append to every prompt)

```
Fine engraved pen-and-ink illustration in the manner of antique toile de Jouy and blue-and-white Chinese porcelain painting. Single colour cobalt blue line work (#1F3FA8) with fine cross-hatching and stippling on a plain warm white background (#FBFAF7). Crisp, high detail, confident even line weight, no gradients, no colour fills other than hatching, no text, no lettering, no signature, no watermark, no frame or border.
```

## Avoid (negative prompt, or bake into the prompt if no negative field)

```
purple, teal, neon, gradient, glossy 3D render, photograph, watercolour bleed, blurry, Japanese motifs, Mount Fuji, cherry blossom, text, watermark, frame, drop shadow, cluttered
```

## Batch 0: style test

- **T1 mountains:** A sweeping range of tall jagged Chinese mountain peaks in the style of Song dynasty shan shui landscape painting, layered ridges, mist gaps between ridges, wide panoramic composition with peaks across the full width, the base fading into blank white. [STYLE]
- **T2 corner ornament:** A square corner ornament for a porcelain plate border: a Chinese scrolling vine pattern where the flowers are a waratah and a banksia and the leaves are eucalyptus gum leaves, with three small golden wattle blossom clusters (#B8862B, the only non-blue colour), filling the top-left corner and trailing along the top and left edges, the rest blank white. [STYLE]
````

- [ ] **Step 2: Choose the model.** Call Higgsfield `models_explore` with `action: "recommend"` and the brief "fine engraved single-colour cobalt line art, high detail, panoramic". Prefer a model that handles fine line detail (Seedream or Nano Banana Pro were strong in July). Record the chosen model in `docs/image-prompts.md` under Batch 0.

- [ ] **Step 3: Generate the test batch.** Use `generate_image_batch` with both prompts (T1 aspect 21:9, T2 aspect 1:1), STYLE appended. Then `jobs_wait`, then `show_generation_by_ids` so Ed sees them.

- [ ] **Step 4: Download the results** into `art/test/` with `curl -L -o art/test/t1-mountains.png "<url>"` and `curl -L -o art/test/t2-corner.png "<url>"`.

- [ ] **Step 5: STOP, Ed approves.** Ask Ed: "Does this engraved style feel right? Anything to push (finer lines, more gold, less detail)?" Iterate on the STYLE block (max 3 re-rolls) until Ed says yes. Record the final STYLE block and "Batch 0: approved 2026-xx-xx" in `docs/image-prompts.md`.

(Git is initialised in Task 2. This task's files get committed there.)

---

### Task 2: Scaffold project, git, and test tooling

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `src/pages/index.astro`, `tests/e2e/smoke.spec.ts`, `tests/unit/sanity.test.ts`
- Modify: `/Users/ed/Claude/Cowork/.gitignore` (add one line)

**Interfaces:**
- Produces: npm scripts `dev`, `build`, `test`, `e2e`, `import:case-studies`, `optimise:art`, `shots`. Dev server on port 4321.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "porcelain-portfolio",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "test": "vitest run",
    "e2e": "playwright test",
    "import:case-studies": "node scripts/import-case-studies.mjs",
    "optimise:art": "node scripts/optimise-art.mjs",
    "shots": "node scripts/screenshots.mjs"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
npm i astro@7.3.5 @astrojs/react@7.0.0 @astrojs/markdoc@2.0.9 @astrojs/netlify@8.2.6 @keystatic/core@0.6.9 @keystatic/astro@6.0.0 react@19 react-dom@19 gsap@3.15.0
npm i -D vitest@5.0.3 @playwright/test@1.63.0 @axe-core/playwright@4.13.0 sharp
npx playwright install chromium
```

- [ ] **Step 3: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import netlify from '@astrojs/netlify';

export default defineConfig({
  site: 'https://example.netlify.app',
  adapter: netlify(),
  integrations: [react(), markdoc(), keystatic()],
});
```

(`site` is replaced with the real URL at deploy, which is out of scope for now.)

- [ ] **Step 4: Create `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`**

`tsconfig.json`:
```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['tests/unit/**/*.test.ts'] },
});
```

`playwright.config.ts`:
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'npm run dev -- --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
```

`.gitignore`:
```
node_modules/
dist/
.astro/
.netlify/
test-results/
playwright-report/
.DS_Store
```

- [ ] **Step 5: Write the failing smoke tests**

`tests/unit/sanity.test.ts`:
```ts
import { expect, test } from 'vitest';

test('vitest runs', () => {
  expect(1 + 1).toBe(2);
});
```

`tests/e2e/smoke.spec.ts`:
```ts
import { expect, test } from '@playwright/test';

test('home page loads with the site title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Edwyn Chen/);
});
```

- [ ] **Step 6: Run the e2e test, expect FAIL** (no page yet)

Run: `npm run e2e -- --project=desktop`
Expected: FAIL (404 or title mismatch).

- [ ] **Step 7: Create minimal `src/pages/index.astro`**

```astro
---
---
<html lang="en-AU">
  <head><meta charset="utf-8" /><title>Edwyn Chen</title></head>
  <body><h1>Edwyn Chen</h1></body>
</html>
```

- [ ] **Step 8: Run all tests, expect PASS**

Run: `npm test && npm run e2e`
Expected: 1 unit test passes, 2 e2e passes (desktop + mobile).

- [ ] **Step 9: Run a build**

Run: `npm run build`
Expected: completes with `✓ Completed`, `dist/` created.

- [ ] **Step 10: Own git repo, excluded from the Cowork repo**

The Cowork workspace is itself a git repo. This project needs its own repo (Keystatic GitHub mode and Netlify deploy later). Append this line to `/Users/ed/Claude/Cowork/.gitignore`:
```
UI UX Design/porcelain-portfolio/
```
Then in the project root:
```bash
git init -b main
git add -A
git commit -m "chore: scaffold Astro + Keystatic project with test tooling"
```
Tell Ed in the task summary that the Cowork `.gitignore` gained one line, and why.

---

### Task 3: Design tokens, base layout, nav, footer, seal

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/lib/contrast.ts`, `src/data/site.ts`, `src/components/Seal.astro`, `src/components/SouthernCross.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`, `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/unit/contrast.test.ts`, `tests/e2e/layout.spec.ts`

**Interfaces:**
- Produces: `contrastRatio(a: string, b: string): number`, `readTokens(css: string): Record<string, string>`. `BaseLayout` props `{ title: string; description: string }`. `site` object `{ name, role, location, email, linkedin, resume, nav: {label, href}[] }`. `<SouthernCross class?: string />` SVG component. `<Seal size?: number />`.

- [ ] **Step 1: Write the failing contrast test** `tests/unit/contrast.test.ts`

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { contrastRatio, readTokens } from '../../src/lib/contrast';

describe('contrastRatio', () => {
  test('black on white is 21', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
  });
  test('is symmetric', () => {
    expect(contrastRatio('#142B6F', '#FBFAF7')).toBeCloseTo(contrastRatio('#FBFAF7', '#142B6F'), 5);
  });
});

describe('design tokens', () => {
  const tokens = readTokens(readFileSync('src/styles/tokens.css', 'utf8'));

  test('all six palette tokens exist', () => {
    for (const name of ['porcelain', 'cobalt-ink', 'cobalt', 'cobalt-wash', 'wattle-gold', 'gold-text']) {
      expect(tokens[name], name).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  test.each(['cobalt-ink', 'cobalt', 'gold-text'])('%s text on porcelain passes AA', (name) => {
    expect(contrastRatio(tokens[name], tokens.porcelain)).toBeGreaterThanOrEqual(4.5);
  });

  test('porcelain text on cobalt-ink passes AA', () => {
    expect(contrastRatio(tokens.porcelain, tokens['cobalt-ink'])).toBeGreaterThanOrEqual(4.5);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

Run: `npm test`
Expected: FAIL, cannot find module `src/lib/contrast`.

- [ ] **Step 3: Implement `src/lib/contrast.ts`**

```ts
function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(n.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function readTokens(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of css.matchAll(/--([a-z-]+):\s*(#[0-9A-Fa-f]{6})/g)) out[m[1]] = m[2];
  return out;
}
```

- [ ] **Step 4: Create `src/styles/tokens.css`**

```css
:root {
  /* palette */
  --porcelain: #FBFAF7;
  --cobalt-ink: #142B6F;
  --cobalt: #1F3FA8;
  --cobalt-wash: #A9B8E6;
  --wattle-gold: #B8862B;
  --gold-text: #8A6420;

  /* type */
  --font-display: 'Bodoni Moda', 'Didot', Georgia, serif;
  --font-body: 'Hanken Grotesk', system-ui, sans-serif;
  --step--1: clamp(0.75rem, 0.72rem + 0.1vw, 0.8rem);
  --step-0: clamp(1.0625rem, 1rem + 0.2vw, 1.125rem);
  --step-1: clamp(1.35rem, 1.2rem + 0.6vw, 1.6rem);
  --step-2: clamp(1.8rem, 1.5rem + 1.4vw, 2.6rem);
  --step-3: clamp(2.4rem, 1.8rem + 3vw, 4.4rem);
  --step-4: clamp(2.8rem, 1.6rem + 5.5vw, 7rem);

  /* space */
  --space-xs: 0.5rem;
  --space-s: 1rem;
  --space-m: 1.5rem;
  --space-l: 2.5rem;
  --space-xl: clamp(4rem, 3rem + 5vw, 9rem);
  --gutter: clamp(1rem, 0.5rem + 2.5vw, 2.5rem);
  --max: 82rem;
  --measure: 68ch;

  /* lines */
  --rule: 1px solid var(--cobalt);
  --rule-soft: 1px solid color-mix(in srgb, var(--cobalt) 25%, transparent);

  /* motion */
  --ease-settle: cubic-bezier(0.22, 1, 0.36, 1);
}
```

- [ ] **Step 5: Run unit tests, expect PASS**

Run: `npm test`
Expected: all contrast and token tests pass.

- [ ] **Step 6: Create `src/styles/global.css`**

```css
@import './tokens.css';

*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--porcelain);
  color: var(--cobalt-ink);
  font-family: var(--font-body);
  font-size: var(--step-0);
  line-height: 1.6;
  text-rendering: optimizeLegibility;
}
img { display: block; max-width: 100%; height: auto; }
h1, h2, h3 {
  font-family: var(--font-display);
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.01em;
  margin: 0;
  text-wrap: balance;
}
p { margin: 0 0 1em; max-width: var(--measure); }
a { color: var(--cobalt); text-underline-offset: 0.2em; text-decoration-thickness: 1px; }
a:hover { text-decoration-thickness: 2px; }
:focus-visible { outline: 2px solid var(--cobalt); outline-offset: 3px; }

.label {
  font-size: var(--step--1);
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.wrap { width: min(100% - 2 * var(--gutter), var(--max)); margin-inline: auto; }
.visually-hidden {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
.skip-link {
  position: absolute; left: var(--gutter); top: -4rem; z-index: 100;
  background: var(--cobalt-ink); color: var(--porcelain); padding: 0.75rem 1rem;
}
.skip-link:focus { top: 1rem; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
```

- [ ] **Step 7: Ask Ed for contact details**

Ask Ed in chat: "What email, LinkedIn URL and resume link should the site show?" Use his answers in Step 8. Do not invent or reuse any address from context.

- [ ] **Step 8: Create `src/data/site.ts`** (fill the three contact values with Ed's answers from Step 7)

```ts
export const site = {
  name: 'Edwyn Chen',
  role: 'Product designer',
  location: 'Melbourne',
  email: 'ED_SUPPLIED_EMAIL',
  linkedin: 'ED_SUPPLIED_LINKEDIN_URL',
  resume: 'ED_SUPPLIED_RESUME_URL',
  nav: [
    { label: 'Work', href: '/#work' },
    { label: 'About', href: '/#about' },
    { label: 'Contact', href: '/#contact' },
  ],
} as const;
```

The three `ED_SUPPLIED_*` strings must be replaced before this step is marked done. Step 11's test fails if any remain.

- [ ] **Step 9: Create `src/components/SouthernCross.astro`** (five stars, approximate real positions)

```astro
---
interface Props { class?: string; title?: string }
const { class: className, title } = Astro.props;
const stars = [
  { x: 50, y: 8, r: 3.2 },   // Gacrux
  { x: 44, y: 92, r: 3.6 },  // Acrux
  { x: 14, y: 46, r: 3.2 },  // Mimosa
  { x: 80, y: 36, r: 2.6 },  // Delta Crucis
  { x: 62, y: 62, r: 1.6 },  // Epsilon Crucis
];
---
<svg class={className} viewBox="0 0 100 100" role={title ? 'img' : undefined} aria-hidden={title ? undefined : 'true'}>
  {title && <title>{title}</title>}
  {stars.map((s) => (
    <path
      d={`M${s.x} ${s.y - s.r * 2} L${s.x + s.r * 0.45} ${s.y - s.r * 0.45} L${s.x + s.r * 2} ${s.y} L${s.x + s.r * 0.45} ${s.y + s.r * 0.45} L${s.x} ${s.y + s.r * 2} L${s.x - s.r * 0.45} ${s.y + s.r * 0.45} L${s.x - s.r * 2} ${s.y} L${s.x - s.r * 0.45} ${s.y - s.r * 0.45} Z`}
      fill="currentColor"
    />
  ))}
</svg>
```

- [ ] **Step 10: Create `src/components/Seal.astro`** (陈 seal with a tiny Southern Cross, wattle gold, decorative)

```astro
---
import SouthernCross from './SouthernCross.astro';
interface Props { size?: number }
const { size = 44 } = Astro.props;
---
<span class="seal" style={`--size:${size}px`} aria-hidden="true">
  <span class="seal__char">陈</span>
  <SouthernCross class="seal__cross" />
</span>

<style>
  .seal {
    position: relative; display: inline-grid; place-items: center;
    width: var(--size); height: var(--size);
    border: 2px solid var(--wattle-gold); border-radius: 18%;
    color: var(--wattle-gold);
  }
  .seal__char {
    font-family: 'Noto Serif SC', serif; font-weight: 700;
    font-size: calc(var(--size) * 0.58); line-height: 1;
  }
  .seal__cross {
    position: absolute; right: 7%; bottom: 7%;
    width: 26%; height: 26%;
  }
</style>
```

Note for Ed's sign-off (spec open item): the 陈 + Southern Cross mark is a draft. Flag it in the Task 10 check-in.

- [ ] **Step 11: Write the failing layout e2e test** `tests/e2e/layout.spec.ts`

```ts
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('site data has no unfilled placeholders', () => {
  expect(readFileSync('src/data/site.ts', 'utf8')).not.toContain('ED_SUPPLIED');
});

test('layout has landmarks, skip link and nav', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header nav')).toBeVisible();
  await expect(page.locator('main#main')).toHaveCount(1);
  await expect(page.locator('footer')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  for (const label of ['Work', 'About', 'Contact']) {
    await expect(page.getByRole('link', { name: label, exact: true }).first()).toBeAttached();
  }
});

test('body background is porcelain', async ({ page }) => {
  await page.goto('/');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe('rgb(251, 250, 247)');
});
```

- [ ] **Step 12: Run, expect FAIL**

Run: `npm run e2e -- --project=desktop tests/e2e/layout.spec.ts`
Expected: FAIL (no nav/main/footer).

- [ ] **Step 13: Create `src/components/Nav.astro`**

```astro
---
import Seal from './Seal.astro';
import { site } from '../data/site';
---
<header class="nav">
  <div class="wrap nav__inner">
    <a class="nav__brand" href="/">
      <Seal size={36} />
      <span>{site.name}</span>
    </a>
    <nav aria-label="Main">
      <ul class="nav__links">
        {site.nav.map((item) => <li><a href={item.href}>{item.label}</a></li>)}
      </ul>
    </nav>
  </div>
</header>

<style>
  .nav {
    position: sticky; top: 0; z-index: 50;
    background: color-mix(in srgb, var(--porcelain) 92%, transparent);
    backdrop-filter: blur(8px);
    border-bottom: var(--rule-soft);
  }
  .nav__inner { display: flex; align-items: center; justify-content: space-between; min-height: 4rem; }
  .nav__brand {
    display: inline-flex; align-items: center; gap: 0.75rem;
    font-family: var(--font-display); font-size: 1.25rem; color: var(--cobalt-ink); text-decoration: none;
  }
  .nav__links { display: flex; gap: clamp(1rem, 3vw, 2.5rem); list-style: none; margin: 0; padding: 0; }
  .nav__links a {
    display: inline-block; padding: 0.75rem 0; min-height: 44px;
    font-size: var(--step--1); font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--cobalt-ink); text-decoration: none;
  }
  .nav__links a:hover { color: var(--cobalt); text-decoration: underline; }
</style>
```

- [ ] **Step 14: Create `src/components/Footer.astro`**

```astro
---
import SouthernCross from './SouthernCross.astro';
import { site } from '../data/site';
const year = new Date().getFullYear();
---
<footer class="footer">
  <div class="wrap footer__inner">
    <p class="label">© {year} {site.name}</p>
    <p class="footer__made">
      Made in Melbourne
      <SouthernCross class="footer__cross" />
    </p>
  </div>
</footer>

<style>
  .footer { border-top: var(--rule-soft); padding-block: var(--space-l); margin-top: var(--space-xl); }
  .footer__inner { display: flex; flex-wrap: wrap; justify-content: space-between; gap: var(--space-s); }
  .footer p { margin: 0; }
  .footer__made { display: inline-flex; align-items: center; gap: 0.5rem; font-size: var(--step--1); }
  .footer__cross { width: 1rem; height: 1rem; color: var(--wattle-gold); }
</style>
```

- [ ] **Step 15: Create `src/layouts/BaseLayout.astro`**

```astro
---
import '../styles/global.css';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
interface Props { title: string; description: string }
const { title, description } = Astro.props;
---
<!doctype html>
<html lang="en-AU">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..700&family=Hanken+Grotesk:wght@400;500;600&display=swap"
    />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@700&text=%E9%99%88&display=swap" />
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <Nav />
    <main id="main"><slot /></main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 16: Update `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { site } from '../data/site';
---
<BaseLayout title={`${site.name}, ${site.role} in ${site.location}`} description="Product design portfolio of Edwyn Chen, Melbourne.">
  <h1 class="wrap">{site.name}</h1>
</BaseLayout>
```

- [ ] **Step 17: Run all tests, expect PASS**

Run: `npm test && npm run e2e`
Expected: all pass (smoke title still matches `/Edwyn Chen/`).

- [ ] **Step 18: Commit**

```bash
git add -A
git commit -m "feat: design tokens, base layout, nav, footer and seal"
```

---

### Task 4: Keystatic CMS, content collection, and case study import

**Files:**
- Create: `keystatic.config.ts`, `src/content.config.ts`, `src/lib/parse-case-study.mjs`, `src/lib/case-studies.ts`, `scripts/import-case-studies.mjs`, `src/content/case-studies/*.mdoc` (generated)
- Test: `tests/unit/parse-case-study.test.ts`, `tests/unit/case-studies.test.ts`, `tests/e2e/keystatic.spec.ts`

**Interfaces:**
- Produces:
  - `parseCaseStudy(markdown: string, meta: { order: number; discipline: 'product-design' | 'design-system' }): { data: CaseStudyData; body: string }`
  - `toMdoc(data, body): string`
  - `sortCaseStudies<T extends { id: string; data: { order: number; title: string } }>(entries: T[]): T[]`
  - `neighbours<T extends { id: string }>(sorted: T[], id: string): { prev: T; next: T }` (wraps around)
  - Collection name `caseStudies`. Entry `id` = file slug (`form-guide-redesign`). Fields: `title, dek, discipline, order, outcome, role, timeline, team, platforms, context, cover, coverAlt, metrics[{value,label}]`.

- [ ] **Step 1: Write the failing parser test** `tests/unit/parse-case-study.test.ts`

```ts
import { describe, expect, test } from 'vitest';
import { parseCaseStudy, toMdoc } from '../../src/lib/parse-case-study.mjs';

const sample = `# Form Guide Redesign

_Portfolio-ready rewrite. Editor note to drop._

**Dek:** Rebuilding the data tables punters use.

## At a glance

**Role:** Product designer (UI lead)
**Timeline:** Aug 2023 – Oct 2024
**Team:** 2 designers, devs, PM
**Platforms:** Web, iOS, Android
**Outcome:** Bounce rate down 52%, time on page up 79%

## Overview

I rebuilt the most-visited pages.

## Outcomes

Within a year of launch:

- Bounce rate down **52%** year on year
- **3.5/5** satisfaction from 500+ users surveyed
- Passed WAVE accessibility checks

## Process

Body text.
`;

describe('parseCaseStudy', () => {
  const { data, body } = parseCaseStudy(sample, { order: 1, discipline: 'product-design' });

  test('reads title and dek', () => {
    expect(data.title).toBe('Form Guide Redesign');
    expect(data.dek).toBe('Rebuilding the data tables punters use.');
  });

  test('reads at-a-glance fields, leaving missing ones empty', () => {
    expect(data.role).toBe('Product designer (UI lead)');
    expect(data.timeline).toBe('Aug 2023 – Oct 2024');
    expect(data.team).toBe('2 designers, devs, PM');
    expect(data.platforms).toBe('Web, iOS, Android');
    expect(data.context).toBe('');
    expect(data.outcome).toBe('Bounce rate down 52%, time on page up 79%');
  });

  test('extracts metrics only from bold outcome bullets', () => {
    expect(data.metrics).toEqual([
      { value: '52%', label: 'Bounce rate down year on year' },
      { value: '3.5/5', label: 'Satisfaction from 500+ users surveyed' },
    ]);
  });

  test('passes meta through and leaves cover empty', () => {
    expect(data.order).toBe(1);
    expect(data.discipline).toBe('product-design');
    expect(data.cover).toBe('');
    expect(data.coverAlt).toBe('');
  });

  test('body starts at Overview and drops the editor note', () => {
    expect(body.startsWith('## Overview')).toBe(true);
    expect(body).not.toContain('Editor note');
    expect(body).toContain('## Process');
  });
});

describe('toMdoc', () => {
  test('writes YAML frontmatter then body', () => {
    const out = toMdoc(
      { title: 'A "quoted" title', order: 2, metrics: [{ value: '30%', label: 'Faster' }] },
      '## Overview\n\nHi',
    );
    expect(out).toBe(
      '---\ntitle: "A \\"quoted\\" title"\norder: 2\nmetrics:\n  - value: "30%"\n    label: "Faster"\n---\n\n## Overview\n\nHi\n',
    );
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

Run: `npm test`
Expected: FAIL, cannot find module `parse-case-study.mjs`.

- [ ] **Step 3: Implement `src/lib/parse-case-study.mjs`**

```js
const GLANCE_KEYS = { Role: 'role', Timeline: 'timeline', Team: 'team', Platforms: 'platforms', Context: 'context', Outcome: 'outcome' };

function section(markdown, heading) {
  const start = markdown.indexOf(`\n## ${heading}\n`);
  if (start === -1) return '';
  const rest = markdown.slice(start + heading.length + 5);
  const end = rest.search(/\n## /);
  return end === -1 ? rest : rest.slice(0, end);
}

function capitalise(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function parseCaseStudy(markdown, meta) {
  const data = {
    title: markdown.match(/^# (.+)$/m)?.[1].trim() ?? '',
    dek: markdown.match(/^\*\*Dek:\*\*\s*(.+)$/m)?.[1].trim() ?? '',
    discipline: meta.discipline,
    order: meta.order,
    outcome: '', role: '', timeline: '', team: '', platforms: '', context: '',
    cover: '', coverAlt: '',
    metrics: [],
  };

  for (const m of section(markdown, 'At a glance').matchAll(/^\*\*(\w+):\*\*\s*(.+)$/gm)) {
    const key = GLANCE_KEYS[m[1]];
    if (key) data[key] = m[2].trim();
  }

  for (const line of section(markdown, 'Outcomes').split('\n')) {
    const bold = line.match(/^- .*?\*\*([^*]+)\*\*/);
    if (!bold) continue;
    const label = line.replace(/^- /, '').replace(`**${bold[1]}**`, '').replace(/\s+/g, ' ').trim();
    data.metrics.push({ value: bold[1].trim(), label: capitalise(label) });
  }

  const bodyStart = markdown.indexOf('## Overview');
  const body = bodyStart === -1 ? '' : markdown.slice(bodyStart).trim();
  return { data, body };
}

function yamlValue(v) {
  return typeof v === 'number' ? String(v) : JSON.stringify(v);
}

export function toMdoc(data, body) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        Object.entries(item).forEach(([k, v], i) => lines.push(`${i === 0 ? '  - ' : '    '}${k}: ${yamlValue(v)}`));
      }
    } else {
      lines.push(`${key}: ${yamlValue(value)}`);
    }
  }
  lines.push('---', '', body, '');
  return lines.join('\n');
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `npm test`
Expected: parser and toMdoc tests pass.

- [ ] **Step 5: Write the failing helper test** `tests/unit/case-studies.test.ts`

```ts
import { describe, expect, test } from 'vitest';
import { neighbours, sortCaseStudies } from '../../src/lib/case-studies';

const e = (id: string, order: number, title = id) => ({ id, data: { order, title } });

describe('sortCaseStudies', () => {
  test('sorts by order, then title', () => {
    const sorted = sortCaseStudies([e('c', 2), e('b', 1, 'Zed'), e('a', 1, 'Alpha')]);
    expect(sorted.map((x) => x.id)).toEqual(['a', 'b', 'c']);
  });
  test('does not mutate input', () => {
    const input = [e('b', 2), e('a', 1)];
    sortCaseStudies(input);
    expect(input[0].id).toBe('b');
  });
});

describe('neighbours', () => {
  const list = [e('a', 1), e('b', 2), e('c', 3)];
  test('middle item', () => {
    const { prev, next } = neighbours(list, 'b');
    expect([prev.id, next.id]).toEqual(['a', 'c']);
  });
  test('wraps at both ends', () => {
    expect(neighbours(list, 'a').prev.id).toBe('c');
    expect(neighbours(list, 'c').next.id).toBe('a');
  });
});
```

- [ ] **Step 6: Run, expect FAIL**, then implement `src/lib/case-studies.ts`

```ts
type Sortable = { id: string; data: { order: number; title: string } };

export function sortCaseStudies<T extends Sortable>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

export function neighbours<T extends { id: string }>(sorted: T[], id: string): { prev: T; next: T } {
  const i = sorted.findIndex((x) => x.id === id);
  const n = sorted.length;
  return { prev: sorted[(i - 1 + n) % n], next: sorted[(i + 1) % n] };
}
```

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Create `scripts/import-case-studies.mjs`**

```js
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parseCaseStudy, toMdoc } from '../src/lib/parse-case-study.mjs';

const SOURCE = '/Users/ed/Claude/Cowork/UI UX Design/Portfolio/final';
const OUT = 'src/content/case-studies';
const STUDIES = [
  { slug: 'form-guide-redesign', order: 1, discipline: 'product-design' },
  { slug: 'punters-design-system', order: 2, discipline: 'design-system' },
  { slug: 'eonx-design-system', order: 3, discipline: 'design-system' },
  { slug: 'pay-by-account', order: 4, discipline: 'product-design' },
];

mkdirSync(OUT, { recursive: true });
for (const s of STUDIES) {
  const md = readFileSync(`${SOURCE}/${s.slug}.md`, 'utf8');
  const { data, body } = parseCaseStudy(md, { order: s.order, discipline: s.discipline });
  writeFileSync(`${OUT}/${s.slug}.mdoc`, toMdoc(data, body));
  console.log(`✓ ${s.slug}: ${data.metrics.length} metrics`);
}
```

- [ ] **Step 8: Run the import and inspect**

Run: `npm run import:case-studies`
Expected: four `✓` lines, each with ≥3 metrics. Open each `.mdoc` and check the frontmatter reads correctly. If any metric label reads awkwardly, fix it by hand in the `.mdoc` (labels are Ed-editable in Keystatic later anyway).

- [ ] **Step 9: Create `keystatic.config.ts`**

```ts
import { collection, config, fields } from '@keystatic/core';

const text = (label: string, description?: string) => fields.text({ label, description });

export default config({
  storage: { kind: 'local' },
  ui: { brand: { name: 'Edwyn Chen portfolio' } },
  collections: {
    caseStudies: collection({
      label: 'Case studies',
      slugField: 'title',
      path: 'src/content/case-studies/*',
      format: { contentField: 'body' },
      entryLayout: 'content',
      columns: ['title', 'order'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        dek: fields.text({ label: 'Dek', description: 'One line under the title', validation: { length: { min: 1 } } }),
        discipline: fields.select({
          label: 'Discipline',
          options: [
            { label: 'Product design', value: 'product-design' },
            { label: 'Design system', value: 'design-system' },
          ],
          defaultValue: 'product-design',
        }),
        order: fields.integer({ label: 'Order on home page', defaultValue: 1 }),
        outcome: fields.text({ label: 'Outcome (one line, numbers first)', validation: { length: { min: 1 } } }),
        role: text('Role'),
        timeline: text('Timeline'),
        team: text('Team'),
        platforms: text('Platforms', 'Leave blank if not relevant'),
        context: text('Context', 'Leave blank if not relevant'),
        cover: fields.image({
          label: 'Cover art',
          directory: 'public/images/case-studies',
          publicPath: '/images/case-studies/',
        }),
        coverAlt: text('Cover alt text', 'Describe the image for screen readers. Required when a cover is set.'),
        metrics: fields.array(
          fields.object({
            value: fields.text({ label: 'Value', description: 'Whole numbers, e.g. 52%' }),
            label: fields.text({ label: 'Label' }),
          }),
          { label: 'Stat panels', itemLabel: (p) => `${p.fields.value.value}  ${p.fields.label.value}` },
        ),
        body: fields.markdoc({
          label: 'Body',
          options: {
            image: {
              directory: 'public/images/case-studies',
              publicPath: '/images/case-studies/',
              schema: { alt: fields.text({ label: 'Alt text', validation: { length: { min: 1 } } }) },
            },
          },
        }),
      },
    }),
  },
});
```

If the build in Step 12 rejects `schema.alt` on the markdoc image option, drop the `schema` key (alt then falls back to Keystatic's built-in alt field) and note it in the commit message.

- [ ] **Step 10: Create `src/content.config.ts`**

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/case-studies' }),
  schema: z
    .object({
      title: z.string().min(1),
      dek: z.string().min(1),
      discipline: z.enum(['product-design', 'design-system']),
      order: z.number().int(),
      outcome: z.string().min(1),
      role: z.string().default(''),
      timeline: z.string().default(''),
      team: z.string().default(''),
      platforms: z.string().default(''),
      context: z.string().default(''),
      cover: z.string().nullish(),
      coverAlt: z.string().default(''),
      metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    })
    .refine((d) => !d.cover || d.coverAlt.trim().length > 0, {
      message: 'coverAlt is required when a cover image is set',
      path: ['coverAlt'],
    }),
});

export const collections = { caseStudies };
```

- [ ] **Step 11: Write the Keystatic e2e test** `tests/e2e/keystatic.spec.ts`

```ts
import { expect, test } from '@playwright/test';

test('Keystatic admin lists all four case studies', async ({ page }) => {
  await page.goto('/keystatic/collection/caseStudies');
  for (const title of ['Form Guide Redesign', 'Punters Design System', 'EonX Design System', 'Pay By Account']) {
    await expect(page.getByText(title, { exact: true }).first()).toBeVisible({ timeout: 20_000 });
  }
});
```

- [ ] **Step 12: Run build and tests**

Run: `npm run build && npm test && npm run e2e -- --project=desktop`
Expected: build passes schema validation for all four entries; unit tests pass; Keystatic test passes.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: Keystatic CMS, case study collection and content import"
```

---

### Task 5: Case study page template

**Files:**
- Create: `src/components/Plate.astro`, `src/components/AtAGlance.astro`, `src/components/StatPanels.astro`, `src/components/CaseNav.astro`, `src/pages/work/[slug].astro`, `src/styles/prose.css`
- Test: `tests/e2e/case-study.spec.ts`

**Interfaces:**
- Consumes: `sortCaseStudies`, `neighbours`, collection `caseStudies`, `BaseLayout`.
- Produces: `<Plate as?: string; class?: string>` (framed porcelain panel: double cobalt keyline like a porcelain rim, no corner ornaments). `<AtAGlance data />`, `<StatPanels metrics />`, `<CaseNav prev next />`. Route `/work/<id>/`.

- [ ] **Step 1: Write the failing test** `tests/e2e/case-study.spec.ts`

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const SLUGS = ['form-guide-redesign', 'punters-design-system', 'eonx-design-system', 'pay-by-account'];

for (const slug of SLUGS) {
  test(`case study ${slug} renders the template`, async ({ page }) => {
    await page.goto(`/work/${slug}/`);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'At a glance' })).toBeVisible();
    await expect(page.locator('[data-stat]').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Next/ })).toHaveAttribute('href', /\/work\/.+\//);
  });

  test(`case study ${slug} has no axe violations`, async ({ page }) => {
    await page.goto(`/work/${slug}/`);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
  });
}
```

- [ ] **Step 2: Run, expect FAIL** (404)

Run: `npm run e2e -- --project=desktop tests/e2e/case-study.spec.ts`

- [ ] **Step 3: Create `src/components/Plate.astro`**

```astro
---
interface Props { as?: string; class?: string }
const { as: Tag = 'div', class: className } = Astro.props;
---
<Tag class:list={['plate', className]}>
  <slot />
</Tag>

<style>
  .plate {
    position: relative;
    border: var(--rule);
    outline: 1px solid var(--cobalt);
    outline-offset: -7px;
    padding: clamp(1.5rem, 1rem + 2vw, 2.75rem);
    background: var(--porcelain);
  }
</style>
```

- [ ] **Step 4: Create `src/components/AtAGlance.astro`**

```astro
---
interface Props { data: { role: string; timeline: string; team: string; platforms: string; context: string; outcome: string } }
const { data } = Astro.props;
const rows = [
  ['Role', data.role], ['Timeline', data.timeline], ['Team', data.team],
  ['Platforms', data.platforms], ['Context', data.context], ['Outcome', data.outcome],
].filter(([, v]) => v);
---
<section class="glance" aria-labelledby="glance-title">
  <h2 id="glance-title" class="label">At a glance</h2>
  <dl>
    {rows.map(([k, v]) => (<div><dt class="label">{k}</dt><dd>{v}</dd></div>))}
  </dl>
</section>

<style>
  .glance h2 { font-family: var(--font-body); margin-bottom: var(--space-m); color: var(--gold-text); }
  dl { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: var(--space-m) var(--space-l); margin: 0; }
  dl div { border-top: var(--rule-soft); padding-top: var(--space-xs); }
  dt { margin-bottom: 0.25rem; }
  dd { margin: 0; }
</style>
```

- [ ] **Step 5: Create `src/components/StatPanels.astro`**

```astro
---
interface Props { metrics: { value: string; label: string }[] }
const { metrics } = Astro.props;
const shown = metrics.slice(0, 4);
---
{shown.length > 0 && (
  <ul class="stats" aria-label="Results">
    {shown.map((m) => (
      <li data-stat>
        <span class="stats__value">{m.value}</span>
        <span class="stats__label">{m.label}</span>
      </li>
    ))}
  </ul>
)}

<style>
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: var(--space-m); list-style: none; padding: 0; margin: 0; }
  .stats li { border-top: 2px solid var(--cobalt); padding-top: var(--space-s); }
  .stats__value { display: block; font-family: var(--font-display); font-size: var(--step-3); line-height: 1; color: var(--cobalt); }
  .stats__label { display: block; margin-top: var(--space-xs); max-width: 24ch; }
</style>
```

- [ ] **Step 6: Create `src/components/CaseNav.astro`**

```astro
---
interface Item { id: string; data: { title: string } }
interface Props { prev: Item; next: Item }
const { prev, next } = Astro.props;
---
<nav class="casenav wrap" aria-label="More case studies">
  <a href={`/work/${prev.id}/`} rel="prev"><span class="label">Previous</span><span>{prev.data.title}</span></a>
  <a href={`/work/${next.id}/`} rel="next"><span class="label">Next</span><span>{next.data.title}</span></a>
</nav>

<style>
  .casenav { display: flex; justify-content: space-between; gap: var(--space-m); border-top: var(--rule); padding-top: var(--space-m); margin-top: var(--space-xl); }
  .casenav a { display: grid; gap: 0.25rem; text-decoration: none; font-family: var(--font-display); font-size: var(--step-1); min-height: 44px; }
  .casenav a[rel='next'] { text-align: right; }
</style>
```

- [ ] **Step 7: Create `src/styles/prose.css`**

```css
.prose { max-width: var(--measure); }
.prose h2 { font-size: var(--step-2); margin: var(--space-xl) 0 var(--space-m); }
.prose h3 { font-size: var(--step-1); margin: var(--space-l) 0 var(--space-s); }
.prose ul, .prose ol { padding-left: 1.2em; }
.prose li { margin-bottom: 0.4em; }
.prose li::marker { color: var(--cobalt); }
.prose strong { font-weight: 600; }
.prose img { margin: var(--space-l) 0; border: var(--rule-soft); }
.prose blockquote { margin: var(--space-l) 0; padding-left: var(--space-m); border-left: 2px solid var(--cobalt); font-family: var(--font-display); font-size: var(--step-1); }
```

- [ ] **Step 8: Create `src/pages/work/[slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Plate from '../../components/Plate.astro';
import AtAGlance from '../../components/AtAGlance.astro';
import StatPanels from '../../components/StatPanels.astro';
import CaseNav from '../../components/CaseNav.astro';
import { neighbours, sortCaseStudies } from '../../lib/case-studies';
import { site } from '../../data/site';
import '../../styles/prose.css';

export async function getStaticPaths() {
  const sorted = sortCaseStudies(await getCollection('caseStudies'));
  return sorted.map((entry) => ({ params: { slug: entry.id }, props: { entry, ...neighbours(sorted, entry.id) } }));
}

const { entry, prev, next } = Astro.props;
const { Content } = await render(entry);
const d = entry.data;
---
<BaseLayout title={`${d.title} | ${site.name}`} description={d.dek}>
  <article>
    <header class="wrap case-head">
      <Plate>
        <p class="label case-head__kicker">{d.discipline === 'design-system' ? 'Design system' : 'Product design'}</p>
        <h1>{d.title}</h1>
        <p class="case-head__dek">{d.dek}</p>
      </Plate>
      {d.cover && <img class="case-head__cover" src={d.cover} alt={d.coverAlt} width="1600" height="900" />}
    </header>

    <div class="wrap case-summary">
      <StatPanels metrics={d.metrics} />
      <AtAGlance data={d} />
    </div>

    <div class="wrap prose case-body">
      <Content />
    </div>
  </article>
  <CaseNav prev={prev} next={next} />
</BaseLayout>

<style>
  .case-head { padding-top: var(--space-xl); }
  .case-head h1 { font-size: var(--step-4); margin: var(--space-s) 0; }
  .case-head__kicker { color: var(--gold-text); margin: 0; }
  .case-head__dek { font-size: var(--step-1); margin: 0; }
  .case-head__cover { margin-top: var(--space-l); width: 100%; height: auto; mix-blend-mode: multiply; }
  .case-summary { display: grid; gap: var(--space-xl); padding-block: var(--space-xl); }
</style>
```

- [ ] **Step 9: Run tests, expect PASS**

Run: `npm run e2e -- tests/e2e/case-study.spec.ts`
Expected: 16 passes (4 slugs × 2 tests × 2 projects). Fix any axe violations in source before moving on.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: case study page template"
```

---

### Task 6: Home page sections (hero copy, work plates, about, contact)

**Files:**
- Create: `src/components/Hero.astro` (copy only; art and motion arrive in Task 8), `src/components/WorkPlates.astro`, `src/components/About.astro`, `src/components/Contact.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: `site`, `sortCaseStudies`, `Plate`, `BaseLayout`.
- Produces: `Hero.astro` with the `.hero__copy` block and an empty `.hero__scene` container (Task 8 fills it). Section ids `work`, `about`, `contact`.

- [ ] **Step 1: Read `/Users/ed/Claude/Cowork/00_Resources/voice-principles.md`** before writing any copy in this task.

- [ ] **Step 2: Write the failing test** `tests/e2e/home.spec.ts`

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('home has one h1 and the three sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  for (const id of ['work', 'about', 'contact']) await expect(page.locator(`section#${id}`)).toBeAttached();
});

test('work section links to all four case studies in order', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('#work a[href^="/work/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  expect(hrefs).toEqual([
    '/work/form-guide-redesign/',
    '/work/punters-design-system/',
    '/work/eonx-design-system/',
    '/work/pay-by-account/',
  ]);
});

test('contact has a mailto link', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#contact a[href^="mailto:"]')).toBeVisible();
});

test('home has no axe violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});
```

- [ ] **Step 3: Run, expect FAIL**

Run: `npm run e2e -- --project=desktop tests/e2e/home.spec.ts`

- [ ] **Step 4: Create `src/components/Hero.astro`** (copy draft; Ed edits in Task 10)

```astro
---
import { site } from '../data/site';
---
<section class="hero" data-hero aria-labelledby="hero-title">
  <div class="hero__scene" aria-hidden="true"></div>
  <div class="hero__copy wrap">
    <p class="label hero__kicker" data-reveal>{site.role}, {site.location}</p>
    <h1 id="hero-title" data-reveal>{site.name}</h1>
    <p class="hero__line" data-reveal>I design products that make complicated things easy to use. Most recently, bounce rate down 52% on the Punters form guide.</p>
    <a class="hero__cta" href="#work" data-reveal>View work</a>
  </div>
</section>

<style>
  .hero { position: relative; min-height: min(92svh, 60rem); display: grid; align-items: start; overflow: clip; }
  .hero__scene { position: absolute; inset: 0; }
  .hero__copy { position: relative; z-index: 2; padding-top: clamp(3rem, 8vh, 7rem); }
  .hero__kicker { color: var(--gold-text); margin-bottom: var(--space-s); }
  .hero h1 { font-size: var(--step-4); max-width: 12ch; }
  .hero__line { font-size: var(--step-1); max-width: 34ch; margin-top: var(--space-m); }
  .hero__cta {
    display: inline-flex; align-items: center; min-height: 48px; padding: 0 1.5rem;
    border: var(--rule); font-weight: 600; text-decoration: none; letter-spacing: 0.04em;
  }
  .hero__cta:hover { background: var(--cobalt); color: var(--porcelain); }
</style>
```

- [ ] **Step 5: Create `src/components/WorkPlates.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Plate from './Plate.astro';
import { sortCaseStudies } from '../lib/case-studies';
const studies = sortCaseStudies(await getCollection('caseStudies'));
---
<section id="work" class="work wrap" aria-labelledby="work-title">
  <h2 id="work-title">Selected work</h2>
  <ol class="work__list">
    {studies.map((s, i) => (
      <li data-reveal-on-scroll>
        <Plate as="article" class="work__plate">
          {s.data.cover && <img class="work__cover" src={s.data.cover} alt={s.data.coverAlt} width="800" height="450" loading="lazy" />}
          <p class="label work__meta"><span class="work__num">{String(i + 1).padStart(2, '0')}</span> {s.data.discipline === 'design-system' ? 'Design system' : 'Product design'}</p>
          <h3><a href={`/work/${s.id}/`}>{s.data.title}</a></h3>
          <p class="work__outcome">{s.data.outcome}</p>
        </Plate>
      </li>
    ))}
  </ol>
</section>

<style>
  .work { padding-block: var(--space-xl); }
  .work h2 { font-size: var(--step-3); margin-bottom: var(--space-l); }
  .work__list { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-l); grid-template-columns: repeat(auto-fit, minmax(min(100%, 30rem), 1fr)); }
  .work__plate { height: 100%; position: relative; }
  .work__cover { width: 100%; height: auto; margin-bottom: var(--space-m); mix-blend-mode: multiply; }
  .work__num { color: var(--gold-text); margin-right: 0.5rem; }
  .work h3 { font-size: var(--step-2); margin: var(--space-xs) 0 var(--space-s); }
  .work h3 a { color: var(--cobalt-ink); text-decoration: none; }
  .work h3 a::after { content: ''; position: absolute; inset: 0; }
  .work__plate:hover h3 a, .work h3 a:focus-visible { text-decoration: underline; }
  .work__outcome { margin: 0; }
</style>
```

- [ ] **Step 6: Create `src/components/About.astro`** (bio adapted from `Portfolio/page-about.md`, Ed's own words)

```astro
---
import Plate from './Plate.astro';
---
<section id="about" class="about wrap" aria-labelledby="about-title">
  <Plate class="about__portrait">
    <img src="/images/ed-portrait.jpg" alt="Edwyn Chen" width="600" height="750" loading="lazy" onerror="this.remove()" />
  </Plate>
  <div class="about__text" data-reveal-on-scroll>
    <h2 id="about-title">About me</h2>
    <p>I design digital products and I care about getting them right, both how they work and how they feel to use.</p>
    <p>Coffee-fuelled designer and gym junkie. I like leaving places better than I found them, physically and digitally. Born and raised in Melbourne.</p>
    <h3 class="label">What I do</h3>
    <ul class="about__caps">
      <li>Product and UX design</li>
      <li>Design systems</li>
      <li>Accessibility</li>
      <li>Prototyping</li>
      <li>Illustration and brand</li>
    </ul>
  </div>
</section>

<style>
  .about { display: grid; gap: var(--space-xl); padding-block: var(--space-xl); grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); align-items: center; }
  .about h2 { font-size: var(--step-3); margin-bottom: var(--space-m); }
  .about h3 { font-family: var(--font-body); color: var(--gold-text); margin-top: var(--space-l); }
  .about__portrait { aspect-ratio: 4 / 5; display: grid; place-items: center; }
  .about__portrait img { width: 100%; height: 100%; object-fit: cover; }
  .about__caps { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 0.5rem 1.5rem; }
  @media (max-width: 48rem) { .about { grid-template-columns: 1fr; } }
</style>
```

Ed supplies `public/images/ed-portrait.jpg` (ask in Task 10's check-in). Until then the image removes itself and the empty plate frame shows.

- [ ] **Step 7: Create `src/components/Contact.astro`**

```astro
---
import { site } from '../data/site';
---
<section id="contact" class="contact wrap" aria-labelledby="contact-title">
  <h2 id="contact-title">Have a project or a role in mind?</h2>
  <p>Keen to hear about it. Email is quickest.</p>
  <ul class="contact__links">
    <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
    <li><a href={site.linkedin}>LinkedIn</a></li>
    <li><a href={site.resume}>Resume</a></li>
  </ul>
</section>

<style>
  .contact { padding-block: var(--space-xl); text-align: center; }
  .contact h2 { font-size: var(--step-3); margin-inline: auto; max-width: 18ch; }
  .contact p { margin: var(--space-m) auto; }
  .contact__links { list-style: none; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-m); }
  .contact__links a { display: inline-flex; align-items: center; min-height: 48px; font-size: var(--step-1); font-family: var(--font-display); }
</style>
```

- [ ] **Step 8: Update `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import WorkPlates from '../components/WorkPlates.astro';
import About from '../components/About.astro';
import Contact from '../components/Contact.astro';
import { site } from '../data/site';
---
<BaseLayout title={`${site.name}, ${site.role} in ${site.location}`} description="Product design portfolio of Edwyn Chen, Melbourne. Case studies in product design, design systems and accessibility.">
  <Hero />
  <WorkPlates />
  <About />
  <Contact />
</BaseLayout>
```

- [ ] **Step 9: Run all tests, expect PASS**

Run: `npm test && npm run e2e`
Expected: all pass, including axe on home.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: home page sections"
```

---

### Task 7: Hero artwork (Higgsfield batch 1, approval gate)

**Files:**
- Modify: `docs/image-prompts.md` (add batch 1)
- Create: `art/hero/{mountains,clouds,landmarks,bridge,tram}.png`, `scripts/art-manifest.mjs`, `scripts/optimise-art.mjs`, `public/hero/*.webp`

**Interfaces:**
- Consumes: approved STYLE block and model from Task 1.
- Produces: `public/hero/mountains.webp`, `clouds.webp`, `landmarks.webp`, `bridge.webp`, `tram.webp`, all with transparent backgrounds. `ART` manifest array `{ src, out, width, group }[]`.

- [ ] **Step 1: Add batch 1 prompts** to `docs/image-prompts.md`. Every prompt: model `seedream_v5_pro`, resolution `2k`, `remove_bg: true`, `medias: [{ role: "image_references", value: "7fe457e1-a346-44db-a466-2c1e0affc431" }]`, and starts with "Recreate only the <element> from the reference image, in exactly the same style and position, isolated on plain white:". STYLE block appended.

```markdown
## Batch 1: hero layers (21:9 unless noted; reference = approved hero 7fe457e1)

- **H1 mountains:** only the mountain ranges, no clouds, no buildings, no bridge, no trees.
- **H2 clouds:** only the swirling Chinese cloud scrolls, nothing else.
- **H3 landmarks:** only the Arts Centre spire (left) and Flinders Street Station (right), simplified, standing on a thin strip of mist. No other buildings.
- **H4 bridge:** only the arched stone bridge, the river and the gum trees, with an empty bridge deck (no tram).
- **H5 tram (3:1):** only the small tram in side view, isolated.
```

- [ ] **Step 2: Generate** H1–H5 with `generate_image_batch`, then `jobs_wait`, then `show_generation_by_ids`.

- [ ] **Step 3: STOP, Ed approves.** Ask: "Do the landmarks read as Melbourne at a glance, and does the whole scene still feel Chinese first?" Re-roll individual layers on request (max 3 per layer). Record approved generation ids in `docs/image-prompts.md`.

- [ ] **Step 4: Check backgrounds.** Layers were generated with `remove_bg: true`. If any came back with a white background, run Higgsfield `remove_background` on it. Download each to `art/hero/<name>.png` with `curl -L -o`. Open each PNG and check that white areas *inside* buildings and the tram stayed opaque. If interiors were cut out, use the original (non-removed) image for that layer instead and give it `mix-blend-mode: multiply` in Task 8 (note which layers in `docs/image-prompts.md`).

- [ ] **Step 5: Create `scripts/art-manifest.mjs`**

```js
export const ART = [
  { src: 'art/hero/mountains.png', out: 'public/hero/mountains.webp', width: 2400, group: 'hero' },
  { src: 'art/hero/clouds.png', out: 'public/hero/clouds.webp', width: 2400, group: 'hero' },
  { src: 'art/hero/landmarks.png', out: 'public/hero/landmarks.webp', width: 2400, group: 'hero' },
  { src: 'art/hero/bridge.png', out: 'public/hero/bridge.webp', width: 2400, group: 'hero' },
  { src: 'art/hero/tram.png', out: 'public/hero/tram.webp', width: 700, group: 'hero' },
];

export const BUDGETS = { hero: 600 * 1024 };
```

- [ ] **Step 6: Create `scripts/optimise-art.mjs`**

```js
import { mkdirSync, statSync } from 'node:fs';
import { dirname } from 'node:path';
import sharp from 'sharp';
import { ART, BUDGETS } from './art-manifest.mjs';

const totals = {};
for (const item of ART) {
  mkdirSync(dirname(item.out), { recursive: true });
  await sharp(item.src).resize({ width: item.width, withoutEnlargement: true }).webp({ quality: 74, effort: 6, alphaQuality: 80 }).toFile(item.out);
  const size = statSync(item.out).size;
  totals[item.group] = (totals[item.group] ?? 0) + size;
  console.log(`${item.out}  ${Math.round(size / 1024)}KB`);
}

let failed = false;
for (const [group, budget] of Object.entries(BUDGETS)) {
  const kb = Math.round((totals[group] ?? 0) / 1024);
  const ok = (totals[group] ?? 0) <= budget;
  console.log(`${ok ? '✓' : '✗'} ${group}: ${kb}KB / ${Math.round(budget / 1024)}KB`);
  if (!ok) failed = true;
}
process.exit(failed ? 1 : 0);
```

- [ ] **Step 7: Run it**

Run: `npm run optimise:art`
Expected: five WebP files and `✓ hero: <600KB`. If over budget, lower `quality` to 64 for the three widest layers (add a per-item `quality` field to the manifest and use `item.quality ?? 74`), rerun.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: hero artwork layers and art optimisation pipeline"
```

---

### Task 8: Hero scene and motion

**Files:**
- Create: `src/scripts/hero-motion.ts`, `src/scripts/reveal.ts`
- Modify: `src/components/Hero.astro`, `src/layouts/BaseLayout.astro`
- Test: `tests/unit/hero-motion.test.ts`, `tests/e2e/hero.spec.ts`

**Interfaces:**
- Consumes: `public/hero/*.webp`, `SouthernCross`.
- Produces: `parallaxOffset(pointer: number, depth: number, maxShift?: number): number`, `scrollShift(depth: number, maxPercent?: number): number`, `initHero(root: HTMLElement): () => void`, `initReveals(): void`. Elements with `data-reveal` (hero load reveal) and `data-reveal-on-scroll` (section reveals).

- [ ] **Step 1: Write the failing unit test** `tests/unit/hero-motion.test.ts`

```ts
import { describe, expect, test } from 'vitest';
import { parallaxOffset, scrollShift } from '../../src/scripts/hero-motion';

describe('parallaxOffset', () => {
  test('centre pointer gives no offset', () => {
    expect(parallaxOffset(0, 0.5)).toBe(0);
  });
  test('scales with depth and pointer', () => {
    expect(parallaxOffset(1, 0.5, 24)).toBe(12);
    expect(parallaxOffset(-1, 0.25, 24)).toBe(-6);
  });
  test('clamps pointer to -1..1', () => {
    expect(parallaxOffset(5, 1, 24)).toBe(24);
    expect(parallaxOffset(-5, 1, 24)).toBe(-24);
  });
});

describe('scrollShift', () => {
  test('back layers lag more than front layers', () => {
    expect(scrollShift(0.2)).toBeGreaterThan(scrollShift(0.8));
  });
  test('front layer at depth 1 does not shift', () => {
    expect(scrollShift(1)).toBe(0);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**, then implement `src/scripts/hero-motion.ts`

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function parallaxOffset(pointer: number, depth: number, maxShift = 24): number {
  const p = Math.max(-1, Math.min(1, pointer));
  return Math.round(p * depth * maxShift * 100) / 100;
}

export function scrollShift(depth: number, maxPercent = 18): number {
  return Math.round((1 - depth) * maxPercent * 100) / 100;
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initHero(root: HTMLElement): () => void {
  if (prefersReducedMotion()) return () => {};
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const layers = gsap.utils.toArray<HTMLElement>('[data-depth]', root);

    gsap.from(root.querySelectorAll('[data-reveal]'), { y: 24, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' });

    gsap.to(root.querySelectorAll('[data-drift]'), { xPercent: 3, duration: 18, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    const tram = root.querySelector<HTMLElement>('[data-tram]');
    if (tram) {
      gsap.set(tram, { left: 0 });
      gsap.fromTo(
        tram,
        { x: () => -tram.offsetWidth },
        { x: () => root.clientWidth, duration: 10, ease: 'none', repeat: -1, repeatDelay: 2, invalidateOnRefresh: true },
      );
    }

    for (const layer of layers) {
      const depth = Number(layer.dataset.depth);
      gsap.to(layer, {
        yPercent: scrollShift(depth),
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
      });
    }

    if (window.matchMedia('(pointer: fine)').matches) {
      root.addEventListener('pointermove', (e) => {
        const r = root.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
        for (const layer of layers) {
          const depth = Number(layer.dataset.depth);
          gsap.to(layer, { x: parallaxOffset(nx, depth), y: parallaxOffset(ny, depth, 12), duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
        }
      });
    }
  }, root);

  return () => ctx.revert();
}
```

Note: the tram's own `x` tween and the bridge layer's pointer `x` tween don't conflict because the tram is a child of the bridge layer, so they combine.

Run: `npm test`
Expected: PASS.

- [ ] **Step 3: Implement `src/scripts/reveal.ts`**

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initReveals(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.batch('[data-reveal-on-scroll]', {
    start: 'top 85%',
    once: true,
    onEnter: (els) => gsap.from(els, { y: 24, opacity: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out' }),
  });
}
```

Add to the end of `<body>` in `src/layouts/BaseLayout.astro`:

```astro
<script>
  import { initReveals } from '../scripts/reveal';
  initReveals();
</script>
```

- [ ] **Step 4: Write the failing e2e test** `tests/e2e/hero.spec.ts`

```ts
import { expect, test } from '@playwright/test';

const LAYERS = ['mountains', 'clouds', 'landmarks', 'bridge', 'tram'];

test('hero scene loads every layer', async ({ page }) => {
  await page.goto('/');
  for (const name of LAYERS) {
    const img = page.locator(`.hero__scene img[src="/hero/${name}.webp"]`);
    await expect(img).toHaveCount(1);
    expect(await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
  await expect(page.locator('.hero__scene svg')).toHaveCount(1); // Southern Cross
});

test('tram moves when motion is allowed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const tram = page.locator('[data-tram]');
  const a = await tram.boundingBox();
  await page.waitForTimeout(1500);
  const b = await tram.boundingBox();
  expect(a && b && Math.abs(b.x - a.x)).toBeGreaterThan(20);
});

test('reduced motion keeps the scene still and the copy visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const tram = page.locator('[data-tram]');
  const a = await tram.boundingBox();
  await page.waitForTimeout(1500);
  const b = await tram.boundingBox();
  expect(a?.x).toBe(b?.x);
  await expect(page.locator('#hero-title')).toHaveCSS('opacity', '1');
});
```

- [ ] **Step 5: Run, expect FAIL**

Run: `npm run e2e -- --project=desktop tests/e2e/hero.spec.ts`

- [ ] **Step 6: Replace the `.hero__scene` div and add the script and styles** in `src/components/Hero.astro`

Add `import SouthernCross from './SouthernCross.astro';` to the frontmatter. Replace `<div class="hero__scene" aria-hidden="true"></div>` with:

```astro
<div class="hero__scene" aria-hidden="true">
  <div class="hero__layer hero__sky" data-depth="0.05"><SouthernCross class="hero__cross" /></div>
  <img class="hero__layer hero__mountains" data-depth="0.15" src="/hero/mountains.webp" alt="" width="2400" height="1029" fetchpriority="high" />
  <div class="hero__layer hero__clouds" data-depth="0.3"><img data-drift src="/hero/clouds.webp" alt="" width="2400" height="1029" /></div>
  <img class="hero__layer hero__landmarks" data-depth="0.5" src="/hero/landmarks.webp" alt="" width="2400" height="1029" />
  <div class="hero__layer hero__front" data-depth="0.8">
    <img class="hero__bridge" src="/hero/bridge.webp" alt="" width="2400" height="1029" />
    <img class="hero__tram" data-tram src="/hero/tram.webp" alt="" width="700" height="233" />
  </div>
</div>
```

Append to the `<style>` block (layer positions are a first pass; tune by eye in Task 10):

```css
.hero__layer { position: absolute; inset: auto 0 0 0; width: 100%; will-change: transform; }
.hero__sky { inset: 0; }
.hero__cross { position: absolute; top: 10%; right: 12%; width: clamp(56px, 7vw, 110px); color: var(--wattle-gold); opacity: 0.85; }
.hero__mountains { bottom: 18%; }
.hero__clouds { bottom: 26%; opacity: 0.9; }
.hero__clouds img { width: 106%; max-width: none; margin-left: -3%; }
.hero__landmarks { bottom: 6%; }
.hero__front { bottom: -2%; }
.hero__bridge { width: 100%; }
.hero__tram { position: absolute; left: 58%; bottom: 31%; width: clamp(120px, 16vw, 240px); }
.hero__copy { pointer-events: none; }
.hero__copy a { pointer-events: auto; }
@media (max-width: 48rem) {
  .hero { min-height: 100svh; }
  .hero__mountains, .hero__landmarks, .hero__clouds img, .hero__bridge { width: 180%; max-width: none; margin-left: -40%; }
}
```

If Task 7 Step 4 marked any layer as "not background-removed", add `mix-blend-mode: multiply;` to that layer's rule.

Add at the end of the component:

```astro
<script>
  import { initHero } from '../scripts/hero-motion';
  const el = document.querySelector<HTMLElement>('[data-hero]');
  if (el) initHero(el);
</script>
```

- [ ] **Step 7: Run all tests, expect PASS**

Run: `npm test && npm run e2e`
Expected: all pass, both projects.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: layered Melbourne hero with GSAP motion and scroll reveals"
```

---

### Task 9: Flora spot illustrations and case study covers (Higgsfield batch 2, approval gate)

**Files:**
- Modify: `docs/image-prompts.md`, `scripts/art-manifest.mjs`, `src/pages/index.astro`, `src/components/About.astro`, `src/components/Footer.astro`, `src/pages/work/[slug].astro`, the four `src/content/case-studies/*.mdoc`
- Create: `src/components/Flora.astro`, `art/flora/*.png`, `art/covers/*.png`, `public/flora/*.webp`, `public/images/case-studies/<slug>/cover.webp`
- Test: `tests/e2e/flora.spec.ts`

**Interfaces:**
- Consumes: approved STYLE; `ART` manifest.
- Produces: `<Flora plant: 'waratah' | 'wattle' | 'banksia' | 'gum'; side?: 'left' | 'right'; class?: string />`, a decorative, absolutely positioned spot illustration. `cover` + `coverAlt` set for all four case studies.

- [ ] **Step 1: Add batch 2 prompts** to `docs/image-prompts.md`. Flora: model `seedream_v5_pro`, `remove_bg: true`, reference = waratah sprig `3cd0ab56-cc8e-4d87-8f6f-ea4314fadcd2`. Covers: reference = hero `7fe457e1-…`, white background kept.

```markdown
## Batch 2: flora and covers

Flora (4:3, one species only per image, lots of empty white, clean botanical porcelain brushwork):
- **F1 waratah:** reuse the approved T9 sprig only if Ed accepts the wattle in it; otherwise a single waratah flower on a short stem with its own serrated leaves, nothing else.
- **F2 wattle:** a single sprig of golden wattle: fine blue stems and narrow phyllode leaves, round fluffy blossoms in gold (#B8862B), nothing else.
- **F3 banksia:** a single banksia cone on a short stem with its own serrated leaves, nothing else.
- **F4 gum branch:** a trailing eucalyptus branch with long leaves and gumnuts, nothing else.

Covers (16:9, porcelain brushwork, same hand as the hero):
- **C1 form-guide-redesign:** a galloping racehorse and jockey in the manner of a Chinese porcelain horse painting, running through cloud scrolls.
- **C2 punters-design-system:** a neat grid of porcelain tiles, each a different simple pattern (lattice, cloud, wave, waratah), like a pattern book page, one tile slightly lifted.
- **C3 eonx-design-system:** interlocking Chinese lattice window panels of different sizes assembling into one larger screen, with gum leaves woven through.
- **C4 pay-by-account:** an ancient Chinese round coin with a square hole, large and centred, with cloud scrolls and a slim modern payment card resting against it.
```

- [ ] **Step 2: Generate** F1–F4 and C1–C4, `jobs_wait`, `show_generation_by_ids`.

- [ ] **Step 3: STOP, Ed approves.** Re-roll on request, max 3 per image. Record approved ids. Download flora to `art/flora/<plant>.png` (check transparency; run `remove_background` if needed) and covers to `art/covers/<slug>.png`.

- [ ] **Step 4: Extend `scripts/art-manifest.mjs`** by adding these entries to `ART`:

```js
  { src: 'art/flora/waratah.png', out: 'public/flora/waratah.webp', width: 700, group: 'flora' },
  { src: 'art/flora/wattle.png', out: 'public/flora/wattle.webp', width: 700, group: 'flora' },
  { src: 'art/flora/banksia.png', out: 'public/flora/banksia.webp', width: 700, group: 'flora' },
  { src: 'art/flora/gum.png', out: 'public/flora/gum.webp', width: 900, group: 'flora' },
  { src: 'art/covers/form-guide-redesign.png', out: 'public/images/case-studies/form-guide-redesign/cover.webp', width: 1600, group: 'covers' },
  { src: 'art/covers/punters-design-system.png', out: 'public/images/case-studies/punters-design-system/cover.webp', width: 1600, group: 'covers' },
  { src: 'art/covers/eonx-design-system.png', out: 'public/images/case-studies/eonx-design-system/cover.webp', width: 1600, group: 'covers' },
  { src: 'art/covers/pay-by-account.png', out: 'public/images/case-studies/pay-by-account/cover.webp', width: 1600, group: 'covers' },
```

Run: `npm run optimise:art`
Expected: all files written, `✓ hero` still under budget.

- [ ] **Step 5: Write the failing test** `tests/e2e/flora.spec.ts`

```ts
import { expect, test } from '@playwright/test';

test('flora spots are decorative and load', async ({ page }) => {
  await page.goto('/');
  const flora = page.locator('img.flora');
  expect(await flora.count()).toBeGreaterThanOrEqual(3);
  for (const img of await flora.all()) {
    await expect(img).toHaveAttribute('alt', '');
    await img.scrollIntoViewIfNeeded();
    expect(await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
});

test('flora never causes horizontal scroll', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
```

Run: `npm run e2e -- --project=desktop tests/e2e/flora.spec.ts`
Expected: FAIL (no `.flora` images yet).

- [ ] **Step 6: Create `src/components/Flora.astro`**

```astro
---
interface Props { plant: 'waratah' | 'wattle' | 'banksia' | 'gum'; side?: 'left' | 'right'; class?: string }
const { plant, side = 'right', class: className } = Astro.props;
---
<img class:list={['flora', `flora--${side}`, className]} src={`/flora/${plant}.webp`} alt="" width="700" height="525" loading="lazy" decoding="async" />

<style>
  .flora { position: absolute; width: clamp(110px, 16vw, 240px); height: auto; pointer-events: none; z-index: 0; }
  .flora--right { right: calc(var(--gutter) * -0.5); }
  .flora--left { left: calc(var(--gutter) * -0.5); }
  @media (max-width: 48rem) { .flora { width: 96px; opacity: 0.9; } }
</style>
```

- [ ] **Step 7: Place the flora** (each section that hosts one needs `position: relative; overflow-x: clip;` added to its existing root rule):
  - `WorkPlates.astro`: `<Flora plant="waratah" side="right" class="flora--work" />` inside `#work`, positioned `top: 0`.
  - `About.astro`: `<Flora plant="gum" side="left" class="flora--about" />` inside `#about`, positioned `bottom: 0`.
  - `Contact.astro`: `<Flora plant="wattle" side="right" class="flora--contact" />` inside `#contact`, positioned `top: var(--space-l)`.
  - `src/pages/work/[slug].astro`: `<Flora plant="banksia" side="right" />` inside `.case-head`, positioned `top: var(--space-l)`.
  
  Put the `top`/`bottom` values in each component's own `<style>` using `:global(.flora--work)` etc. Headings and text must stay above flora (`position: relative; z-index: 1` on the text containers).

- [ ] **Step 8: Set covers in content.** In each `.mdoc` frontmatter set (example for form guide; write a specific alt for each, describing the painting):

```yaml
cover: "/images/case-studies/form-guide-redesign/cover.webp"
coverAlt: "Blue-and-white brush painting of a racehorse and jockey galloping through Chinese cloud scrolls"
```

- [ ] **Step 9: Run all tests, expect PASS**

Run: `npm run build && npm test && npm run e2e`
Expected: all pass. The schema refine guarantees no cover without alt.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: flora spot illustrations and case study covers"
```

---

### Task 10: Impeccable styling pass v1 and Ed check-in (approval gate)

**Files:**
- Modify: any `src/components/*.astro`, `src/styles/*.css` as directed by the skill
- Create: `scripts/screenshots.mjs`, `docs/review/v1/*.png`

**Interfaces:**
- Produces: `npm run shots -- <round>` writes `docs/review/<round>/{home,case}-{desktop,mobile}.png`.

- [ ] **Step 1: Create `scripts/screenshots.mjs`**

```js
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const round = process.argv[2] ?? 'latest';
const base = 'http://localhost:4321';
const pages = { home: '/', case: '/work/form-guide-redesign/' };
const viewports = { desktop: { width: 1440, height: 900 }, mobile: { width: 375, height: 812 } };

const ok = await fetch(base).then((r) => r.ok).catch(() => false);
if (!ok) {
  console.error('Start the dev server first: npm run dev');
  process.exit(1);
}

mkdirSync(`docs/review/${round}`, { recursive: true });
const browser = await chromium.launch();
for (const [vpName, viewport] of Object.entries(viewports)) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  for (const [name, path] of Object.entries(pages)) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `docs/review/${round}/${name}-${vpName}.png`, fullPage: true });
    console.log(`✓ ${name}-${vpName}`);
  }
  await context.close();
}
await browser.close();
```

(Reduced motion is on so every reveal is visible in full-page captures.)

- [ ] **Step 2: Invoke the `impeccable:impeccable` skill.** Give it: the spec path, the palette and restraint rules from Global Constraints, and the brief "Chinese porcelain first glance, Australian detail on close look; fine engraved line art; restraint over ornament". Ask it to review and polish typography scale, spacing rhythm, hierarchy, the plate cards, the case study reading experience and mobile layout. Apply its changes. It must not add colours outside the palette or remove reduced-motion handling.

- [ ] **Step 3: Re-run tests after the styling changes**

Run: `npm test && npm run e2e`
Expected: all pass. Fix regressions before continuing.

- [ ] **Step 4: Capture v1 screenshots** (dev server running in another terminal tab)

Run: `npm run shots -- v1`
Expected: four `✓` lines.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "style: impeccable pass v1"
```

- [ ] **Step 6: STOP, Ed check-in.** Send Ed the four v1 screenshots (SendUserFile) and the local URL. Ask, in one message:
  - Does it read Chinese first, with the Australian details only on a close look?
  - Edits to the hero line, about bio or contact heading?
  - Is the 陈 + Southern Cross seal right?
  - Can you drop a portrait at `public/images/ed-portrait.jpg`?
  
  Apply his feedback, rerun tests, commit with message `style: v1 feedback from Ed`.

---

### Task 11: Subagent design review loop (max 4 rounds)

**Files:**
- Modify: `src/**` as directed by reviewers
- Create: `docs/review/round-N/*.png`, `docs/review/round-N/findings.md`

- [ ] **Step 1: Capture round screenshots**

Run: `npm run shots -- round-1` (increment N each round)

- [ ] **Step 2: Dispatch four reviewer subagents in parallel** (Agent tool, `general-purpose`), one per lens. Each gets this prompt with `{LENS}` and `{CRITERIA}` filled in:

```
You are a harsh senior design reviewer. Review the portfolio screenshots in
/Users/ed/Claude/Cowork/UI UX Design/porcelain-portfolio/docs/review/round-N/
(home and case study, desktop 1440 and mobile 375). Also read the spec at
docs/2026-10-03-porcelain-portfolio-design.md and the source in src/.

Lens: {LENS}
Criteria: {CRITERIA}

Return: PASS or FAIL for this lens, then at most 8 findings, most severe first.
Each finding: what is wrong, where (file + selector or screenshot region), and
the specific fix. No vague advice. Do not edit any files.
```

Lenses:
1. **Usability**: clear hierarchy in 5 seconds; a recruiter finds the case studies and contact within 10 seconds; readable case study pages; tap targets ≥44px; nothing clipped or overlapping on mobile.
2. **Accessibility**: AA contrast on every text, focus visibility, heading order, alt text quality, reduced-motion behaviour (read `src/scripts/*.ts`), landmark structure. Run `npx @axe-core/cli http://localhost:4321 http://localhost:4321/work/form-guide-redesign/` if available.
3. **Cultural balance**: reads as Chinese blue-and-white porcelain at first glance; Australian details (flora sprigs, Southern Cross, the Spire and Flinders Street) are discoverable, not loud, never labelled; no generic "Asian" or Japanese motifs; gold within ~3% per viewport.
4. **Not AI-generated**: no template tells (symmetric centred everything, identical section padding all the way down, generic icon grids, lift-and-tilt hovers, filler copy, glossy gradients); artwork reads as one coherent hand; copy follows `/Users/ed/Claude/Cowork/00_Resources/voice-principles.md`.

- [ ] **Step 3: Write `docs/review/round-N/findings.md`** merging the four reports: one section per lens with PASS/FAIL and findings. Drop duplicates. Discard any finding that conflicts with the spec or Global Constraints, noting why.

- [ ] **Step 4: Dispatch one builder subagent** (`general-purpose`) with the findings file, the spec, and the Global Constraints section of this plan. Instruction: apply every kept finding, then run `npm test && npm run e2e` and report results. Must not touch `content/` copy beyond what findings name.

- [ ] **Step 5: Verify and commit**

Run: `npm test && npm run e2e`
Expected: all pass.
```bash
git add -A
git commit -m "style: review round N fixes"
```

- [ ] **Step 6: Loop or stop.** If all four lenses passed this round, go to Step 7. Otherwise repeat from Step 1 with N+1. After round 3, before running the 4th (final) round, send Ed the latest screenshots and the findings summary (check-in before final round, per spec). Stop after round 4 regardless, and list any unresolved findings for Ed.

- [ ] **Step 7: Done checks**

```bash
npm run build
npx lighthouse http://localhost:4321 --only-categories=accessibility,performance --chrome-flags="--headless" --output=json --output-path=docs/review/lighthouse-home.json
npx lighthouse http://localhost:4321/work/form-guide-redesign/ --only-categories=accessibility,performance --chrome-flags="--headless" --output=json --output-path=docs/review/lighthouse-case.json
node -e "for (const f of ['home','case']) { const r = require('./docs/review/lighthouse-' + f + '.json'); console.log(f, 'a11y', Math.round(r.categories.accessibility.score*100), 'perf', Math.round(r.categories.performance.score*100)); }"
```

Expected: accessibility ≥95 on both. Check the browser console on both pages for errors (none allowed). On the mobile Playwright project, check the hero tram test passes (smooth on mobile). Fix anything below target, then commit.

---

### Task 12: Handoff docs

**Files:**
- Create: `README.md`
- Modify: `/Users/ed/Claude/Cowork/UI UX Design/CLAUDE.md` (add a Resources row for this plan)

- [ ] **Step 1: Create `README.md`** (read voice principles first; write for Ed, plain English)

```markdown
# Porcelain portfolio

Ed's portfolio site. Astro + Keystatic.

## Run it

    npm install
    npm run dev

Site: http://localhost:4321
Edit case studies: http://localhost:4321/keystatic

## Add or edit a case study

Open /keystatic, pick Case studies, then create or edit one. Fill in the dek, outcome and stat panels (whole numbers). Set a cover image and its alt text. Save. The page appears at /work/<slug>/ and on the home page in the order you set.

## Artwork

All image prompts and approved generation ids are in docs/image-prompts.md. Raw downloads go in art/. After replacing a file in art/, run:

    npm run optimise:art

It fails if the hero goes over 600KB.

## Tests

    npm test        unit tests
    npm run e2e     page, accessibility and motion tests (desktop + mobile)

## Docs

- docs/2026-10-03-porcelain-portfolio-design.md: the design spec
- docs/2026-10-03-porcelain-portfolio-plan.md: the build plan
- docs/review/: screenshots and findings from each review round

## Not done yet

Deploy to Netlify, Keystatic GitHub mode for editing online, custom domain, Punters Home Page case study.
```

- [ ] **Step 2: Add a Resources row** to `/Users/ed/Claude/Cowork/UI UX Design/CLAUDE.md`:

```
| porcelain-portfolio/README.md | Running, editing or regenerating art for the porcelain portfolio |
```

- [ ] **Step 3: Propose a memory entry to Ed** (memory entries need his approval). Suggested entry for `UI UX Design/MEMORY.md` Key Decisions: "[date] Porcelain portfolio built: Astro + Keystatic, layered Melbourne hero, Chinese-first with hidden Australian details. Lives in porcelain-portfolio/, own git repo. Deploy still to do." Write it only if Ed says yes.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: README and handoff"
```
