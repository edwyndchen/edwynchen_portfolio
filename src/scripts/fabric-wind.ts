import { gsap } from 'gsap';
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
  // the pig and the water bearer use painted maps instead (OUTFIT_MAP): only the ribbon, and the water, move
};

/**
 * Outfits whose stillness comes from a painted map rather than ellipses (2026-10-05, Ed: on all three only the
 * ribbon, and the water, ripple; the whole body holds). White = the cloth or water, a little past its edge so it
 * can sway out into the air; black = everything else. Each map already includes the WIND_MARGIN border.
 * Rebuild with `node art/round3/wind-maps.mjs`.
 */
export const OUTFIT_MAP: Record<string, string> = {
  hanfu: '/images/ed-porcelain-wind.png', // round 5 repaint: only its shawl ripples too
  pig: '/images/ed-pig-wind.png',
  water: '/images/ed-water-wind.png',
};

/** How fast the water bearer's ripples travel, px per second (x, y): along the stream, out and down from the vase. */
export const WATER_FLOW: [number, number] = [-26, 18];

/**
 * Drag (Ed, 2026-10-05: the cloth should feel the motion, like real physics). While the scroll choreography moves him
 * (the descent, the glide), his speed pushes the cloth harder and streams the ripples the opposite way, so the robes
 * and ribbons trail behind him. `full` is the speed (px/s) at which the drag peaks; `push` the extra displacement
 * (px) at full drag; `trail` how far the ripples stream per px he moves; `ease` how quickly the cloth catches up;
 * `lift` the steady bias (0..0.5 of the push) that streams the whole ribbon behind him, so it billows up as he floats
 * down (Ed, round 9: dramatic). The descent is short, so the drag peaks at a gentle speed.
 */
export const DRAG = { full: 200, push: 30, trail: 1.1, ease: 0.12, settle: 0.86, lift: 0.4 };
/** The water's flow repeats every this many px; two copies half a period apart cross-fade, so it never jumps. */
export const FLOW_PERIOD = 140;

/**
 * The two cross-faded copies of the flowing ripples at time t: each one's shift along the flow and its weight. A copy
 * fades to nothing just as its shift wraps round, so the hand-over is invisible. Pure, for tests.
 */
export function flowCopies(t: number, speed: number, period = FLOW_PERIOD) {
  const p = (((t * speed) % period) + period) % period;
  const q = (p + period / 2) % period;
  const w = (x: number) => 1 - Math.abs(1 - (2 * x) / period);
  return [{ shift: p, weight: w(p) }, { shift: q, weight: w(q) }];
}

/** How hard the cloth drags at a given speed (px/s), 0..1. Pure, for tests. */
export const dragAmount = (speed: number) => Math.min(1, Math.abs(speed) / DRAG.full);

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

/**
 * Where the wind runs. Not on Apple's WebKit (Safari, and every browser on an iPhone or iPad), which can't apply an
 * SVG displacement filter with a feImage to HTML reliably and may draw the figure blank; and not on touch-first
 * devices (phones, tablets), which can't afford redrawing it every frame (Ed, round 10: no Ed on his phone in
 * Chrome). They get the still painting.
 */
export function windSupported(): boolean {
  const webkit = navigator.vendor === 'Apple Computer, Inc.';
  return !webkit && !window.matchMedia('(pointer: coarse)').matches;
}

export function initFabricWind(ed: HTMLElement, filter: SVGFilterElement): () => void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches || !windSupported()) return () => {};
  const turb = filter.querySelector('feTurbulence');
  const disp = filter.querySelector('feDisplacementMap');
  const map = filter.querySelector('feImage');
  const [flowA, flowB] = [...filter.querySelectorAll('feOffset')];
  const mix = filter.querySelectorAll('feComposite')[0];
  const lift = filter.querySelector('feColorMatrix[result="lifted"]');
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
  let outfit = 'hanfu';
  // painted maps are fetched once and inlined as data URIs: feImage with an external URL is flaky in some browsers
  const inlined = new Map<string, Promise<string>>();
  const inline = (src: string) => {
    if (!inlined.has(src)) inlined.set(src, fetch(src).then((r) => r.blob()).then((b) => new Promise<string>((res, rej) => {
      const fr = new FileReader(); fr.onload = () => res(String(fr.result)); fr.onerror = rej; fr.readAsDataURL(b);
    })));
    return inlined.get(src)!;
  };
  for (const src of Object.values(OUTFIT_MAP)) inline(src).catch(() => {});
  const paint = () => {
    const src = OUTFIT_MAP[outfit];
    if (!src) { map.setAttribute('href', stillnessMap()); return; }
    const want = outfit;
    inline(src).then((uri) => { if (outfit === want) map.setAttribute('href', uri); }).catch(() => map.setAttribute('href', stillnessMap()));
  };
  place();
  paint();
  const ro = new ResizeObserver(place);
  ro.observe(ed);
  // the dev tuner edits WIND in place and asks for a repaint of the map
  window.addEventListener('wind:retune', paint);
  // the costume change: a new outfit brings its own still places
  const onOutfit = (e: Event) => {
    outfit = (e as CustomEvent<string>).detail;
    const spots = OUTFIT_STILL[outfit];
    if (spots) WIND.still = spots;
    paint();
  };
  window.addEventListener('wind:outfit', onOutfit);

  let raf = 0;
  let last = 0;
  // where the choreography has put the box (its x/y plus x/yPercent, in px)
  const g = (p: string) => Number(gsap.getProperty(ed, p)) || 0;
  const where = (): [number, number] => [g('x') + (g('xPercent') * ed.offsetWidth) / 100, g('y') + (g('yPercent') * ed.offsetHeight) / 100];
  let [lastX, lastY] = where(), lastAt = performance.now();
  let vx = 0, vy = 0, trailX = 0, trailY = 0;
  const t0 = performance.now();
  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    if (now - last < 1000 / WIND.fps) return;
    last = now;
    const t = (now - t0) / 1000;
    // his velocity from the choreography's own transform on the box (not page scrolling), smoothed
    const [px, py] = where();
    const dt = Math.max(0.001, (now - lastAt) / 1000);
    vx += ((px - lastX) / dt - vx) * DRAG.ease; vy += ((py - lastY) / dt - vy) * DRAG.ease;
    // the trail springs back once he slows, so it stays a short drag behind him and never builds up
    trailX = trailX * DRAG.settle - (px - lastX) * DRAG.trail; trailY = trailY * DRAG.settle - (py - lastY) * DRAG.trail;
    lastX = px; lastY = py; lastAt = now;
    const drag = dragAmount(Math.hypot(vx, vy));
    const [x, y] = windFrequency(t);
    turb.setAttribute('baseFrequency', `${x.toFixed(5)} ${y.toFixed(5)}`);
    // the water bearer: the noise streams along (and pushes a little harder), so the water reads as flowing
    const water = outfit === 'water';
    disp.setAttribute('scale', (windScale(t) * (water ? 1.35 : 1) + drag * DRAG.push).toFixed(2));
    if (lift) {
      // bias the push along his motion: sampling from ahead of him draws the cloth back, so it trails behind (up as he
      // comes down); zero at rest
      const v = Math.hypot(vx, vy) || 1, b = drag * DRAG.lift;
      lift.setAttribute('values', `1 0 0 0 ${((vx / v) * b).toFixed(3)}  0 1 0 0 ${((vy / v) * b).toFixed(3)}  0 0 1 0 0  0 0 0 1 0`);
    }
    if (flowA && flowB && mix) {
      // the water flows along its direction; everything else only carries the drag trail
      const speed = Math.hypot(WATER_FLOW[0], WATER_FLOW[1]), ux = WATER_FLOW[0] / speed, uy = WATER_FLOW[1] / speed;
      const [a, b] = water ? flowCopies(t, speed) : [{ shift: 0, weight: 1 }, { shift: 0, weight: 0 }];
      flowA.setAttribute('dx', (ux * a.shift + trailX).toFixed(1)); flowA.setAttribute('dy', (uy * a.shift + trailY).toFixed(1));
      flowB.setAttribute('dx', (ux * b.shift + trailX).toFixed(1)); flowB.setAttribute('dy', (uy * b.shift + trailY).toFixed(1));
      mix.setAttribute('k2', a.weight.toFixed(3)); mix.setAttribute('k3', b.weight.toFixed(3));
    }
  };
  const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  // paused, the filter comes off altogether (a still filter still costs a redraw whenever he is repainted) (round 10)
  const onPause = () => ed.classList.toggle('is-windy', !isMotionPaused());

  // runs only while the figure is on screen and motion is not paused
  let visible = false;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !isMotionPaused()) start(); else stop(); });
  io.observe(ed);
  const offMotion = whilePlaying(() => { onPause(); if (visible) start(); }, () => { onPause(); stop(); });
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
