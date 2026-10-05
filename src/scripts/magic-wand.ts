import { gsap } from 'gsap';

/**
 * The magic wand over Ed (Ed, round 10: realistic, like the Contact brush and seal): a painted porcelain ruyi sceptre
 * follows the mouse while it is over him, in place of the cursor, and flicks when he is tapped. It lives on <body>, so
 * the stage's pin and transforms never move it off the pointer. Mouse and pen only (phones keep their tap); the CSS
 * wand cursor stays as the fallback until the painting has loaded. Retune here.
 */
export const WANDS = {
  // `tip` is the hotspot (the ruyi's cloud head, the star's centre) and `grip` the handle end it swings from, as
  // fractions of the painting from top left
  ruyi: { src: '/about/ruyi.webp', tip: { x: 0.08, y: 0.1 }, grip: { x: 0.8, y: 0.74 } },
  'star-a': { src: '/about/wand-a.webp', tip: { x: 0.105, y: 0.105 }, grip: { x: 0.95, y: 0.95 } },
  'star-b': { src: '/about/wand-b.webp', tip: { x: 0.11, y: 0.11 }, grip: { x: 0.96, y: 0.96 } },
};
export type WandName = keyof typeof WANDS;

/** Which wand: star A (Ed's pick, round 10); `?wand=ruyi` or `?wand=star-b` shows another, for that visit only. */
function pickWand(): WandName {
  const asked = new URLSearchParams(location.search).get('wand');
  return asked && asked in WANDS ? (asked as WandName) : 'star-a';
}

export const WAND = {
  ...WANDS['star-a'],
  /** the flick on a tap, in degrees: the wand swings from its handle (Ed, round 10: the star end moves, not the
   * handle), so the tip dips and springs back to the pointer */
  flick: -8, // a quick flick, not a swing (Ed: -22 moved too much)
};

/**
 * The burst of stars and sparkles from the wand's tip on a click (Ed, round 10). They fly out up and to the left, away
 * from the handle (`aim` degrees, `spread` either side), slow, sink a little and fade. Blues only, from the art's ramp.
 * A tap on a phone bursts from the finger. Skipped for reduced motion.
 */
export const SPARKS = {
  count: 16,
  aim: -135,
  spread: 80,
  reach: [40, 120] as [number, number],
  size: [7, 18] as [number, number],
  duration: [0.7, 1.15] as [number, number],
  fall: 26,
  colours: ['#1f3fa8', '#3231b0', '#5353c4', '#8f9ae0', '#a9b8e6'],
};

const STAR5 = 'polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
const STAR4 = 'polygon(50% 0, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0 50%, 39% 39%)';
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** Throws one burst of sparks from (x, y), in viewport px. */
export function burst(x: number, y: number): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < SPARKS.count; i++) {
    const el = document.createElement('span');
    el.className = 'magic-spark';
    el.setAttribute('aria-hidden', 'true');
    const size = rand(SPARKS.size[0], SPARKS.size[1]);
    el.style.width = el.style.height = `${size}px`;
    // mostly twinkling four-point sparkles, every third a five-point star; a few tiny round glints
    el.style.clipPath = i % 3 === 0 ? STAR5 : i % 5 === 4 ? 'circle(30%)' : STAR4;
    el.style.background = SPARKS.colours[i % SPARKS.colours.length];
    document.body.append(el);
    const a = ((SPARKS.aim + rand(-SPARKS.spread, SPARKS.spread)) * Math.PI) / 180;
    const d = rand(SPARKS.reach[0], SPARKS.reach[1]);
    const t = rand(SPARKS.duration[0], SPARKS.duration[1]);
    gsap.set(el, { x: x - size / 2, y: y - size / 2, scale: 0.2, rotation: rand(-30, 30), opacity: 1 });
    gsap.timeline({ onComplete: () => el.remove() })
      .to(el, { x: x - size / 2 + Math.cos(a) * d, y: y - size / 2 + Math.sin(a) * d, duration: t * 0.6, ease: 'power3.out' }, 0)
      .to(el, { y: `+=${SPARKS.fall}`, duration: t * 0.4, ease: 'power1.in' }, t * 0.6)
      .to(el, { scale: 1, rotation: `+=${rand(90, 200)}`, duration: t * 0.35, ease: 'back.out(2)' }, 0)
      .to(el, { scale: 0, opacity: 0, duration: t * 0.45, ease: 'power1.in' }, t * 0.55);
  }
}

export function initMagicWand(button: HTMLElement): () => void {
  Object.assign(WAND, WANDS[pickWand()]);
  const wand = new Image();
  wand.className = 'magic-wand';
  wand.src = WAND.src;
  wand.alt = '';
  wand.setAttribute('aria-hidden', 'true');
  wand.decoding = 'async';
  let ready = false;
  wand.decode().then(() => {
    ready = true;
    button.classList.add('has-wand');
  }).catch(() => {});
  document.body.append(wand);
  // at rest it sits square (no tilt), so the tip stays on the pointer; it scales and swings about the handle end
  gsap.set(wand, { opacity: 0, scale: 0.85, rotation: 0, transformOrigin: `${WAND.grip.x * 100}% ${WAND.grip.y * 100}%` });

  let shown = false;
  const show = (on: boolean) => {
    if (on === shown) return;
    shown = on;
    gsap.to(wand, on ? { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out' } : { opacity: 0, scale: 0.85, duration: 0.15, ease: 'power1.in' });
  };
  const place = (e: PointerEvent) => gsap.set(wand, { x: e.clientX - wand.offsetWidth * WAND.tip.x, y: e.clientY - wand.offsetHeight * WAND.tip.y });

  const onMove = (e: PointerEvent) => {
    if (!ready || e.pointerType === 'touch') return;
    place(e);
    show(true);
  };
  const onLeave = () => show(false);
  const onDown = (e: PointerEvent) => {
    // the stars fly from the wand's tip (the pointer's hotspot), or from the finger on a phone
    burst(e.clientX, e.clientY);
    if (!ready || e.pointerType === 'touch') return;
    gsap.timeline({ defaults: { overwrite: 'auto' } })
      .to(wand, { rotation: WAND.flick, duration: 0.07, ease: 'power2.out' })
      .to(wand, { rotation: 0, duration: 0.3, ease: 'back.out(1.6)' });
  };
  // scrolling under a still mouse: it leaves Ed without a pointer event
  const onScroll = () => { if (shown && !button.matches(':hover')) show(false); };
  button.addEventListener('pointermove', onMove);
  button.addEventListener('pointerenter', onMove);
  button.addEventListener('pointerleave', onLeave);
  button.addEventListener('pointerdown', onDown);
  window.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    button.removeEventListener('pointermove', onMove);
    button.removeEventListener('pointerenter', onMove);
    button.removeEventListener('pointerleave', onLeave);
    button.removeEventListener('pointerdown', onDown);
    window.removeEventListener('scroll', onScroll);
    button.classList.remove('has-wand');
    wand.remove();
  };
}
