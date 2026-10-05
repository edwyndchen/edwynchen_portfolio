// The contact scroll's painted pieces (2026-10-05, Ed: rods in the art's own style, new mountains and clouds).
// Seedream sources in art/round3/ (see docs/image-prompts.md). Run: npm run scroll
//   rod-2.png    -> public/scroll/rod-{left,mid,right}.webp  (knobs sliced off; the shaft averaged into a seamless tile)
//   ../round4/scene-2.png -> public/scroll/range.webp       (mountains with their clouds painted in; white keyed out)
//   ../round4/lattice-*.png -> public/workshop/lattice-*.webp (Workshop header options, pale cobalt)
import sharp from 'sharp';
import { cobalt } from '../art/portrait/cobalt.mjs';

const SRC = 'art/round3';
const OUT = 'public/scroll';
const PAPER = [0xff, 0xff, 0xff]; // the scroll paper is glaze white (--paper-0)

const load = async (f) => {
  const { data, info } = await sharp(`${SRC}/${f}`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
};
const lum = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];

// key out the paper the painting sits on: alpha from how far each pixel is from it, colour un-mixed from it
function keyOut({ d, w, h }) {
  const bg = [d[0], d[1], d[2]];
  for (let p = 0; p < w * h; p++) {
    const i = p * 4;
    let a = 0;
    for (let c = 0; c < 3; c++) a = Math.max(a, (bg[c] - d[i + c]) / bg[c]);
    a = Math.min(1, Math.max(0, (a - 0.07) / 0.93)); // a little headroom so paper grain keys out cleanly
    for (let c = 0; c < 3; c++) d[i + c] = a ? Math.round(Math.max(0, Math.min(255, bg[c] - (bg[c] - d[i + c]) / Math.max(a, 0.07)))) : 255;
    d[i + 3] = Math.round(a * 255);
  }
}

// everything enclosed by an outline is made opaque (white wash inside a cloud or a rod stays solid)
function solidInside({ d, w, h }, thr = 50) {
  const N = w * h, outside = new Uint8Array(N), st = [];
  for (let x = 0; x < w; x++) st.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) st.push(y * w, y * w + w - 1);
  while (st.length) {
    const p = st.pop();
    if (outside[p] || d[p * 4 + 3] >= thr) continue;
    outside[p] = 1; const x = p % w;
    if (x > 0) st.push(p - 1); if (x < w - 1) st.push(p + 1); if (p >= w) st.push(p - w); if (p < N - w) st.push(p + w);
  }
  for (let p = 0; p < N; p++) {
    if (outside[p]) continue;
    const i = p * 4, a = d[i + 3] / 255;
    for (let c = 0; c < 3; c++) d[i + c] = Math.round(d[i + c] * a + 255 * (1 - a));
    d[i + 3] = 255;
  }
  return outside;
}

// onto the mountains' cobalt, then lifted towards the scroll paper by `lift`
function tint({ d, w, h }, lift = 0) {
  for (let p = 0; p < w * h; p++) {
    const i = p * 4, c3 = cobalt(lum(d, i));
    for (let c = 0; c < 3; c++) d[i + c] = Math.round(c3[c] + (PAPER[c] - c3[c]) * lift);
  }
}

const img = ({ d, w, h }) => sharp(Buffer.from(d), { raw: { width: w, height: h, channels: 4 } });
const bbox = ({ d, w, h }, x0 = 0, x1 = w, y0 = 0, y1 = h, thr = 40) => {
  // rows and columns count only with a few painted pixels in them, so stray specks never stretch the box
  const rows = new Int32Array(h), cols = new Int32Array(w);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (d[(y * w + x) * 4 + 3] > thr) { rows[y]++; cols[x]++; }
  const MIN = 6;
  let l = x0, r = x1 - 1, t = y0, b = y1 - 1;
  while (l < r && cols[l] < MIN) l++; while (r > l && cols[r] < MIN) r--;
  while (t < b && rows[t] < MIN) t++; while (b > t && rows[b] < MIN) b--;
  return { left: l, top: t, width: r - l + 1, height: b - t + 1 };
};

// --- rods ---
{
  const rod = await load('rod-2.png');
  keyOut(rod); solidInside(rod); tint(rod);
  const box = bbox(rod);
  const H = 96, k = H / box.height;
  // the knob (lotus cap and its patterned band) is the outer 15% at each end
  const knobW = Math.round(box.width * 0.15);
  const strip = (left, width) => img(rod).extract({ left, top: box.top, width, height: box.height }).resize({ height: H });
  await strip(box.left, knobW).webp({ quality: 85, alphaQuality: 95 }).toFile(`${OUT}/rod-left.webp`);
  await strip(box.left + box.width - knobW, knobW).webp({ quality: 85, alphaQuality: 95 }).toFile(`${OUT}/rod-right.webp`);
  // the shaft: every column of the plain middle averaged into one, so the tile repeats without a seam
  const sx0 = box.left + Math.round(box.width * 0.3), sx1 = box.left + Math.round(box.width * 0.7);
  const col = new Float64Array(box.height * 4);
  for (let y = 0; y < box.height; y++) for (let x = sx0; x < sx1; x++) {
    const i = ((box.top + y) * rod.w + x) * 4;
    for (let c = 0; c < 4; c++) col[y * 4 + c] += rod.d[i + c] / (sx1 - sx0);
  }
  const TW = 64, tile = Buffer.alloc(TW * box.height * 4);
  for (let y = 0; y < box.height; y++) for (let x = 0; x < TW; x++) for (let c = 0; c < 4; c++) tile[(y * TW + x) * 4 + c] = Math.round(col[y * 4 + c]);
  await sharp(tile, { raw: { width: TW, height: box.height, channels: 4 } }).resize({ height: H, width: Math.round(TW * k) }).webp({ quality: 85, alphaQuality: 95 }).toFile(`${OUT}/rod-mid.webp`);
  console.log('rods: knob', Math.round(knobW * k), 'x', H);
}

// --- the painting: mountains with the clouds painted in among them (2026-10-05, Ed: clouds part of the landscape) ---
{
  const r = await load('../round4/scene-2.png');
  keyOut(r); tint(r, 0.3);
  const box = bbox(r, 0, r.w, 0, r.h, 8);
  await img(r).extract(box).resize({ width: 1800 }).webp({ quality: 74, alphaQuality: 88 }).toFile(`${OUT}/range.webp`);
  console.log('range', box);
}

// --- Workshop header lattices: the bars keyed out of the paper, on the cobalt ramp, lifted pale so words read over them ---
{
  const { mkdirSync } = await import('node:fs');
  mkdirSync('public/workshop', { recursive: true });
  for (const n of ['ice', 'fret', 'begonia', 'octagon']) {
    const l = await load(`../round4/lattice-${n}.png`);
    keyOut(l); tint(l, 0.55);
    await img(l).resize({ width: 2000 }).webp({ quality: 74, alphaQuality: 85 }).toFile(`public/workshop/lattice-${n}.webp`);
    console.log('lattice', n);
  }
}

// --- the seal that follows the pointer once the painting is done (Ed: seen from above, face down on the paper) ---
{
  const s = await load('../round8/seal-2.png'); // round 6: foreshortened, the lion towards us, the face down on the paper
  keyOut(s); solidInside(s);
  const box = bbox(s, 0, s.w, 0, s.h, 30);
  await img(s).extract(box).resize({ width: 220 }).webp({ quality: 82, alphaQuality: 92 }).toFile(`${OUT}/seal.webp`);
  console.log('seal', box);
}

// --- /lab/ transition tests (round5): the mist bank and two pairs of lattice doors, resized for the web ---
{
  const { mkdirSync } = await import('node:fs');
  mkdirSync('public/lab', { recursive: true });
  await sharp(`${SRC}/../round5/mist-2.png`).resize({ height: 1400 }).webp({ quality: 74 }).toFile('public/lab/mist-bank.webp');
  await sharp(`${SRC}/../round5/mist-1.png`).resize({ width: 1800 }).webp({ quality: 72 }).toFile('public/lab/mist-fill.webp');
  for (const n of [1, 2]) await sharp(`${SRC}/../round5/doors-${n}.png`).resize({ width: 2400 }).webp({ quality: 76 }).toFile(`public/lab/doors-${n}.webp`);
  console.log('lab art');
}

// --- the paint-the-scroll scenes (round 6): each painting keyed onto the paper, plus a pale "skeleton" of it (its
// edges traced into thin cobalt lines) that pulses until the visitor paints ---
async function sketchOf(file, out) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info, L = new Float32Array(w * h);
  // luminance over white, so the transparent paper counts as white
  for (let p = 0; p < w * h; p++) { const a = data[p * 4 + 3] / 255; L[p] = (0.2126 * data[p * 4] + 0.7152 * data[p * 4 + 1] + 0.0722 * data[p * 4 + 2]) * a + 255 * (1 - a); }
  const o = Buffer.alloc(w * h * 4);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const gx = -L[i - w - 1] - 2 * L[i - 1] - L[i + w - 1] + L[i - w + 1] + 2 * L[i + 1] + L[i + w + 1];
    const gy = -L[i - w - 1] - 2 * L[i - w] - L[i - w + 1] + L[i + w - 1] + 2 * L[i + w] + L[i + w + 1];
    const m = Math.min(1, Math.max(0, (Math.hypot(gx, gy) - 60) / 220));
    o[i * 4] = 0x53; o[i * 4 + 1] = 0x53; o[i * 4 + 2] = 0xc4; o[i * 4 + 3] = Math.round(m * 255); // --blue-500
  }
  await sharp(o, { raw: { width: w, height: h, channels: 4 } }).webp({ quality: 70, alphaQuality: 70 }).toFile(out);
}
for (const [name, file] of [['apostles', '../round8/apostles-2.png'], ['prom', '../round8/prom-1.png']]) {
  // round 7 (Ed): the Twelve Apostles and Wilsons Promontory, in place of the mountains and the river
  const r = await load(file);
  keyOut(r); tint(r, 0.08); // nearly full strength: the hero's deep cobalt (Ed, round 8)
  const box = bbox(r, 0, r.w, 0, r.h, 8);
  await img(r).extract(box).resize({ width: 1800 }).webp({ quality: 74, alphaQuality: 88 }).toFile(`${OUT}/${name}.webp`);
  await sketchOf(`${OUT}/${name}.webp`, `${OUT}/${name}-sketch.webp`);
  console.log('scene', name, box);
}
// the flying pig: cut out whole (the little cloud behind it is dropped), inside made opaque
{
  const pg = await load('../round8/pig-1.png'); // round 7: drawn like the hanfu, realistic, on the mountains' cobalt
  keyOut(pg);
  const outside = solidInside(pg);
  tint(pg, 0);
  const N = pg.w * pg.h, lab = new Int32Array(N); let best = 0, bestN = 0, id = 0;
  for (let p = 0; p < N; p++) {
    if (lab[p] || outside[p]) continue;
    id++; let n = 0; const st = [p]; lab[p] = id;
    while (st.length) { const q = st.pop(); n++; const x = q % pg.w; for (const t of [x > 0 ? q - 1 : -1, x < pg.w - 1 ? q + 1 : -1, q - pg.w, q + pg.w]) { if (t < 0 || t >= N || lab[t] || outside[t]) continue; lab[t] = id; st.push(t); } }
    if (n > bestN) { bestN = n; best = id; }
  }
  for (let p = 0; p < N; p++) if (lab[p] !== best) pg.d[p * 4 + 3] = 0;
  const box = bbox(pg, 0, pg.w, 0, pg.h, 30);
  await img(pg).extract(box).resize({ width: 520 }).webp({ quality: 82, alphaQuality: 92 }).toFile(`${OUT}/pig.webp`);
  console.log('pig', box);
}

// --- the brush that follows the pointer while painting (round7/brush-2.png: foreshortened, leaning right, as in a
// right hand); its tip is the bottom-left of the cut ---
{
  const b = await load('../round8/brush-2.png');
  keyOut(b); solidInside(b); tint(b, 0);
  const box = bbox(b, 0, b.w, 0, b.h, 30);
  await img(b).extract(box).resize({ width: 200 }).webp({ quality: 84, alphaQuality: 92 }).toFile(`${OUT}/brush.webp`);
  console.log('brush', box);
}
// --- the landing doors: Door B with its lattice corners cleaned up (round7/doors-1.png) ---
await sharp(`${SRC}/../round7/doors-1.png`).resize({ width: 2000 }).webp({ quality: 70 }).toFile('public/intro/doors.webp');
