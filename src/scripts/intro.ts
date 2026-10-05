import { gsap } from 'gsap';

/**
 * The landing (see Intro.astro): the doors part, carrying the mark with them, and reveal Ed's logo and name; then
 * the lockup shrinks onto the nav logo and the porcelain behind it fades to show the page. The lockup is the nav's
 * own wordmark, so landing is a plain move and scale onto the nav logo's box. On the narrowest phones the nav shows
 * the mark alone: the lockup lands its mark on it and the name fades away.
 */
/** Milliseconds the closed doors linger once everything has loaded (Ed: at least half a second). */
export const INTRO_LINGER = 500;

/** Move and scale that put a box onto another, scaling from its top-left corner. Pure, for tests. */
export function landOn(from: { left: number; top: number; height: number }, to: { left: number; top: number; height: number }) {
  const scale = to.height / from.height;
  return { x: to.left - from.left, y: to.top - from.top, scale };
}

export function initIntro(): void {
  const root = document.documentElement;
  const el = document.querySelector<HTMLElement>('[data-intro]');
  if (!root.classList.contains('intro') || !el) return;
  const paper = el.querySelector<HTMLElement>('[data-intro-paper]')!;
  const lockup = el.querySelector<HTMLElement>('[data-intro-lockup]')!;
  const word = lockup.querySelector<SVGSVGElement>('svg')!;
  const [left, right] = ['left', 'right'].map((d) => el.querySelector<HTMLElement>(`[data-door="${d}"]`)!);

  const finish = () => { root.classList.remove('intro'); el.remove(); };
  const play = () => {
    const tl = gsap.timeline({ onComplete: finish });
    // 1. the doors part, each taking its half of the mark
    tl.to(left, { xPercent: -100, duration: 1.0, ease: 'power3.inOut' }, 0)
      .to(right, { xPercent: 100, duration: 1.0, ease: 'power3.inOut' }, 0);
    // 2. a beat on the logo and name, then they shrink into the corner where the nav logo is
    const wide = [...document.querySelectorAll<SVGSVGElement>('.nav__brand .nav__logo')].find((n) => n.getBoundingClientRect().width > 0);
    const markOnly = [...document.querySelectorAll<SVGSVGElement>('.nav__brand .nav__mark')].find((n) => n.getBoundingClientRect().width > 0);
    const target = (wide ?? markOnly)?.getBoundingClientRect();
    if (target) {
      const m = landOn(word.getBoundingClientRect(), target);
      tl.to(lockup, { x: m.x, y: m.y, scale: m.scale, duration: 0.9, ease: 'power3.inOut' }, 1.25);
      // phones whose nav shows the mark alone: the name (everything after the mark) lets go once it lands
      if (!wide) tl.to(word.querySelectorAll('path:not(:first-child)'), { opacity: 0, duration: 0.2 }, 2.0); // only once it has landed
    } else tl.to(lockup, { opacity: 0, duration: 0.4 }, 1.3); // no nav logo to land on (never expected)
    // 3. only once the logo has landed does the porcelain behind it melt away to the page, so it never crosses the
    //    hero's heading or a second logo on its way; it hands over to the nav's own logo when the timeline completes
    tl.to(paper, { opacity: 0, duration: 0.5, ease: 'power1.out' }, 2.15);
  };
  // hold the doors shut until the page (and its fonts and the doors' own painting) are in, then linger at least
  // INTRO_LINGER more; never longer than 3s before they open
  const doorsArt = el.querySelector<HTMLImageElement>('.intro__art img');
  const ready = Promise.race([
    Promise.all([
      new Promise<void>((res) => { if (document.readyState === 'complete') res(); else addEventListener('load', () => res(), { once: true }); }),
      document.fonts?.ready,
      doorsArt?.decode().catch(() => {}),
    ]),
    new Promise((res) => setTimeout(res, 3000)),
  ]);
  ready.then(() => setTimeout(play, INTRO_LINGER));
}
