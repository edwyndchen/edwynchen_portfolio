// Smaller copies of the hero's full-width paintings for the srcset in Hero.astro (round 10: phones and non-retina
// screens were decoding and compositing 2400px layers). Run after `npm run hero` (it is chained in package.json).
import sharp from 'sharp';
const LAYERS = ['far', 'peaks', 'peaks-front', 'mid'];
const WIDTHS = [1200, 1800];
for (const name of LAYERS) {
  for (const w of WIDTHS) {
    const out = `public/hero/${name}-${w}.webp`;
    await sharp(`public/hero/${name}.webp`).resize(w).webp({ quality: 82, alphaQuality: 90 }).toFile(out);
    console.log(out);
  }
}
