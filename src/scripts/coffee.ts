import { isMotionPaused } from './motion';
import { burst } from './magic-wand';
import GAZE from '../data/gaze.json';

/**
 * The About page's coffee game (Ed, round 11): Ed's energy bar sits over his head and drains over time; every coffee
 * tops it up: the visitor carries a painted coffee cup over his face and clicks him (Ed is the button, so keyboard and
 * touch work too). His face follows the energy through twelve painted frames (one portrait, only the expression
 * changing, from sleepy to buzzing), crossfading one frame at a time so it never jumps (rounds 11b, 11c). Three named stages for the
 * line under him: tired, okay, buzzing. The drain rests while he's off screen, the tab is hidden or motion is paused.
 * Retune here.
 */
export const ENERGY = {
  start: 4,
  max: 100,
  /** points lost per second: a full bar runs flat in about 40 seconds */
  drain: 2.5,
  /** points one coffee gives */
  cup: 30,
};

/** How many face frames (public/about/face-1.webp ... face-12.webp, sleepiest first; art/round11/faces-build.mjs). */
export const FRAMES = 12;
/** The share of the bar below which it turns red. */
export const LOW = 0.25;
/** Milliseconds between frames when the face catches up after a coffee: it steps through every frame in between. */
export const FRAME_STEP = 110;

export const STATES = ['tired', 'okay', 'buzzing'] as const;
export type State = (typeof STATES)[number];

/** Ed's stage at an energy level. Pure, for tests. */
export function stateFor(energy: number): State {
  if (energy < 40) return 'tired';
  if (energy < 75) return 'okay';
  return 'buzzing';
}

/** The face frame (0 = sleepiest) for an energy level. Pure, for tests. */
export const frameFor = (energy: number) => Math.round((Math.max(0, Math.min(ENERGY.max, energy)) / ENERGY.max) * (FRAMES - 1));

/** Energy after `seconds` of draining, never below 0. Pure, for tests. */
export const drained = (energy: number, seconds: number) => Math.max(0, energy - ENERGY.drain * seconds);
/** Energy after one more coffee, never above the max. Pure, for tests. */
export const topped = (energy: number) => Math.min(ENERGY.max, energy + ENERGY.cup);

/** What Ed says in each stage (shown under him and read out when it changes). */
export const LINES: Record<State, string> = {
  tired: 'Running low. A coffee would really help.',
  okay: 'Good to go. Let’s make something.',
  buzzing: 'Fully caffeinated. Watch out.',
};

/**
 * Out of energy (the sleepiest frame), Ed's eyes follow the mouse, yearning for the coffee (Ed, round 12). Nine
 * versions of that face that differ only in the eyes (public/about/gaze-0..8.webp, art/round12/gaze-build.mjs); each
 * carries the direction its pupils actually point (src/data/gaze.json). The page picks the one closest to the
 * pointer's direction from his eyes; within `near` px of them he looks straight out. Mouse and pen only.
 */
export const GAZE_FOLLOW = { near: 60, eyes: { x: 0.5, y: 0.505 } };
/** The gaze frame for a pointer offset (dx, dy) from Ed's eyes. Pure, for tests. */
export function gazeFor(dx: number, dy: number): number {
  if (Math.hypot(dx, dy) < GAZE_FOLLOW.near) return 0;
  const a = Math.atan2(dy, dx);
  let best = 0, score = -Infinity;
  for (const g of GAZE) {
    if (!g.x && !g.y) continue;
    const s = Math.cos(Math.atan2(g.y, g.x) - a);
    if (s > score) { score = s; best = g.frame; }
  }
  return best;
}

export function initCoffee(root: HTMLElement): () => void {
  const frames = [...root.querySelectorAll<HTMLElement>('[data-frame]')];
  const gazes = [...root.querySelectorAll<HTMLElement>('[data-gaze]')];
  const meter = root.querySelector<HTMLElement>('[data-energy-bar]');
  const fill = root.querySelector<HTMLElement>('[data-energy-fill]');
  const line = root.querySelector<HTMLElement>('[data-coffee-line]');
  const count = root.querySelector<HTMLElement>('[data-coffee-count]');
  const button = root.querySelector<HTMLButtonElement>('[data-coffee]');
  const cup = root.querySelector<HTMLElement>('[data-cup]');
  const face = root.querySelector<HTMLElement>('[data-coffee-face]');
  if (!meter || !fill || !line || !button || !face || frames.length !== FRAMES) return () => {};

  let energy = ENERGY.start, cups = 0, state: State | null = null;
  // the face shown, and a timer that walks it one frame at a time towards the energy's frame (so a coffee plays
  // through every expression in between instead of cutting)
  let shown = frameFor(energy), walk = 0, gaze = 0;
  const follows = gazes.length > 0 && window.matchMedia('(hover: hover)').matches;
  // at the sleepiest frame, one of the gaze faces stands in for it (the eyes on the pointer)
  const paint = () => {
    const yearning = follows && shown === 0;
    frames.forEach((f, k) => f.classList.toggle('is-on', k === shown && !yearning));
    gazes.forEach((g, k) => g.classList.toggle('is-on', yearning && k === gaze));
  };
  const show = (i: number) => { shown = i; paint(); };
  if (follows) {
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' || shown !== 0) return;
      const r = face.getBoundingClientRect();
      const next = gazeFor(e.clientX - (r.left + r.width * GAZE_FOLLOW.eyes.x), e.clientY - (r.top + r.height * GAZE_FOLLOW.eyes.y));
      if (next !== gaze) { gaze = next; paint(); }
    }, { passive: true });
  }
  const follow = () => {
    const target = frameFor(energy);
    if (target === shown) { walk = 0; return; }
    show(shown + Math.sign(target - shown));
    walk = window.setTimeout(follow, FRAME_STEP);
  };
  const render = () => {
    const pct = Math.round(energy);
    fill.style.transform = `scaleX(${energy / ENERGY.max})`;
    // the bar turns red only in its last quarter (Ed, round 11c)
    root.classList.toggle('is-low', energy < ENERGY.max * LOW);
    meter.setAttribute('aria-valuenow', String(pct));
    meter.setAttribute('aria-valuetext', `${pct}%, ${stateFor(energy)}`);
    if (!walk && frameFor(energy) !== shown) follow();
    const next = stateFor(energy);
    if (next === state) return;
    state = next;
    root.dataset.energy = next;
    // the line under him is a live region: it changes (and is read out) only when his stage does, not every tick
    line.textContent = LINES[next];
  };
  show(shown);
  render();

  const sip = root.querySelector<HTMLElement>('[data-sip-cup]');
  const touch = !window.matchMedia('(hover: hover)').matches;
  const give = () => {
    const before = stateFor(energy);
    energy = topped(energy);
    cups++;
    if (count) count.textContent = `${cups} ${cups === 1 ? 'coffee' : 'coffees'} so far`;
    render();
    // a little sip: the face bobs, and the sparkles fly when he tips into buzzing
    face.classList.remove('is-sip'); void face.offsetWidth; face.classList.add('is-sip');
    if (cup) { cup.classList.remove('is-pour'); void cup.offsetWidth; cup.classList.add('is-pour'); }
    if (before !== 'buzzing' && stateFor(energy) === 'buzzing') {
      const r = face.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height * 0.3);
    }
    // touch screens: the cup rises from his lower left and tips to his mouth (Ed, round 12)
    if (touch && sip) { sip.classList.remove('is-sip'); void sip.offsetWidth; sip.classList.add('is-sip'); }
  };
  button.addEventListener('click', give);
  root.querySelector('[data-caffeinate]')?.addEventListener('click', give);

  // the cup: follows the mouse over his face in place of the cursor (mouse and pen only; phones just tap him)
  if (cup && window.matchMedia('(hover: hover)').matches) {
    (cup.querySelector('img')?.decode() ?? Promise.resolve()).then(() => button.classList.add('has-cup')).catch(() => {});
    const place = (e: PointerEvent) => { cup.style.translate = `${e.clientX}px ${e.clientY}px`; };
    button.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') { place(e); cup.classList.add('is-on'); } });
    button.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') { place(e); cup.classList.add('is-on'); } });
    button.addEventListener('pointerleave', () => cup.classList.remove('is-on'));
    window.addEventListener('scroll', () => { if (!button.matches(':hover')) cup.classList.remove('is-on'); }, { passive: true });
  }

  // the drain: about 5 times a second, only while he's on screen, the tab is open and motion runs
  let visible = false, last = performance.now();
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = performance.now(); });
  io.observe(root);
  const tick = window.setInterval(() => {
    const now = performance.now(), dt = (now - last) / 1000;
    last = now;
    if (!visible || document.hidden || isMotionPaused()) return;
    energy = drained(energy, dt);
    render();
  }, 200);

  return () => { window.clearInterval(tick); window.clearTimeout(walk); io.disconnect(); };
}
