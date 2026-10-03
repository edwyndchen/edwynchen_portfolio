import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Work -> About transition: as #about scrolls up, Ed rises from behind the cloud bank and the clouds part around him.
 * Start states are set here, never in CSS, so with JS off or reduced motion everything is simply at rest.
 */
export function initAboutRise(root: HTMLElement): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const ed = root.querySelector<HTMLElement>('.about__ed');
  if (!ed) return () => {};
  gsap.registerPlugin(ScrollTrigger);
  const startY = window.matchMedia('(min-width: 60rem)').matches ? 38 : 24;

  const ctx = gsap.context(() => {
    // explicit sets, not fromTo: a scrubbed timeline sitting at progress 0 never renders its children,
    // so on a page loaded already scrolled to this point the start state would otherwise never apply
    gsap.set(ed, { yPercent: startY, opacity: 0 });
    gsap.set('.about__cloud--left', { xPercent: 12, yPercent: -10, scale: 1.08 });
    gsap.set('.about__cloud--right', { xPercent: -12, yPercent: -10, scale: 1.08 });

    gsap
      .timeline({ defaults: { ease: 'none', duration: 1 }, scrollTrigger: { trigger: root, start: 'top 90%', end: 'top 20%', scrub: 0.8 } })
      // he rises the whole way but is fully inked by 40% of the scroll
      .to(ed, { keyframes: { '40%': { opacity: 1 }, '100%': { yPercent: 0, opacity: 1 } } }, 0)
      .to('.about__cloud--left, .about__cloud--right', { xPercent: 0, yPercent: 0, scale: 1 }, 0)
      .fromTo('.about__cloud--back', { opacity: 1 }, { opacity: 0.85 }, 0);
  }, root);

  return () => ctx.revert();
}
