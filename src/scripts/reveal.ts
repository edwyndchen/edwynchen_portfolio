import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initReveals(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.batch('[data-reveal-on-scroll]', {
    start: 'top 85%',
    once: true,
    onEnter: (els) => gsap.from(els, { y: 24, opacity: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out' }),
  });
}
