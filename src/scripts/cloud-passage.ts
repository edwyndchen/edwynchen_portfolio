import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Scroll-scrubbed travel through the Work -> About cloud passage. The near bank rises faster than the far one
 * (parallax) and the two banks slide past each other sideways; the small puffs drift left to right, the way
 * the clouds travel (their tails trail left). Start states are set here, never in CSS: reduced motion and
 * no-JS keep the static composition.
 */
export const PASSAGE = {
  far: { yPercent: [10, -10], xPercent: [2, -3] },
  near: { yPercent: [22, -22], xPercent: [-3, 3] },
  puff: { xPercent: [-12, 12], yPercent: [8, -8] },
} as const;

export function initCloudPassage(root: HTMLElement): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const parts = [
      ['.passage__bank--far', PASSAGE.far],
      ['.passage__bank--near', PASSAGE.near],
      ['.passage__puff', PASSAGE.puff],
    ] as const;
    // explicit sets first: a scrubbed timeline at progress 0 never renders, so a page loaded mid-scroll needs them
    for (const [sel, p] of parts) gsap.set(sel, { xPercent: p.xPercent[0], yPercent: p.yPercent[0] });

    const tl = gsap.timeline({
      defaults: { ease: 'none', duration: 1 },
      scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
    });
    for (const [sel, p] of parts) tl.to(sel, { xPercent: p.xPercent[1], yPercent: p.yPercent[1] }, 0);
  }, root);

  return () => ctx.revert();
}
