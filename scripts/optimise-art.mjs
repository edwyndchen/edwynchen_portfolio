import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import sharp from 'sharp';

const ART = [
  ...['waratah', 'wattle', 'banksia'].map((p) => ({ src: `art/flora/${p}.png`, out: `public/flora/${p}.webp`, width: 700, trim: true })),
  { src: 'art/flora/gum.png', out: 'public/flora/gum.webp', width: 900, trim: true },
  ...['form-guide-redesign', 'punters-design-system', 'eonx-design-system', 'pay-by-account'].map((slug) => ({
    src: `art/covers/${slug}.png`, out: `public/images/case-studies/${slug}/cover.webp`, width: 1600, trim: false,
  })),
];

for (const item of ART) {
  mkdirSync(dirname(item.out), { recursive: true });
  let img = sharp(item.src);
  if (item.trim) img = sharp(await img.trim({ threshold: 5 }).toBuffer());
  await img.resize({ width: item.width, withoutEnlargement: true }).webp({ quality: 74, alphaQuality: 85 }).toFile(item.out);
  console.log(`✓ ${item.out}`);
}
