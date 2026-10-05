// Tester for swirlier page transitions (Ed, 2026-10-05). Same bristle brush as scripts/brush-reveal.mjs, but each
// stroke follows a curved path instead of a straight band. Writes cover/reveal sprites per variant to public/lab/
// and src/data/brush-lab.json (frame counts) for the /lab/transitions/ page. The live transition is untouched.
// npm run brush-lab
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const FRAMES = 30, W = 360, H = 240, A = H / W; // A: x-scale that makes a circle look round
const BRISTLES = 24;
const ease = (x) => 1 - (1 - x) ** 2.2;

// a centre line for each kind of stroke: u runs 0..1 along it; returns [x, y] as fractions of the screen
const PATHS = {
  // the current straight bands, for comparison
  straight: (s, u) => [s.dir > 0 ? u * 1.4 - 0.2 : 1.2 - u * 1.4, s.y + s.tilt * (u - 0.5)],
  // long S-curves: each band waves up and down as it crosses
  waves: (s, u) => {
    const x = s.dir > 0 ? u * 1.4 - 0.2 : 1.2 - u * 1.4;
    return [x, s.y + s.amp * Math.sin(2 * Math.PI * (u * s.f) + s.ph)];
  },
  // looping strokes (a prolate cycloid): the brush rolls forward in curls, like cloud scrolls
  loops: (s, u) => {
    const phi = 2 * Math.PI * u * s.f + s.ph;
    const base = s.dir > 0 ? u * 1.5 - 0.25 : 1.25 - u * 1.5;
    return [base - s.dir * s.k * A * Math.sin(phi), s.y - s.k * Math.cos(phi)];
  },
  // a vortex: arms spiral out from the middle until the screen is full
  vortex: (s, u) => {
    const th = s.a0 + s.dir * u * 2.4 * Math.PI, r = 0.02 + u * 0.95;
    return [0.5 + r * Math.cos(th) * A, 0.5 + r * Math.sin(th)];
  },
};

const VARIANTS = {
  straight: {
    path: 'straight',
    cover: [0.86, 0.6, 0.34, 0.1, 0.74, 0.22].map((y, i) => ({ y, t: 0.32, dir: i % 2 ? 1 : -1, tilt: (i % 2 ? -1 : 1) * 0.06 })),
    reveal: [0.1, 0.34, 0.58, 0.84, 0.22, 0.7].map((y, i) => ({ y, t: 0.32, dir: i % 2 ? -1 : 1, tilt: (i % 2 ? -1 : 1) * 0.06 })),
  },
  waves: {
    path: 'waves',
    cover: [0.85, 0.55, 0.25, 0.05, 0.7, 0.4].map((y, i) => ({ y, t: 0.36, dir: i % 2 ? 1 : -1, amp: 0.1, f: 1.2, ph: i * 1.3 })),
    reveal: [0.08, 0.38, 0.62, 0.9, 0.22, 0.75].map((y, i) => ({ y, t: 0.36, dir: i % 2 ? -1 : 1, amp: 0.1, f: 1.1, ph: i * 1.7 })),
  },
  loops: {
    path: 'loops',
    cover: [0.82, 0.5, 0.18, 0.66, 0.34, 0.02].map((y, i) => ({ y, t: 0.3, dir: i % 2 ? 1 : -1, k: 0.12, f: 3.2, ph: i })),
    reveal: [0.15, 0.47, 0.8, 0.31, 0.63, 0.97].map((y, i) => ({ y, t: 0.3, dir: i % 2 ? -1 : 1, k: 0.12, f: 3, ph: i * 1.4 })),
  },
  vortex: {
    path: 'vortex',
    cover: Array.from({ length: 6 }, (_, i) => ({ a0: (i / 6) * 2 * Math.PI, t: 0.34, dir: 1 })),
    reveal: Array.from({ length: 6 }, (_, i) => ({ a0: (i / 6) * 2 * Math.PI + 0.5, t: 0.34, dir: -1 })),
  },
};

async function build(variant, stage, strokes, path, s0) {
  let seed = s0;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const vortex = path === 'vortex';
  const START = (i) => (vortex ? i * 0.03 : i * 0.12), DUR = vortex ? 0.75 : 0.36;
  const hairs = strokes.map(() => Array.from({ length: BRISTLES }, (_, j) => ({
    off: (j / (BRISTLES - 1) - 0.5) + (rnd() - 0.5) * 0.04,
    reach: 0.8 + rnd() * 0.2 - Math.abs(j / (BRISTLES - 1) - 0.5) * 0.3,
    lag: rnd() * 0.08, w: 1.3 + rnd() * 1.1, phase: rnd() * 6,
  })));
  const line = PATHS[path];
  const hairPath = (st, h, progress) => {
    const n = 90, len = Math.max(0, progress * h.reach - h.lag);
    if (len <= 0) return '';
    const pts = [];
    for (let k = 0; k <= n; k++) {
      const u = (k / n) * len;
      const [x, y] = line(st, u), [x2, y2] = line(st, u + 0.002);
      // the hair sits off the centre line along its normal (in screen pixels, so the brush keeps its width round curves)
      let nx = -(y2 - y) * H, ny = (x2 - x) * W; const m = Math.hypot(nx, ny) || 1; nx /= m; ny /= m;
      const o = (h.off * st.t + 0.005 * Math.sin(u * 23 + h.phase)) * H;
      pts.push(`${(x * W + nx * o).toFixed(1)} ${(y * H + ny * o).toFixed(1)}`);
    }
    return `<path d="M${pts.join(' L')}" stroke="#fff" stroke-width="${((st.t * H) / BRISTLES * h.w * 1.6).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  };
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const p = f / (FRAMES - 1);
    let body = '';
    strokes.forEach((st, i) => {
      const local = Math.max(0, Math.min(1, (p - START(i)) / DUR));
      if (local > 0) for (const h of hairs[i]) body += hairPath(st, h, ease(local));
    });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#000"/>${body}</svg>`;
    frames.push(await sharp(Buffer.from(svg)).extractChannel('red').raw().toBuffer({ resolveWithObject: true }));
  }
  const cover = (d) => d.reduce((n, v) => n + (v > 127 ? 1 : 0), 0) / (W * H);
  const full = frames.findIndex(({ data }) => cover(data) >= 0.995);
  if (full > 0) frames.length = full + 1;
  const before = cover(frames[frames.length - 1].data);
  frames[frames.length - 1].data.fill(255);
  const N = frames.length;
  const sprite = Buffer.alloc(W * N * H * 4);
  frames.forEach(({ data }, f) => {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const v = data[y * W + x];
      sprite[(y * W * N + f * W + x) * 4 + 3] = stage === 'cover' ? 255 - v : v;
    }
  });
  await sharp(sprite, { raw: { width: W * N, height: H, channels: 4 } }).png({ compressionLevel: 9, palette: true }).toFile(`public/lab/brush-${variant}-${stage}.png`);
  console.log(`${variant} ${stage}: ${N} frames, ${(before * 100).toFixed(1)}% painted before the last`);
  return N;
}

mkdirSync('public/lab', { recursive: true });
const out = {};
for (const [name, v] of Object.entries(VARIANTS)) {
  out[name] = { cover: await build(name, 'cover', v.cover, v.path, 23), reveal: await build(name, 'reveal', v.reveal, v.path, 7) };
}
writeFileSync('src/data/brush-lab.json', JSON.stringify(out, null, 2) + '\n');
