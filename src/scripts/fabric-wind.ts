import { isMotionPaused, whilePlaying } from './motion';

/**
 * Cloth breathing in the wind: slowly drifts the base frequency of the portrait's feTurbulence (and gusts its
 * displacement), so the noise that pushes the fabric morphs gently instead of wobbling. A stillness map, painted
 * as soft ellipses, scales the push down where he must not warp: face and hands not at all, the torso only a
 * little. Retune here, or live with the dev panel (`npm run dev`, then open /?wind). Runs only with motion allowed
 * and only while the figure is on screen; throttled, since every change re-renders the filter.
 */
export interface StillSpot {
  name: string;
  /** centre and radii, in % of the painting's box */
  cx: number; cy: number; rx: number; ry: number;
  /** 1 = never moves, 0 = moves freely */
  hold: number;
}

export const WIND = {
  base: [0.006, 0.011] as [number, number], // x, y frequency at rest (low = broad, soft folds)
  swing: [0.0022, 0.003] as [number, number], // how far each drifts either side
  period: [7.5, 5.6] as [number, number], // seconds for a full breath, x and y out of step so it never loops visibly
  scale: [9, 3] as [number, number], // displacement in px at rest, and how far it gusts either side
  gust: 7.9, // seconds per gust, out of step with both breaths
  fps: 30,
  still: [
    { name: 'torso', cx: 28, cy: 35, rx: 19, ry: 21, hold: 0.8 },
    { name: 'face', cx: 30, cy: 15, rx: 9, ry: 8, hold: 1 },
    { name: 'stylus hand', cx: 6, cy: 22, rx: 8, ry: 8, hold: 1 },
    { name: 'tablet hand', cx: 45, cy: 44, rx: 10, ry: 9, hold: 1 },
  ] as StillSpot[],
};

/** Where each outfit holds still (the About costume change swaps these in via a 'wind:outfit' event). */
export const OUTFIT_STILL: Record<string, StillSpot[]> = {
  hanfu: WIND.still,
  // festival jacket (Tang style): face, the pig mask on his head, the piglet and both hands hold; the jacket barely
  // moves, the loose trousers sway a little, the long scarf flies
  pig: [
    { name: 'jacket', cx: 38, cy: 37, rx: 18, ry: 16, hold: 0.85 },
    { name: 'legs', cx: 30, cy: 70, rx: 18, ry: 25, hold: 0.6 },
    { name: 'face', cx: 33, cy: 16, rx: 8, ry: 7, hold: 1 },
    { name: 'mask', cx: 39, cy: 10, rx: 8, ry: 6, hold: 1 },
    { name: 'piglet and hands', cx: 38, cy: 38, rx: 15, ry: 9, hold: 1 },
  ],
  // the water bearer: face, the vase and both hands hold; the robes, ribbons and the stream of water all move
  water: [
    { name: 'torso', cx: 47, cy: 42, rx: 12, ry: 18, hold: 0.8 },
    { name: 'face', cx: 52, cy: 22, rx: 7, ry: 7, hold: 1 },
    { name: 'vase and hands', cx: 36, cy: 18, rx: 14, ry: 12, hold: 1 },
  ],
};

/** The filter reaches this far past the painting's box on every side (% of the box), so the map covers it too. */
export const WIND_MARGIN = 6;

/** The frequency pair at time t (seconds). Pure, for tests. */
export function windFrequency(t: number): [number, number] {
  const f = (i: 0 | 1) => WIND.base[i] + WIND.swing[i] * Math.sin((2 * Math.PI * t) / WIND.period[i]);
  return [f(0), f(1)];
}

/** The displacement strength at time t (seconds): the gusts. Pure, for tests. */
export function windScale(t: number): number {
  return Math.max(0, WIND.scale[0] + WIND.scale[1] * Math.sin((2 * Math.PI * t) / WIND.gust));
}

/**
 * The stillness map as an SVG data URI: white moves, black holds. Each spot is solid at its core and feathers to
 * nothing at its rim, so there is never a seam between still and moving cloth. Pure, for tests.
 */
export function stillnessMap(spots: StillSpot[] = WIND.still): string {
  const m = WIND_MARGIN;
  const defs = spots
    .map((s, i) => {
      const v = Math.round(255 * (1 - Math.min(1, Math.max(0, s.hold))));
      return `<radialGradient id="s${i}"><stop offset="0" stop-color="rgb(${v},${v},${v})"/><stop offset=".5" stop-color="rgb(${v},${v},${v})"/><stop offset="1" stop-color="rgb(${v},${v},${v})" stop-opacity="0"/></radialGradient>`;
    })
    .join('');
  const shapes = spots.map((s, i) => `<ellipse cx="${s.cx}" cy="${s.cy}" rx="${s.rx}" ry="${s.ry}" fill="url(#s${i})"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-m} ${-m} ${100 + 2 * m} ${100 + 2 * m}" preserveAspectRatio="none"><defs>${defs}</defs><rect x="${-m}" y="${-m}" width="${100 + 2 * m}" height="${100 + 2 * m}" fill="#fff"/>${shapes}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function initFabricWind(ed: HTMLElement, filter: SVGFilterElement): () => void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return () => {};
  const turb = filter.querySelector('feTurbulence');
  const disp = filter.querySelector('feDisplacementMap');
  const map = filter.querySelector('feImage');
  if (!turb || !disp || !map) return () => {};
  ed.classList.add('is-windy');

  // the map is laid over the filter region in px (the filter's user space is the painting's box)
  const place = () => {
    const w = ed.offsetWidth, h = ed.offsetHeight, k = WIND_MARGIN / 100;
    map.setAttribute('x', String(-w * k));
    map.setAttribute('y', String(-h * k));
    map.setAttribute('width', String(w * (1 + 2 * k)));
    map.setAttribute('height', String(h * (1 + 2 * k)));
  };
  const paint = () => map.setAttribute('href', stillnessMap());
  place();
  paint();
  const ro = new ResizeObserver(place);
  ro.observe(ed);
  // the dev tuner edits WIND in place and asks for a repaint of the map
  window.addEventListener('wind:retune', paint);
  // the costume change: a new outfit brings its own still places
  const onOutfit = (e: Event) => {
    const spots = OUTFIT_STILL[(e as CustomEvent<string>).detail];
    if (spots) { WIND.still = spots; paint(); }
  };
  window.addEventListener('wind:outfit', onOutfit);

  let raf = 0;
  let last = 0;
  const t0 = performance.now();
  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    if (now - last < 1000 / WIND.fps) return;
    last = now;
    const t = (now - t0) / 1000;
    const [x, y] = windFrequency(t);
    turb.setAttribute('baseFrequency', `${x.toFixed(5)} ${y.toFixed(5)}`);
    disp.setAttribute('scale', windScale(t).toFixed(2));
  };
  const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  // runs only while the figure is on screen and motion is not paused
  let visible = false;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !isMotionPaused()) start(); else stop(); });
  io.observe(ed);
  const offMotion = whilePlaying(() => { if (visible) start(); }, stop);
  const off = () => {
    stop(); io.disconnect(); ro.disconnect(); offMotion();
    window.removeEventListener('wind:retune', paint); window.removeEventListener('wind:outfit', onOutfit);
    ed.classList.remove('is-windy');
  };
  // a visitor who turns reduced motion on mid-visit gets a still figure straight away
  const onChange = () => { if (reduce.matches) off(); };
  reduce.addEventListener('change', onChange);

  return () => { off(); reduce.removeEventListener('change', onChange); };
}
