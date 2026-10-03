# Portfolio UI Kit — Edwyn Chen

A high-fidelity recreation of Edwyn Chen's personal portfolio site (the
"Design with Clarity. Crafted with Intention." landing page from the reference
mockups). Built entirely from the design-system component library.

## Files
- `index.html` — the interactive page. Sticky nav (smooth-scroll to sections),
  a working "Let's talk / Get in touch" affordance (confirmation toast), and
  hover-reveal gallery tiles.
- `Sections.jsx` — the page sections: `Nav`, `Hero`, `SelectedWork`, `Gallery`,
  `About`, `ContactCTA`, `Footer`. Each composes DS primitives (Button, Logo,
  Eyebrow, Seal, WorkCard, RevealImage, MotifDivider, Blockquote, Badge).

## Notes / placeholders
- The hero **ink illustration** (clouds, cranes, blossoms in the mockups) is
  represented by a porcelain-plate wash + brand mark + CJK couplet. Drop real
  hand-drawn ink art in its place — this system never auto-draws illustration.
- Gallery tiles use CJK watermark placeholders instead of real porcelain
  photography. Swap `RevealImage`'s `src` for real images when available.
