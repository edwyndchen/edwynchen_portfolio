# Edwyn Chen — Porcelain Design System (青花)

A personal design-system for **Edwyn Chen**, a digital / UX designer. The brand is
built on the visual language of **blue-and-white porcelain (青花瓷)** and **Chinese
ink painting**: cobalt illustration on a warm porcelain-glaze ground, red seal
stamps, scroll and lattice motifs, and refined classical serif typography.

> The vibe is a quiet **museum exhibition** — considered, spacious, and reverent —
> that still **embraces the imperfections** of the hand and the medium: the bleed
> of ink, the crackle of glaze, the off-register of a woodblock print.

**Tagline in use:** *"Design with Clarity. Crafted with Intention."* ·
*"Good design is the bridge between culture and clarity."*

---

## Sources given

These were the only inputs; there is no codebase or Figma file.

- `uploads/Logo Primary Long.svg` — horizontal wordmark + mark (→ `assets/logo-wordmark.svg`)
- `uploads/Logo Mark Primary.svg` — the primary mark, a single quarter-arc "gate" form (→ `assets/logo-mark.svg`)
- `uploads/Logo Mark Secondary.svg` — the secondary mark, a four-petal floral / lattice medallion built from four arcs (→ `assets/logo-mark-secondary.svg`)
- `uploads/hf_20260723_130954_*.png` — reference mockup: portfolio landing + graphic-design grid (porcelain vases/plates, scroll carousel, seal stamps)
- `uploads/hf_20260726_054552_*.png` — reference mockup: "Design with Clarity" portfolio site, desktop + mobile (ink clouds, cranes, ornamental frames, blue florals)

Pristine originals are preserved in `assets/original/`.

> **Font substitution (needs confirmation):** No bespoke font files were provided.
> The mockups use a refined classical serif for display and a clean humanist sans
> for body. This system substitutes the closest Google Fonts —
> **Cormorant Garamond** (display), **Manrope** (sans), **Ma Shan Zheng** (Chinese brush calligraphy).
> If Edwyn has licensed brand fonts, drop the files in `assets/fonts/` and swap the
> `@font-face`/import in `tokens/fonts.css`.

---

## CONTENT FUNDAMENTALS

**Voice:** calm, literate, confident-without-loud. Reads like museum wall-text or a
designer's considered artist statement. Sentences are short and declarative;
they favour meaning over feature-listing.

- **Person:** first person for the designer's own voice (*"I design digital products
  and experiences that are elegant, usable, and meaningful."*). Second person when
  addressing a prospective client (*"Have a project in mind?"*). Never corporate "we".
- **Casing:**
  - Display headlines — **Title Case** or sentence-case set in the serif
    (*"Designing Meaningful Experiences"*, *"Design with Clarity. Crafted with Intention."*).
  - Eyebrows / section labels — **UPPERCASE, letterspaced** sans
    (`DIGITAL DESIGNER`, `SELECTED WORK`, `DESIGN VISION`, `CONTACT`, `CAPABILITIES`).
  - Body — sentence case, generous line-height.
- **Tone words the brand lives by:** Heritage · Refined · Modern · Intentional.
  Clarity, balance, craft, meaning, culture. Use these sparingly and sincerely.
- **Punctuation:** the em-dash and the period are the whole toolkit. No exclamation
  marks. A single period can *be* the emphasis (*"Crafted with Intention."*).
- **Chinese characters** appear as considered accents, not decoration-by-default:
  short couplets or single characters (e.g. `以简驭繁 · 匠心如一` — "govern the complex
  with the simple; craftsmanship, constant as one"). Always set in the serif CJK
  face, always small and quiet, often paired with a seal.
- **Emoji:** never. **Icons:** thin, geometric, used as quiet wayfinding, not emphasis.
- **Numbers/stats:** rare. This is a portfolio, not a dashboard — let the work speak.

*Sample microcopy:* `EXPLORE MORE →` · `View Case Study →` · `Let's talk` ·
`Hover to reveal` · `More about my approach →` · `Get in touch`.

---

## VISUAL FOUNDATIONS

**Overall:** a warm ivory "porcelain glaze" canvas carrying cobalt ink illustration,
with deep-navy sections for contrast and a single seal-red accent. Everything
breathes — whitespace is the primary material.

- **Color:** blue-and-white porcelain (青花).
  - *Cobalt* `--blue-700 #3231b0` is the primary — the wordmark, links, primary
    actions. A full blue scale (50→950) supports illustration midtones and the
    deep-navy `--blue-950 #0d0b45` used for full-bleed dark sections + footer.
  - *Paper* is a warm ivory `--paper-50 #faf8f2` (page) / `#f4f0e6` (scroll paper),
    NOT pure white. Pure `--paper-0 #fff` is reserved for the fired-porcelain body
    of product cards.
  - *Seal red* `--seal-500 #a6342b` is the one warm accent — stamps, rare emphasis.
    Never large fills; think a chop-mark in the corner.
  - *Celadon* green is a rare botanical secondary (wellness work only).
  - Max one or two background colors per surface: ivory, or deep navy.
- **Type:** Cormorant Garamond display (high contrast, elegant, museum), Manrope
  for UI/body/labels, Ma Shan Zheng (brush calligraphy) for Chinese. Display runs large with slightly
  negative tracking; labels run small, uppercase, `+0.18em` tracking. Quotes are
  serif italic.
- **Spacing:** 4px base, but sections are generous (`--space-10 = 128px` rhythm).
  Exhibition-grade breathing room; content columns are narrow and centered.
- **Backgrounds / imagery:**
  - Warm ivory ground, often with a **faint watermark** — a ghosted blue floral
    branch or a lattice pattern at ~4–8% opacity, bleeding off an edge.
  - **Hand-drawn ink illustration** is central: clouds (祥云), waves, cranes/birds,
    plum & lotus blossoms, all in cobalt line-and-wash. Full-bleed on hero and CTA.
  - **Real porcelain photography** (vases, plates, tiles) on ivory or navo grounds
    for portfolio grids — cool-toned, softly lit, gentle drop shadow, as if on a
    gallery shelf.
  - **Scroll (卷轴) motif** — horizontal hand-scroll with wooden rollers as a
    carousel container.
  - No harsh gradients. Where gradient exists it is a soft ivory→pale-blue vignette
    or the natural wash of an ink illustration.
- **Texture / imperfection:** subtle paper grain, the crackle of glaze, off-register
  edges, ink bleed. Embrace it — never flatten to a sterile vector look.
- **Borders:** thin cobalt hairlines. Portfolio cards carry an **ornamental corner
  frame** (a Chinese lattice/ruyi border, 1.5px cobalt) — the signature card
  treatment. Elsewhere borders are single 1px hairlines in `--blue-100/200`.
- **Corner radii:** sharp by default. **Cards and images have square corners**
  (`--radius-card: 0`, `--radius-image: 0`) — the exhibition/porcelain-tile look.
  Small radii (`--radius-xs 4px`, `--radius-md 8px`) exist for incidental UI only.
  No pill buttons except tiny dot indicators.
- **Cards:** ivory or white body, thin cobalt hairline OR the ornamental corner
  frame, soft cool-tinted shadow (`--shadow-sm/md`). No colored left-border accents.
- **Shadows:** soft, low, cool-blue-tinted (`rgba(13,11,69,…)`), never gray or harsh.
  The floating hero porcelain plate gets the one dramatic `--shadow-float`.
- **Motion:** calm and intentional. Long ease-outs (`--ease-entrance`), gentle
  fades and rises, ~260–520ms. **No bounce, no spring, no snap.** Ink should settle,
  not pop.
- **Hover:** links & primary actions darken one cobalt step; photos reveal an
  overlay caption ("Hover to reveal") with a slow fade + slight zoom on the image.
- **Press:** darken a further step and a 1px settle (translateY(1px)) — no shrink-bounce.
- **Focus:** 2px `--focus-ring` cobalt ring, 2px offset.
- **Transparency / blur:** used lightly — ghosted watermark florals, the semi-opaque
  caption bar over photos. No heavy glassmorphism.
- **Layout rules:** centered, max ~1200px, wide margins. Fixed transparent top nav
  that gains an ivory backing on scroll. Symmetry and balance over asymmetric drama.

---

## ICONOGRAPHY

- **Brand marks (SVG, in `assets/`)** — use these, do not redraw:
  - `logo-mark.svg` — primary mark, a single quarter-arc "moon gate" form.
  - `logo-mark-secondary.svg` — four-petal medallion (four arcs) = the porcelain
    floral / lattice motif; good as a small ornament, seal-adjacent stamp, or favicon.
  - `logo-wordmark.svg` — full horizontal lockup.
  All use `fill="currentColor"` so they take cobalt, ink, or ivory from context.
- **UI icons:** thin, geometric line icons at ~1.5px stroke with **squared ends**
  (sharp joins are fine too). This system uses **[Streamline — Sharp Line (Free)](https://www.streamlinehq.com/icons/sharp-line-free/interface-essential)**
  as the closest match to the mockups' thin geometric wayfinding icons (arrow, mail,
  social). Pull icons from that set (e.g. via the Streamline integration) and keep
  `stroke-linecap="square"` and `stroke="currentColor"`.
- **Ornaments (not icons):** the "DESIGN VISION" row uses small **motif glyphs** —
  quatrefoil, ruyi-lattice diamond, medallion — drawn from the porcelain vocabulary.
  These are decorative dividers, rendered from the secondary mark family.
- **Seal stamps (印章):** red intaglio-style square chops sit beside headlines and in
  card corners as signature marks. Treat as brand ornament, sourced as SVG/PNG art.
- **Emoji:** never used.

---

## INDEX / MANIFEST

Root:
- `styles.css` — global entry (import this one file). `@import`s the four token files.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`.
- `readme.md` — this guide.
- `SKILL.md` — portable Agent-Skill wrapper.
- `thumbnail.html` — homepage tile.
- `assets/` — `logo-mark.svg`, `logo-mark-secondary.svg`, `logo-wordmark.svg`,
  `original/` (pristine uploads).

Foundation specimen cards (Design System tab): under `guidelines/` — Type, Colors,
Spacing, Brand groups.

Components (`components/`, namespace `window.EdwynChenPorcelainDesignSystem_58116c`):
- `core/` — Button, Eyebrow, Seal, Logo
- `content/` — WorkCard (ornamental-frame portfolio card), CaseStudyFrame (scroll-mounted case-study cover), MotifDivider, Blockquote
- `feedback/` — Badge, RevealImage

UI kits (`ui_kits/`):
- `portfolio/` — the personal portfolio website (hero, selected work, about, CTA, footer).

### Intentional additions
No source defined a component inventory (brand mockups only), so a small brand-fit
set was authored from scratch: **Logo** and **Seal** wrap the provided brand marks;
**MotifDivider** renders the porcelain ornament glyphs; **WorkCard** + **RevealImage**
encode the signature ornamental-frame + hover-reveal portfolio pattern; Button,
Eyebrow, Badge, Blockquote are the shared primitives the mockups imply.
