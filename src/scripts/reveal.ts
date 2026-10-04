import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initReveals(): void {
  gsap.registerPlugin(ScrollTrigger);
  // matchMedia, so reduced motion switched on mid-session stops any reveal still waiting to run
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    ScrollTrigger.batch('[data-reveal-on-scroll]', {
      start: 'top 85%',
      once: true,
      onEnter: (els) => gsap.from(els, { y: 24, opacity: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out' }),
    });
  });
}
