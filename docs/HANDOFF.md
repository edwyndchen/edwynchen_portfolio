# Porcelain portfolio — handoff

_Last updated 2026-10-05 (after the round 3–8 commit). Read this first in any new session, then the spec._

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

Committed up to the latest commit on `main` (unit 66, e2e 160 passing, 18 skipped). The State section below describes round 2; rounds 3 to 8 follow it. Built:

- Colours: "Kiln cobalt", the blue ramp sampled from the painted art (primary `#3231b0`), in the site tokens and the design system.
- Hero: one line ("Melbourne-based product designer making the world more accessible and beautiful, one screen at a time."), View work under it. Clouds: 8 new (v1-v4 long bands, v5-v8 soft billows, few curls), recoloured pale; 2 gentlest old ones kept; 20% faster. `npm run hero` rebuilds them and no longer touches the hand-cropped right About wall.
- Nav: Work, About, Contact | Workshop (plain link after a hairline), then a Pause motion button (stops every endless animation and the page transition; remembered via localStorage; `src/scripts/motion.ts`). Phones: brush mark, Menu holding all four links, Pause motion.
- About: pinned cloud-wall stage on desktop/tablet/phone; fabric wind with a stillness map per outfit (tune at `/?wind` in dev). Ed is a button: a puff of cloud and a costume change through three different outfits and poses (hanfu; Tang-style festival jacket with pig mask and piglet; Song-style robe pouring a vase), `src/scripts/outfit-swap.ts`.
- Workshop (`/workshop/`): lattice header titled Workshop, statuses On the easel / Fired / Sketch, "Brushes and tools" filter, placeholder frames until images are added. The waratah, gum and wattle live here now (none on the home page). Two draft entries (HYROX Lap Timer, Our Attachments) for Ed to edit and publish.
- Case studies: image across the top (Keystatic `hero`, falls back to the cover), then a cobalt band (title, tags, `overview` field, at a glance; no Results), then the story with the On this page column (sticky; a strip on phones). Problem has a Section image block; Outcomes and Process have Gallery (carousel) blocks with four placeholder slides.
- Contact: a hanging scroll (painted wooden rods, silk mount, pale range and clouds from `npm run range`, cobalt Southern Cross) holding the heading and links (form removed in round 5).
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
- `/lab/` held alternative page transitions and lattices (removed 2026-10-05; recover from commit `1183d45` if needed).
- Dev hook: `window.__puff` (dev only) is the last puff timeline. Headless Chromium skips GSAP timelines when you scrub it, so judge the puff in a real browser (`__puff.timeScale(0.1)`).

## Round 5 (2026-10-05)

- Hero: the back layer (far range plus the Southern Cross) is `data-static`: it sits at its settled position and never moves on scroll or pointer.
- About: a "Let’s make some magic" tag follows the wand cursor. The new outfit is hidden at the swap and fades in only as the billows thin away (`PUFF_REVEAL`). The hanfu is repainted (shawl over both arms, rounded hem) and, like the others, only its shawl moves in the wind.
- Contact: the form is gone (heading, line and icons, centred). The seal stands upright, face down, and drifts in softly; the stamp is a round seal-red disc with the mark cut through (see-through).

## Round 6 (2026-10-05)

- Landing: Door B painted doors with the secondary mark in the moon window (`Intro.astro`, `intro.ts`). Shown on every fresh arrival or reload (not on in-site clicks), held until the page is ready plus at least 0.5s (`INTRO_LINGER`). Preview: `/?intro`.
- Page transitions stay the brush strokes.
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

## Round 9 (2026-10-05)

- Landing: the porcelain holds until the logo has landed, then fades (`intro.ts`); the nav logo really is hidden during the flight (the old rule was scoped to Intro and never applied).
- Contact (home page only, `<Contact scroll />`; other pages get just the line and the links): no visible heading (a hidden "Contact" h2 names it); steps "1 Paint, 2 Add animal, 3 Seal" and icon buttons above the scroll. The cheeky per-step prompts (`PROMPTS`) are screen-reader only now. Strokes feather at the edge (`SOFTNESS`). The brush and seal live on the scroll, not the paper, so they pass over the rods. Under it: "Let’s connect to make the world more beautiful." at h2 size, bold.
- About: the wand's floating label is gone and the wand cursor has a white halo. Out at Ed's lower left, clear of the painting, a painted hand (Ed's pick, hand B) points up at him with a "Tap me" tag under it, once he has landed (`is-landed`); it goes after the first trick (back on the next visit). Button name: "A magic trick: change Edwyn's outfit".
- Descent: the walls start parting `DESCEND.lead` (0.55 of a screen) before the pin, while the last work cards leave (pin and timeline are separate triggers now). Ed is there behind the closed walls from the very start (opaque throughout, `dropFrom` small enough that his head never shows above them) and comes down as they open, so the opening reveals him.
- Work cards: no numbers; they drift up into frame tied to the scroll (`REVEAL` in `reveal.ts`); on two-column screens the right-hand card of each row starts later (`REVEAL.lag`), so rows stagger in.
- Landing doors: the messy painted key-fret border is repainted as a clean mitred frame with keylines and corner blocks (`art/round9/door-frame.mjs`; original kept as `art/round9/doors-before.webp`).
- Footer: no social links (Contact has them); the seal ends the copyright line, far right, travelling with Back to top when it wraps.
- Contact brush swings in and settles as it appears, like the seal.
- Case studies: "The finished work" carousel between the blue band and the story (Keystatic field `finals`, Finished work; placeholders until filled).
- Hero: we start high above the land. At the top of the page the layers behind the city stand well up and apart (`spreadPercent`, k 50; front layers dip only 30% as much), and as the scene reaches the top of the screen everything flattens close to the city's level (`collapsePercent`, c 3). The far range now moves with the rest (only its blank paper feathers); the Southern Cross has its own still layer in front of it. Clouds drift far slower the further back they are (`cloudDuration`); the back clouds are smaller, and the two flat band clouds (v1, v3) are swapped for swirly ones (r1, s2). Heading and tagline one size smaller; the name is set in Poppins SemiBold with 0.03em letter spacing, from the logo wordmark's family (`--font-wordmark`, loaded for its letters only). The scene is clipped at the sides only and has no background or mask, so layers that stand high at the top of the page rise past its top edge whole (no clipped clouds, no gradient on a peak, no line); its foot fades under an overlay (`::after`) and the copy sits above it. Only the far range has its own soft top. The Southern Cross is gone from the hero (Ed, round 9).
- About: during the descent the ribbons stream behind his motion (a velocity bias on the wind filter, `DRAG.lift`), so they billow up as he floats down. Hanfu repainted with two ribbon ends, floating higher (`art/round9/hanfu-A1-updraft.png`, placed by `art/round9/hanfu-place.mjs`, which registers the body onto the old painting so the traced wind map still fits; old one kept as `art/round9/ed-porcelain-before.webp`). The wind maps now also ripple a thin band along the hanfu's sleeve ends and hem, and the water bearer's hem slightly (`EDGES` in `art/round3/wind-maps.mjs`).
- Scroll pig: Ed switched to option 1, the crane-winged pig, 30% smaller, always flying towards the land (each scene's `land` side in `SCENES`) (own flood-fill cutout `art/round9/pig-cut.mjs`, so the white wings stay solid); before that option 2, the pig riding a ruyi cloud (`public/scroll/pig.webp`; the old one is `art/round9/pig-old.webp`).

## Round 10 (2026-10-05, in progress)

- Descent performance: the cloud walls and Ed stay on their own GPU layers for the whole stage (`will-change: transform` while staged, GSAP `force3D: true`). Before, GSAP dropped each wall to a 2D transform between phases, so the browser repainted the huge wall paintings mid-scroll (the jitter). The walls are decoded up front, and with motion paused the wind filter comes off entirely (`is-windy` follows the Pause switch).
- About: the magic-wand cursor is drawn at 72px (was 32), hotspot 16 16. It stays as the fallback: a painted porcelain ruyi sceptre (`public/about/ruyi.webp`, Ed's pick over a porcelain or wooden wand) follows the mouse over Ed and flicks on a tap (`src/scripts/magic-wand.ts`, `WAND`; lives on `<body>` so the pin never moves it; mouse and pen only).
- Smooth scrolling site-wide: Lenis on GSAP's ticker (`src/scripts/smooth-scroll.ts`, `SMOOTH.lerp` 0.09), off for reduced motion, held still during the landing doors. Same-page links, Back to top and the About link all glide through `scrollToY`. Touch keeps native scrolling.
- Descent retimed (Ed: he lingered in the centre, felt choppy): the glide starts while he is still settling (`phases` descend 0–0.45, glide 0.28–0.85, sine eases), scrub 0.4 (was 1; the smooth scroll already eases). Ed is hidden until the walls start to part and fades in over `DESCEND.appear` (his ribbon used to peek over the walls' feathered top).
- Contact scroll: the bottom rod tucks under the silk again. The rule used `:last-child`, which broke when the brush and seal were moved in after the rod; now `.scroll__rod--top` / `--bottom`.
- Hero: a slight zoom into the city as you scroll, on top of the parallax (`zoomScale` in hero-motion.ts, 0.12, 20% more than the first cut: nearer layers grow more, far range ~4%, city ~8%, front clouds 12%; 60% of that on phones; all towards `ZOOM_ORIGIN` 50% 72%).
- Contact: a caption tucked under the scroll's bottom right corner names the place the painting is after ("The Twelve Apostles, Victoria", "Wilsons Promontory, Victoria"; `place` in `SCENES`, updates on Next scene). Ed asked for this, which overrides the earlier "Australian details never labelled" rule for this caption.
- Wand: star A is Ed's pick and the default (`?wand=ruyi` / `?wand=star-b` show the others for that visit only). Its flick is a quick -8° from the handle end (`grip`), so the star end moves; no resting tilt, so the tip stays on the pointer.
- Hanfu brightened (Ed: he read darker than the other outfits): mid-tones lifted with gamma 1.3 by `art/round10/brighten-hanfu.mjs` from the kept original `art/round10/ed-porcelain-before-brighten.webp` (mean 129 -> 145; the water bearer is 150). Rerun it after any hanfu re-place.
- Covers (Ed's picks): Punters A, EonX B (new specimen-sheet paintings: Aa, colour shades, grid, pattern, buttons, spacing; EonX adds form fields and icons). EonX B had gibberish words painted on its buttons; a Seedream edit removed them (`6da3f945`, `art/round10/eonx-b-clean-1.png`).
- Wand: ruyi A live (Ed's pick). Two traditional porcelain star wands to compare (`/about/wand-a.webp`, `wand-b.webp`, cut by `art/round10/wand-cut.mjs`): open `/?wand=star-a`, `/?wand=star-b` or `/?wand=ruyi` (remembered in localStorage, `WANDS` in magic-wand.ts). A click throws a burst of cobalt stars and sparkles from the tip (`SPARKS`, `burst()`); a tap on a phone bursts from the finger.
- Landing doors: the frame's inner edge moved 14px in to cover the old painting's wobbly inner moulding (a broken double line), and the moon mask is fitted to the ring (`cy 568.5, r 358`), so the seam-side frame runs into the ring with no key-fret stub (`art/round9/door-frame.mjs`).

## Next steps

Everything through round 9 is committed and pushed to GitHub: https://github.com/edwyndchen/edwynchen_portfolio (public, `main`).

1. Ed uploads real images for Workshop entries and case studies in Keystatic, and replaces the placeholder Workshop write-ups.
2. Review round 2 (plan Task 11): four reviewers, screenshots at 1440, tablet and 375. Worth checking live: the cloth drag on the descent, the flowing water, the brush cursor.
3. Handoff README, then deploy when Ed asks.

## Open items for Ed

- Old scroll files kept for now (Ed, 2026-10-05): `public/hero/contact-*.webp`, `scripts/contact-range.mjs` (`npm run range`), and unused `public/scroll/` cloud-a to d, range, range-sketch, river, river-sketch. Revisit before launch.
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
- Art rules from rounds 3 to 9: illustrations must read as drawn (every part outlined, never photographic); all About outfits keep the same figure size; only ribbons, water and the thin outer edge of sleeves and hems ripple (bodies masked out via painted maps in `art/round3/wind-maps.mjs`), and ribbons stream dramatically while he moves; Ed is already there behind the clouds and revealed as they open, never popping in after; gradients only on the very back layer, never on a peak or anything in front; nothing is ever clipped; hero layers start high and apart, then flatten as you scroll down; any new scene or creature matches the hero's bold cobalt and the About figures' style; seal impressions are round, opaque, tilted right and about 95% clean.
- Higgsfield: Seedream 5.0 Pro for landscape/cloud art (reference the approved hero `7fe457e1`), Nano Banana for Ed's likeness. Local images upload via `media_upload` + curl PUT (header `If-None-Match: *`), since the upload widget doesn't render in the Code tab.
