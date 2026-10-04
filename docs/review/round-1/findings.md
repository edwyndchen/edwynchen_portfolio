# Review round 1 — findings

_2026-10-04. Screenshots in this folder (captured before the lazy-image fix to `scripts/screenshots.mjs`, so Ed's figure, the gum and the wattle are missing from them; that "gap" is a capture artefact, not a layout bug)._

| Lens | Result |
| :-- | :-- |
| Usability | FAIL |
| Accessibility | FAIL (Lighthouse 100 / 100, axe 0 violations; fails WCAG 2.2.2 pause control) |
| Cultural balance | FAIL |
| Not AI-generated | FAIL |

## A. Builder applies now (clear-cut, no change to approved art or choreography)

1. **Cropped flora (art rule: no cropped edges).** Banksia on case pages is cut by the title plate and the right clip (`[slug].astro` `.case-head` / `.flora--case`). Waratah's right leaf is cut flat by `.work { overflow-x: clip }` with `.flora--right` at a negative offset (`WorkPlates.astro`, `Flora.astro`). Fix so both sit fully visible with margin, without reintroducing horizontal overflow at 320–1440.
2. **About nav link doesn't move keyboard focus** (`about-descend.ts` click handler and `#about` hash branch): after scrolling, `tabindex="-1"` + `focus({ preventScroll: true })` on the About root.
3. **陳 mark contrast 2.05:1** (`About.astro` `.about__mark`, `--blue-300`): change to `--blue-400` (3.22:1, passes large-text 3:1). Font itself is in section B.
4. **Home card alt text is noise:** `WorkPlates.astro` `.work__cover` → `alt=""`. Keep `coverAlt` on the case-study cover.
5. **Reduced motion only checked at load** (`hero-motion.ts`, `reveal.ts`): use `gsap.matchMedia()` with `(prefers-reduced-motion: no-preference)` like `about-descend.ts` already does.
6. **Results list has no heading** (`StatPanels.astro`): wrap in `<section aria-labelledby>` with an `h2.label` "Results" styled like `.glance h2`; drop the `aria-label`.
7. **Mobile nav "Work" link 38px wide:** `.nav__links a { min-width: 44px; justify-content: center; }` (or equivalent) in `Nav.astro`.
8. **No contact path at the end of case studies:** render the existing `<Contact />` after `<CaseNav />` in `[slug].astro`.
9. **Outcome numbers repeated 5–6 times on case pages:** in `AtAGlance.astro`, skip the Outcome row when the case study has metrics. (No copy edits.)
10. **Stock hover lift on cards:** remove the `box-shadow` lift and cover `scale(1.03)` in `WorkPlates.astro`; use a rim colour change on hover/focus instead (e.g. outline/border to `--cobalt`).
11. **Hero top edge shows a faint line** where the cooler sky meets the paper: lengthen the `.hero__scene` mask fade (about 18%).
12. **Test gap:** the 陳 test only checks CSS `font-family`, so it passed while the glyph was falling back. Leave a `test.fixme` note for now; a real glyph check comes with the font fix in B.

## B. Ed decides (art, copy, approved choreography, or new UI)

1. **陳 isn't in the brush font (confirmed).** Ma Shan Zheng only has simplified 陈; traditional 陳 falls back to a plain system glyph. Recommendation: pick a traditional-capable brush/calligraphy font, loaded for that one character only. Show 2–3 candidates side by side.
2. **About transition length and mobile overlap** (usability + accessibility). Desktop pin is about 1.8 screens with no readable text until 65%; Ed's head passes under the nav; text and Ed start at opacity 0 (invisible-but-read content). On phones the walls cover "What I do" while it's being read. Recommendation: desktop pin 180 → about 90, text never fully invisible, glide starts earlier; phones drop the pin and walls for a simple one-shot drift-in.
3. **Pause-motion control (WCAG 2.2.2, Level A).** Hero clouds, tram, Southern Cross twinkle, Ed's float and the fabric wind loop forever. Needs a visible "Pause motion" toggle (likely in the nav) that remembers the choice. Recommendation: a small text toggle in the nav; show Ed the look first.
4. **Case-study body reads as a template.** One column, about 40% of the page empty for 5,000px, uniform section rhythm, no porcelain element below the cover. Options: sticky At-a-glance aside, a cloud-scroll divider before Process and Learnings, a flora spot beside Process.
5. **Punters, EonX and Pay By Account covers** read as vector-ruled (and the card has a glossy sheen) next to the brushed hero. Regenerate in Seedream 5.0 Pro off hero `7fe457e1` (costs credits). Cover paper is also creamier than the page, so covers show as boxes.
6. **Copy: "X, not Y" lines and mechanical bolding** in `form-guide-redesign.mdoc` and `punters-design-system.mdoc` (exact before/after in the reviewer's report), plus Contact headline, hero line, and the Overview restating the metrics. Ed's voice, Ed approves line by line.
7. **Flora below the hero is louder than the Chinese elements.** Suggest `clamp(88px, 11vw, 168px)` (about 70% of current).
8. **Flinders Street linework** is crisper than the rest of the hero. Art edit in `art/hero-source/`, then `npm run hero`.
9. **Contact block** is the only centred section. Suggest left-aligning to match the rest.
10. **Footer shows "© 2026 Edwyn Chen"**; spec section 9 says Southern Cross only. Keep or remove?
11. **LinkedIn and resume URLs** still empty in `src/data/site.ts`. Ship blocker for recruiters.

## Discarded

- Moving the banksia to the Learnings heading (cultural): A1 fixes the crop in place; moving it is a layout call, folded into B4.
- Using opacity to quieten flora: breaks the solid-artwork rule.
