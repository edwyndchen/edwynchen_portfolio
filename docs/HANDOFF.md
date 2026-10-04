# Porcelain portfolio — handoff

_Last updated 2026-10-04. Read this first in any new session, then the spec._

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

Committed and green up to `98f804c` (unit 50, e2e 81 + 5 skipped). Built:

- Home: hero (7 parallax layers from Ed's hand-edited art; spreads upward on load and collapses into a tighter landscape on scroll; tram crosses the bridge; clouds sail left→right), staggered case study plates with painted covers, About, Contact, navy footer with only the gold Southern Cross.
- Case study pages for Form Guide Redesign, Punters Design System, EonX Design System, Pay By Account (Keystatic-editable). Pay By Account has no stat panels (no numbers in its source; nothing invented).
- Design system applied: Cormorant Garamond (display), Manrope (body/labels), Ma Shan Zheng (Chinese). Wordmark logo in the nav. 陳 (traditional) beside the About heading.
- Flora (waratah, wattle, banksia, gum, each separate) as free-floating spots.

**Work → About transition (Task 10e), committed in `9179464`:** About is a pinned stage. Two opaque, low-contrast cloud walls (`public/hero/cloud-wall-*.webp`) part on scroll, Ed descends between them in pose 2 (`public/images/ed-porcelain.webp`, final), then glides to the right of About (desktop) or lands centred below the text (mobile) while the text rises in. Subtle SVG wind ripple on the fabric only (mask holes `--hole-a`/`--hole-b` tuned to this pose). Reduced motion / no JS: no pin, no walls, no wind, static layout. Tests: unit 52, e2e 87 + 7 skipped. Screenshots: `docs/review/about-descend/`. Ed has not reviewed it yet.

Known rough edges from that task (look at these first):
- Desktop nav link to #about jumps to the end of the pin (intercepted in JS); on phones it lands on the heading.
- On phones Ed passes briefly over the "What I do" rows while descending.
- On desktop his robes pass under the sticky nav around 30% through the pin.

## Next steps

1. Show Ed the transition (docs/review/about-descend/ or live), fix the three rough edges above, get his sign-off.
2. Review rounds (plan Task 11): four reviewer subagents (usability, accessibility, Chinese-first/Aussie-detail balance, "looks AI-made") on 1440 + 375 screenshots; one builder applies fixes; max 4 rounds; check in with Ed before the last round. Lighthouse accessibility ≥ 95.
3. Handoff README (plan Task 12).
4. Deploy (Netlify + Keystatic GitHub mode) is out of scope until Ed asks.

## Open items for Ed

- LinkedIn URL and resume link (Contact shows them only when set in `src/data/site.ts`).
- Hero assets are 728KB (over the original 600KB budget; 7 layers). Accepted for now.
- Small dark mound between the Flinders Street dome and clock tower comes from `art/hero-source/1-far-range.png`.

## Logged minor polish (from task reviews, for the review rounds)

- devToolbar disabled globally to satisfy an h1-count test; could scope the test to `main h1` instead.
- coverAlt only enforced at build, not in the Keystatic UI.
- Hidden mobile hero clouds still tween; hero copy can flash before the reveal script runs.
- Hard-coded cover image dimensions (1600x900, real 1600x904).

## Task 10e brief (for reference)

Two cloud walls close over the end of the case studies, part on scroll (pinned stage, scrub), Ed descends centred through the gap, then glides to the right column as the About text fades/rises in on the left; end state equals the static About layout. Mobile: same, lands below the text. Reduced motion / no JS: static layout, no pin. Walls fully opaque, low contrast, no flat edge ever visible. Fabric wind ripple on sleeves/ribbon/robes only. Tests: stage between #work and About, wall parting, Ed ends right and opaque, reduced-motion static, no horizontal overflow at 320/1440, axe green.

## How Ed likes to work on this project

- Show 2–4 options side by side and let him pick; he gives precise visual feedback and iterates.
- Art rules he set: no corner ornaments; clouds' wispy tails trail left (they travel left→right); no hard or cropped edges anywhere; figures and objects must sit fully inside their frame with margin; everything solid/opaque where layered (nothing see-through behind mountains or buildings); artwork blues match the hero landscape (use `art/portrait/recolor.mjs`); Melbourne kept simple (Spire + Flinders Street + tram only); Chinese first, Australian details subtle and never labelled.
- Higgsfield: Seedream 5.0 Pro for landscape/cloud art (reference the approved hero `7fe457e1`), Nano Banana for Ed's likeness. Local images upload via `media_upload` + curl PUT (header `If-None-Match: *`), since the upload widget doesn't render in the Code tab.
