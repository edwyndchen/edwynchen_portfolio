# Porcelain portfolio — handoff

_Last updated 2026-10-04 (evening). Read this first in any new session, then the spec._

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

## Next steps

1. Ed reviews this round. Waiting on Ed: real images for Workshop entries and case study hero/section/gallery images (upload in Keystatic); resume link.
2. Open from review round 1: copy edits, cover repaints, Flinders Street linework.
3. Review round 2 (plan Task 11), handoff README, deploy when Ed asks.

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
- Higgsfield: Seedream 5.0 Pro for landscape/cloud art (reference the approved hero `7fe457e1`), Nano Banana for Ed's likeness. Local images upload via `media_upload` + curl PUT (header `If-None-Match: *`), since the upload widget doesn't render in the Code tab.
