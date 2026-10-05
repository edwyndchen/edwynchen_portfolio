# Porcelain portfolio — handoff

_Last updated 2026-10-05. Read this first in any new session, then the spec._

## What this is

Ed's new portfolio site. Chinese blue-and-white porcelain at first glance, Australian details on a close look. Astro 7 + Keystatic (CMS at `/keystatic`), GSAP motion, Ed's own Porcelain Design System.

- Spec (decisions, incl. section 9 design-system adoption): `docs/2026-10-03-porcelain-portfolio-design.md`
- Original build plan: `docs/2026-10-03-porcelain-portfolio-plan.md` (Tasks 1–10 done in spirit; many were revised along the way, see below)
- Every image prompt, model and approved generation id: `docs/image-prompts.md`
- Ed's design system (tokens, components, readme): `docs/design-system/`
- Review screenshots: `docs/review/`

## Run it

```bash
cd "UI UX Design/porcelain-portfolio"
npm run dev -- --port 4321 --ignore-lock
```

Or use the `porcelain-portfolio` entry in `/Users/ed/Claude/Cowork/.claude/launch.json` (browser pane). Tests: `npm test` (unit) and `npm run e2e` (Playwright, desktop + mobile, includes axe). Hero art rebuild after Ed edits PNGs in `art/hero-source/`: `npm run hero`.

## State at handoff

Committed up to the latest commit on `main` (unit 61, e2e 175). Built:

- Colours: "Kiln cobalt", the blue ramp sampled from the painted art (primary `#3231b0`), in the site tokens and the design system.
- Hero: one line ("Melbourne-based product designer making the world more accessible and beautiful, one screen at a time."), View work under it. Clouds: 8 new (v1-v4 long bands, v5-v8 soft billows, few curls), recoloured pale; 2 gentlest old ones kept; 20% faster. `npm run hero` rebuilds them and no longer touches the hand-cropped right About wall.
- Nav: Work, About, Contact | Workshop (plain link after a hairline), then a Pause motion button (stops every endless animation and the page transition; remembered via localStorage; `src/scripts/motion.ts`). Phones: brush mark, Menu holding all four links, Pause motion.
- About: pinned cloud-wall stage on desktop/tablet/phone; fabric wind with a stillness map per outfit (tune at `/?wind` in dev). Ed is a button: a puff of cloud and a costume change through three different outfits and poses (hanfu; Tang-style festival jacket with pig mask and piglet; Song-style robe pouring a vase), `src/scripts/outfit-swap.ts`.
- Workshop (`/workshop/`): lattice header titled Workshop, statuses On the easel / Fired / Sketch, "Brushes and tools" filter, placeholder frames until images are added. The waratah, gum and wattle live here now (none on the home page). Two draft entries (HYROX Lap Timer, Our Attachments) for Ed to edit and publish.
- Case studies: image across the top (Keystatic `hero`, falls back to the cover), then a cobalt band (title, tags, `overview` field, at a glance; no Results), then the story with the On this page column (sticky; a strip on phones). Problem has a Section image block; Outcomes and Process have Gallery (carousel) blocks with four placeholder slides.
- Contact: a hanging scroll (painted wooden rods, silk mount, pale range and clouds from `npm run range`, cobalt Southern Cross) holding the heading, links and the Netlify form (works once deployed). `/thanks/` for no-JS.
- Footer: "Product designer making the world more accessible and beautiful one screen at a time.", LinkedIn and Behance, copyright line with Privacy policy, Terms of use, Back to top; Acknowledgement of Country band below with the Aboriginal and Torres Strait Islander flags (the latter's copyright: Torres Strait Island Regional Council). `/privacy/` and `/terms/` drafted in plain English (Ed to review; not legal advice).
- Page transition, two stages: brush strokes paint the old page cobalt, then paint the new page in (cross-document view transition; Chrome/Safari; none with reduced motion). Sprites and CSS built by `npm run transition` (`scripts/brush-reveal.mjs`).
- Dev gotcha: after adding imports or `markdoc.config.mjs` changes, restart the dev server (Vite's "Outdated Optimize Dep" breaks Keystatic until then). Screenshots: block Google Fonts in Playwright scripts, they hang from here.
- Note: `art/` is git-ignored (large sources and build scripts live there, untracked).

## Round 3 fixes (2026-10-05)

- Clouds everywhere (hero, About walls, puff) now use the mountains' cobalt ramp; hero Southern Cross is cobalt.
- Pig outfit: ribbon loops over both arms. Aquarius: one stream from the vase. On both, only the ribbon and water ripple; the body is held by a painted map (`OUTFIT_MAP` in `fabric-wind.ts`, built by `art/round3/wind-maps.mjs`). Hanfu keeps its ellipses.
- Puff: 12 large billows cover the whole figure, the outfit swaps under full cover (`PUFF_SWAP`), and the new outfit is already showing as they clear. No fade-in.
- Contact scroll: rods, range and clouds repainted in the art's cobalt brushwork (`npm run scroll`, `scripts/scroll-art.mjs`); glaze-white paper with a cobalt keyline. `public/hero/contact-*.webp` and `scripts/contact-range.mjs` are no longer used (left in place until Ed confirms they can go).

## Round 4 (2026-10-05)

- Hero: clouds mix the swirly xiangyun/ruyi with the earlier long bands and billows. Southern Cross is the back layer: behind the painting, outside the parallax, above the right peak, 50% bigger.
- Contact scroll: one painting with its clouds painted in, fitted inside the inner keyline; the silk tucks under the rods (no gap). Email, LinkedIn and Behance are icon buttons (footer too, `SocialIcon.astro`).
- Stamp: hovering the heading wakes a porcelain seal that follows the pointer; one click on the paper presses Ed's mark in seal red, once (`src/scripts/stamp.ts`, `SealStamp.astro`). Mouse/trackpad only.
- About: the outfit paintings are decoded up front and the swap waits for them; a solid mist sits behind the billows, which now land opaque within 0.06s. "Tap me" is gone: a cobalt magic-wand cursor over Ed, and three sparkles glint by him every few seconds (rest when motion is paused).
- Intro: first page of a visit, two cobalt doors carry the secondary mark; they part and the top-left quarter shrinks onto the nav logo (`Intro.astro`, `src/scripts/intro.ts`). Skipped with reduced motion, paused motion, or in Playwright; preview any time with `/?intro`. 4.5s fail-safe.
- Workshop header: painted begonia lattice (`public/workshop/`), pending Ed's pick.
- `/lab/` (noindex, unlinked; delete before launch): four page-transition styles (straight, waves, loops, vortex; `npm run brush-lab`) and the four lattices.
- Dev hook: `window.__puff` (dev only) is the last puff timeline. Headless Chromium skips GSAP timelines when you scrub it, so judge the puff in a real browser (`__puff.timeScale(0.1)`).

## Round 5 (2026-10-05)

- Hero: the back layer (far range plus the Southern Cross) is `data-static`: it sits at its settled position and never moves on scroll or pointer.
- About: a "Let’s make some magic" tag follows the wand cursor. The new outfit is hidden at the swap and fades in only as the billows thin away (`PUFF_REVEAL`). The hanfu is repainted (shawl over both arms, rounded hem) and, like the others, only its shawl moves in the wind.
- Contact: the form is gone (heading, line and icons, centred). `/thanks/` is now unused. The seal stands upright, face down, and drifts in softly; the stamp is a round seal-red disc with the mark cut through (see-through).
- `/lab/` adds a mist transition and two lattice-door transitions with the secondary mark in the moon window.

## Round 6 (2026-10-05)

- Landing: Door B painted doors with the secondary mark in the moon window (`Intro.astro`, `intro.ts`). Shown on every fresh arrival or reload (not on in-site clicks), held until the page is ready plus at least 0.5s (`INTRO_LINGER`). Preview: `/?intro`.
- Page transitions stay the brush strokes. `/lab/` still holds the alternatives (delete before launch).
- Workshop: octagon and plum blossom lattice; no flora anywhere on the page.
- Contact is now "Let’s make something beautiful together." with the icon links, above a scroll you paint on (`scroll-paint.ts`): a pulsing skeleton of the scene, a bristle brush that reveals the painting, then a flying pig, then the seal; next-scene arrow (mountains, river), Start again, and a button for every step. Stamp is fully opaque.
- Footer: Ed's seal (named image) instead of the Southern Cross; flags stacked at the same size (Aboriginal flag redrawn at its official 1:2); Pause motion moved here from the nav (still needed for WCAG 2.2.2).
- About: hanfu repainted (new shawl, softer hem, bigger); Aquarius has both feet and outlined hands; its stream "flows" (the wind noise travels, `WATER_FLOW`).

## Round 7 (2026-10-05)

- Landing: the doors keep the whole mark and carry it away; behind them Ed's logo and name, which then shrink onto the nav logo. Cleaned-up Door B art.
- Pause motion is back in the nav (Ed's choice; needed for WCAG 2.2.2).
- About: hanfu repainted (high floating shawl, smaller sleeves); pig outfit re-framed smaller so all three match. The cloth drags with his motion during the descent and glide (`DRAG` in fabric-wind.ts: speed pushes harder and streams the ripples against the direction of travel).
- Scroll: the Twelve Apostles and Wilsons Promontory (the mountains and river are gone), a realistic cobalt pig, a foreshortened brush that follows the pointer, the seal and stamp tilted right, a rustic imperfect stamp (still solid ink). The prompt and buttons sit under the scroll.
- Workshop project pages use the case study layout (image, cobalt band with overview, at a glance and a "See it live" button when there's a link, then the write-up). New Keystatic fields: overview, role, timeline; the Section image and Gallery blocks work in write-ups. Both drafts have placeholder write-ups to replace.

## Round 8 (2026-10-05)

- Landing: the logo never fades on its way to the nav; only the porcelain behind it does.
- Hero: the far layer's top edge feathers out (no line between copy and mountains).
- About: the white-line glitch came from the drag trail building up; it now springs back (`DRAG.settle`), the water's flow is two cross-faded copies that never run out (`flowCopies`), and the filter region is wider.
- Contact: the steps sit above the scroll (the current one is highlighted), "Contact me to make more beautiful work together." and the icons sit under it. New 30° seal and brush, bold-cobalt Apostles and Prom, a spotted pig matching the About piglet, and a cleaner seal impression (slight imperfections only).

## Next steps

Nothing from rounds 3 to 8 is committed yet.

1. Ed decides: delete `/thanks/` (unused since the form went), the old scroll files (`public/hero/contact-*.webp`, `scripts/contact-range.mjs`, unused rods/range in `public/scroll/` from earlier rounds) and `/lab/`?
2. Commit this round when Ed says so.
3. Ed uploads real images for Workshop entries and case studies in Keystatic, and replaces the placeholder Workshop write-ups.
4. Review round 2 (plan Task 11): four reviewers, screenshots at 1440, tablet and 375. Worth checking live: the cloth drag on the descent, the flowing water, the brush cursor.
5. Handoff README, then deploy when Ed asks.

## Open items for Ed

- LinkedIn URL and resume link (Contact shows them only when set in `src/data/site.ts`).
- Hero assets are 728KB (over the original 600KB budget; 7 layers). Accepted for now.
- Small dark mound between the Flinders Street dome and clock tower comes from `art/hero-source/1-far-range.png`.

## Logged minor polish (from task reviews, for the review rounds)

- devToolbar disabled globally to satisfy an h1-count test; could scope the test to `main h1` instead.
- coverAlt only enforced at build, not in the Keystatic UI.
- Hidden mobile hero clouds still tween; hero copy can flash before the reveal script runs.
- Hard-coded cover image dimensions (1600x900, real 1600x904).
- Dev server sometimes serves stale component CSS after an edit: `touch` the file.

## Task 10e brief (for reference)

Two cloud walls close over the end of the case studies, part on scroll (pinned stage, scrub), Ed descends centred through the gap, then glides to the right column as the About text fades/rises in on the left; end state equals the static About layout. Mobile: same, lands below the text. Reduced motion / no JS: static layout, no pin. Walls fully opaque, low contrast, no flat edge ever visible. Fabric wind ripple on sleeves/ribbon/robes only. Tests: stage between #work and About, wall parting, Ed ends right and opaque, reduced-motion static, no horizontal overflow at 320/1440, axe green.

## How Ed likes to work on this project

- Show 2–4 options side by side and let him pick; he gives precise visual feedback and iterates.
- Art rules he set: no corner ornaments; clouds' wispy tails trail left (they travel left→right); no hard or cropped edges anywhere; figures and objects must sit fully inside their frame with margin; everything solid/opaque where layered (nothing see-through behind mountains or buildings); artwork blues match the hero landscape (use `art/portrait/recolor.mjs`); Melbourne kept simple (Spire + Flinders Street + tram only); Chinese first, Australian details subtle and never labelled.
- Art rules from rounds 3 to 8: illustrations must read as drawn (every part outlined, never photographic); all About outfits keep the same figure size; only ribbons and water ripple (bodies masked out via painted maps in `art/round3/wind-maps.mjs`), and cloth reacts to his motion; any new scene or creature matches the hero's bold cobalt and the About figures' style; seal impressions are round, opaque, tilted right and about 95% clean.
- Higgsfield: Seedream 5.0 Pro for landscape/cloud art (reference the approved hero `7fe457e1`), Nano Banana for Ed's likeness. Local images upload via `media_upload` + curl PUT (header `If-None-Match: *`), since the upload widget doesn't render in the Code tab.
