// The contact scroll's mountains: the hero's two peak layers combined and lifted towards the scroll paper, so they
// read as a pale painting behind the words. Re-run after the hero mountains change: npm run hero && npm run range
import sharp from 'sharp';
const peaks = await sharp('public/hero/peaks.webp').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const front = await sharp('public/hero/peaks-front.webp').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = peaks.info;
const out = Buffer.alloc(W * H * 4);
const PAPER = [0xf4, 0xf0, 0xe6], LIFT = 0.62;
for (let i = 0; i < W * H; i++) {
  const fa = front.data[i * 4 + 3] / 255, pa = peaks.data[i * 4 + 3] / 255, a = fa + pa * (1 - fa);
  for (let c = 0; c < 3; c++) {
    let v = a ? (front.data[i * 4 + c] * fa + peaks.data[i * 4 + c] * pa * (1 - fa)) / a : 0;
    out[i * 4 + c] = Math.round(v + (PAPER[c] - v) * LIFT);
  }
  out[i * 4 + 3] = Math.round(a * 255);
}
await sharp(out, { raw: { width: W, height: H, channels: 4 } }).trim().resize({ width: 1800 }).webp({ quality: 72, alphaQuality: 85 }).toFile('public/hero/contact-range.webp');
console.log('public/hero/contact-range.webp');

// ...and its clouds: the hero's ruyi and xiangyun clouds, lifted a little less than the range so they sit in front
for (const n of ['r2', 'r3', 's4']) {
  const { data, info } = await sharp(`public/hero/cloud-${n}.webp`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) for (let c = 0; c < 3; c++) data[i + c] = Math.round(data[i + c] + (PAPER[c] - data[i + c]) * 0.4);
  await sharp(data, { raw: info }).webp({ quality: 78, alphaQuality: 88 }).toFile(`public/hero/contact-cloud-${n}.webp`);
  console.log(`public/hero/contact-cloud-${n}.webp`);
}
