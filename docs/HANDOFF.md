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

Committed and green up to `361c7a5` (unit 59, e2e 152 + skipped). Built:

- Home: hero (7 parallax layers), staggered case study plates, About, Contact, navy footer.
- About transition (Task 10e, signed off in principle; tuning ongoing): cloud walls part over a pinned stage. Two columns from 48rem (tablets up): Ed descends centred then glides right while the text rises in. Phones: the stage is one screen (heading, bio, Ed), the text is never faded, the walls part and clear first, then Ed drops a short way below the bio; the "What I do" list follows the pin. The right wall was repainted with short tails (`docs/image-prompts.md`).
- Fabric wind: one image warped through an feTurbulence filter scaled by a stillness map (face and both hands fully still, torso 80% still). Retune in `src/scripts/fabric-wind.ts`, or live: `npm run dev`, open `/?wind`, use the sliders, "Copy settings".
- 陳 renders in Cactus Classical Serif (Ed picked it; Ma Shan Zheng has no traditional 陳). A CDP test checks the font that actually draws it.
- Case study pages (4), Keystatic-editable, with Contact at the end.
- Workshop (`/workshop/`, Keystatic collection `workshop`): cards with status, date, skills, optional link; a write-up gives an entry its own page. Skill toggles filter the cards. New entries default to Draft (shown in dev only). Two drafts seeded from existing briefs (HYROX Lap Timer, Our Attachments) for Ed to edit, add images and publish.
- Contact: two columns, Netlify form (name, email, message, honeypot). JS sends in place with inline errors; without JS it lands on `/thanks/`. Only works once deployed on Netlify.
- Footer: Acknowledgement of Country (Wurundjeri Woi-wurrung people of the Kulin Nation), then © and the Southern Cross.
- Review round 1 done (`docs/review/round-1/findings.md`): section A applied, section B items are Ed's calls (see below).

## Next steps

1. Ed reviews the new About on his phone/tablet, the wind (via `/?wind`), Workshop, contact form and footer.
2. Round 1 section B decisions still open: pause-motion control (WCAG 2.2.2, needed), desktop pin length, case-study body layout, Punters/EonX/Pay By Account cover repaints, copy edits ("X, not Y" lines), flora size, Flinders Street linework, footer ©.
3. Review round 2 (plan Task 11) once B is settled: screenshots now include tablet (`npm run shots -- round-2`).
4. Handoff README (plan Task 12). Deploy (Netlify + Keystatic GitHub mode) only when Ed asks.

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
