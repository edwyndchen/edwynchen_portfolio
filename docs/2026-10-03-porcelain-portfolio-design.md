# Porcelain portfolio — design spec

_Created 2026-10-03. Approved in brainstorming with Ed. Fresh build, separate from `porcelain-experiment/` (left untouched for comparison). Reuses: case study copy from `Portfolio/final/`, accessibility rules and the restraint principle from `porcelain-experiment/creative-direction.md`._

## 1. Concept

**A blue-and-white porcelain plate: Chinese from across the room, Australian-born in the fine print.**

At first glance the site reads as Chinese porcelain art: cobalt engraving on white, mountain ranges, rolling clouds, lattice borders. Look closer and the details shift: the "peonies" in the borders are waratahs and banksias, the gold blossoms are wattle, the stars over the mountains are the Southern Cross, and the hero skyline is Melbourne. The site never announces this. It rewards attention.

No actual porcelain objects (no vases, plates-as-photos, 3D ceramics). The porcelain is the *art style and palette*, not the subject.

## 2. Visual system

### Palette (Gzhel-inspired)

| Token | Value | Role |
| :---- | :---- | :---- |
| `--porcelain` | #FBFAF7 | Ground everywhere |
| `--cobalt-ink` | #142B6F | Body text, headings |
| `--cobalt` | #1F3FA8 | Line art, links, primary UI |
| `--cobalt-wash` | #A9B8E6 | Decorative only (hatching fills, washes). Never text |
| `--wattle-gold` | #B8862B | Decorative only: thin rules, seal, flora highlights |
| `--gold-text` | #8A6420 | Gold when used as text (section numbers, small labels) |

Restraint rule: gold appears in small doses only (section numbers, rules, the seal, wattle blossoms). If gold covers more than ~3% of any viewport, cut it back. Every text/background pair is checked for WCAG AA contrast during build; values may shift slightly to pass, keeping the same character.

### Art style

_Updated 2026-10-03 after three rounds of style tests (see `image-prompts.md`)._

Traditional blue-and-white porcelain underglaze brushwork: confident cobalt brush strokes and flat washes in three blues, on white. Generated with Seedream 5.0 Pro, always referencing the approved hero image so all artwork reads as one hand. Flora uses a clean botanical version of the same brushwork. Chinese motifs stay Chinese (not generic "Asian": no Mount Fuji, no cherry-blossom clichés).

### Australian layer (subtle, never labelled)

- **Native flora as free-floating spot illustrations:** waratah, banksia, gum leaves and wattle, each drawn as its own separate plant, placed beside section headings or trailing off page edges. No corner ornaments (Ed rejected them). Golden wattle carries the gold accent.
- **Southern Cross:** faint stars in the hero sky.
- **Seal stamp:** 陈 (Chen) paired with a tiny Southern Cross. Ed approves the final mark before ship.

### Typography

- **Display:** Bodoni Moda: high-contrast, engraved feel, matches the line art. Used for hero statement, section titles, case study titles.
- **Body/UI:** Hanken Grotesk: 17–18px, 1.6 line height, max 68ch.
- **Labels:** Hanken Grotesk uppercase, letterspaced, 11–12px.
- No Chinese-themed novelty fonts. Font choice can be challenged in the first impeccable pass if a pairing reads better on screen.

## 3. Pages

### Home

1. **Nav:** seal + name left; Work, About, Contact right. Sticky, porcelain background.
2. **Hero (animated):** see section 4. Name, one-line positioning and a "View work" link overlay the scene.
3. **Case studies:** each shown as a framed "plate": a double cobalt keyline like a porcelain rim (no corner ornaments), cover art, title, one-line outcome, discipline tag. Links to its page.
4. **About:** portrait in a porcelain frame, short bio (≤80 words, Ed's voice), capabilities list, a quiet Melbourne-born line.
5. **Contact:** email, LinkedIn, resume link.
6. **Footer:** flora divider, small colophon.

### Case study (one template)

Title plate → "at a glance" block (role, timeline, team, platforms, outcome) → outcome-first intro → decision-led sections (each leads with the call made) → stat panels → image galleries → next/previous case study. Follows the workstation editorial rules: whole-number metrics, outcome-first, personality lines tied to real decisions.

Launch content: the four case studies in `Portfolio/final/` (Form Guide Redesign, Punters Design System, Pay By Account, EonX Design System). Punters Home Page is added later via the CMS.

## 4. Hero

Chinese mountain ranges and rolling cloud scrolls, with just two Melbourne landmarks drawn simply: the Arts Centre Spire on the left and Flinders Street Station on the right, plus a tram crossing an arched bridge. No other buildings, no towers (Melbourne 108 and Eureka dropped as too busy). Composition follows the approved hero test image (option A).

**Layers (back to front):** sky with faint Southern Cross → mountains → cloud scrolls → landmarks (Spire, Flinders St) → foreground with bridge, river and gum trees → tram.

**Motion (GSAP):**
- Clouds drift slowly and continuously.
- The tram glides across the bridge every ~12 seconds.
- Layers shift gently with mouse position (desktop) and scroll (parallax depth).
- Headline reveals once on load.
- `prefers-reduced-motion`: static composed scene, no drift, no parallax.

**Performance:** layers as optimised transparent WebP/AVIF, hero total under ~600KB, animation only on transform/opacity.

## 5. Tech

- **Astro** (static output) + **Keystatic** (file-based CMS at `/keystatic`).
- **Case study collection fields:** title, slug, order, discipline tag, one-line outcome, cover image (+ required alt), at-a-glance fields, metrics list (value + label), body sections (rich text with images, each image requires alt).
- **GSAP + ScrollTrigger** for hero and gentle scroll reveals.
- **Accessibility:** WCAG 2.1 AA contrast, semantic landmarks, skip link, visible focus ring, keyboard nav, alt text enforced by CMS, reduced motion honoured.
- **Hosting:** Netlify staging later (out of scope for this build). Keystatic runs in local mode now; GitHub mode is set up at deploy.
- **Folder:** `UI UX Design/porcelain-portfolio/`.

## 6. Image pipeline (Higgsfield)

1. **Style lock:** write one shared style prompt; generate a small test batch (one hero layer + one border). Ed approves the style before more credits are spent.
2. **Hero layers:** generate each layer separately on plain white, then remove backgrounds.
3. **Ornament set:** flora borders, plate corner ornaments, section dividers, seal draft.
4. **Case study covers:** one engraved illustration per case study, themed to the project.
5. **Approval gate:** Ed approves each batch before it is built in.

All prompts saved to `porcelain-portfolio/docs/image-prompts.md` so images can be regenerated.

## 7. Design iteration loop

1. Build v1, styled with the `/impeccable` skill.
2. Review rounds: separate reviewer subagents critique desktop (1440px) and mobile (375px) screenshots against four lenses: usability, accessibility, Chinese-first/Australian-detail balance, and "does this look AI-generated".
3. A builder subagent applies the fixes. Repeat until reviewers pass it, capped at 4 rounds.
4. Check-ins with Ed: after v1, and before the final round.

**Done means:** all four lenses pass, Lighthouse accessibility ≥95, no console errors, hero runs smoothly on mobile, and every case study renders from the CMS.

## 8. Out of scope

Live deployment, custom domain, writing the Punters Home Page case study, dark mode, a blog/journal.
