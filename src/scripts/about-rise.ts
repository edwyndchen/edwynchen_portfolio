import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Where Ed starts his fly-in: hidden behind the cloud tower to his right. Phones travel less. */
export function flightStart(desktop: boolean) {
  return { xPercent: desktop ? 55 : 35, yPercent: 6, rotation: 3, opacity: 0 };
}

/** The tower starts this far left of its rest spot (over Ed) and drifts right out of his way. */
export const TOWER_START = { xPercent: -22, yPercent: 4, opacity: 1 };

/**
 * Work -> About: as #about scrolls up, Ed flies in from the right, out of the side of the cloud tower,
 * and the tower drifts aside to sit by his hem. Start states are set here, never in CSS, so with JS off or
 * reduced motion everything is simply at rest.
 */
export function initAboutRise(root: HTMLElement): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const ed = root.querySelector<HTMLElement>('.about__ed');
  const tower = root.querySelector<HTMLElement>('.about__tower');
  const fig = root.querySelector<HTMLElement>('.about__figure');
  if (!ed || !tower || !fig) return () => {};
  gsap.registerPlugin(ScrollTrigger);
  const desktop = window.matchMedia('(min-width: 60rem)').matches;

  const ctx = gsap.context(() => {
    // explicit sets, not fromTo: a scrubbed timeline sitting at progress 0 never renders its children,
    // so on a page loaded already scrolled to this point the start state would otherwise never apply
    gsap.set(ed, flightStart(desktop));
    gsap.set(tower, TOWER_START);

    // triggered by the figure, not the section: on phones the figure sits a whole screen below the About
    // heading, so a section trigger would finish the flight before he is on screen
    gsap
      .timeline({ defaults: { ease: 'none', duration: 1 }, scrollTrigger: { trigger: fig, start: 'top 75%', end: 'center 55%', scrub: 0.8 } })
      // he glides the whole way (a long ease-out) but is fully inked by 30% of the scroll
      .to(ed, { xPercent: 0, yPercent: 0, rotation: 0, ease: 'power1.out' }, 0)
      .to(ed, { opacity: 1, duration: 0.3 }, 0)
      .to(tower, { xPercent: 0, yPercent: 0, opacity: 0.9, ease: 'power1.inOut' }, 0);

    // idle, once he has arrived: a slow 6px float on its own transform channel (y), so it never fights the scrub
    const float = gsap.fromTo(ed, { y: 3 }, { y: -3, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true });
    ScrollTrigger.create({ trigger: fig, start: 'center 55%', end: 'max', once: true, onEnter: () => float.play() });
  }, root);

  return () => ctx.revert();
}
