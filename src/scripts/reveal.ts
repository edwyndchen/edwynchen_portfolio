import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** How far the cards rise (px), where on screen they settle, how softly they follow the scroll (s), and how much
 * later (px of scroll) the right-hand card of a row starts on wide screens. */
export const REVEAL = { rise: 140, settle: '62%', scrub: 0.8, lag: 180 } as const;

export function initReveals(): void {
  gsap.registerPlugin(ScrollTrigger);
  // matchMedia, so reduced motion switched on mid-session stops any reveal still waiting to run; the two-column
  // layout (60rem, as WorkPlates.astro) staggers each row: the right-hand card starts and settles later (Ed, round 9)
  gsap.matchMedia().add(
    { wide: '(min-width: 60rem) and (prefers-reduced-motion: no-preference)', narrow: '(max-width: 59.99rem) and (prefers-reduced-motion: no-preference)' },
    (c) => {
      const wide = Boolean(c.conditions?.wide);
      // the work cards drift up into frame as you scroll (Ed, round 9): tied to the scroll itself, so they move only
      // while you do, slowly, and settle by the time they're a little way up the screen
      gsap.utils.toArray<HTMLElement>('[data-reveal-on-scroll]').forEach((el, i) => {
        const lag = wide && i % 2 === 1 ? REVEAL.lag : 0;
        gsap.fromTo(el, { y: REVEAL.rise, opacity: 0 }, {
          y: 0, opacity: 1, ease: 'none',
          scrollTrigger: { trigger: el, start: `top bottom-=${lag}`, end: `top ${REVEAL.settle}-=${lag}`, scrub: REVEAL.scrub },
        });
      });
    },
  );
}
