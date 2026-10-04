import { gsap } from 'gsap';

/**
 * About: click (or tap, or Enter/Space) on Ed and he vanishes in a puff of cloud and comes back in another outfit:
 * the hanfu, then festival wear with a pig mask and a piglet (his zodiac, the Pig), then a water bearer pouring a
 * vase (Aquarius), then the hanfu again. The figure is a real button; a live region says what he is wearing now.
 * Reduced motion: the outfit changes at once, no puff.
 */
export const OUTFITS = ['hanfu', 'pig', 'water'] as const;
export type Outfit = (typeof OUTFITS)[number];

/** The outfit after this one, round and round. Pure, for tests. */
export const nextOutfit = (o: Outfit): Outfit => OUTFITS[(OUTFITS.indexOf(o) + 1) % OUTFITS.length];

export function initOutfitSwap(button: HTMLButtonElement): () => void {
  // the paintings sit in their own wrapper, so the fade never fights the scroll choreography on .about__ed
  const ed = button.querySelector<HTMLElement>('.about__outfits');
  const puff = button.querySelector<HTMLElement>('[data-puff]');
  const status = document.querySelector<HTMLElement>('[data-outfit-status]');
  const imgs = new Map(OUTFITS.map((o) => [o, button.querySelector<HTMLImageElement>(`[data-outfit="${o}"]`)]));
  if (!ed || !puff || !status || [...imgs.values()].some((i) => !i)) return () => {};
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current: Outfit = 'hanfu';
  let busy = false;

  const show = (o: Outfit) => {
    for (const [k, img] of imgs) img!.hidden = k !== o;
    current = o;
    button.dataset.outfit = o;
    status.textContent = imgs.get(o)!.dataset.label ?? '';
    // each outfit holds still in its own places (face, hands, props): the wind repaints its map
    window.dispatchEvent(new CustomEvent('wind:outfit', { detail: o }));
  };

  // the puff: clouds burst from his middle to cover the whole figure, then drift outward and thin away
  const clouds = [...puff.querySelectorAll<HTMLElement>('img')];
  const burst = () => {
    const tl = gsap.timeline();
    const w = puff.clientWidth, h = puff.clientHeight;
    clouds.forEach((c, i) => {
      const a = (i / clouds.length) * Math.PI * 2 + 0.35;
      // spread: an ellipse over the figure (it is taller than wide); the first cloud stays at the heart
      const rx = i === 0 ? 0 : w * 0.26, ry = i === 0 ? 0 : h * 0.3;
      tl.fromTo(c,
        { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0.2, opacity: 0, rotation: (i % 2 ? -1 : 1) * 10 },
        { x: Math.cos(a) * rx, y: Math.sin(a) * ry, scale: i === 0 ? 1.5 : 1.1, opacity: 1, rotation: 0, duration: 0.32, ease: 'power3.out' }, i * 0.02)
        .to(c, { x: Math.cos(a) * rx * 1.7, y: Math.sin(a) * ry * 1.5 - h * 0.06, scale: i === 0 ? 2 : 1.5, opacity: 0, duration: 0.75, ease: 'power1.in' }, 0.42 + i * 0.025);
    });
    return tl;
  };

  const onClick = () => {
    if (busy) return;
    const to = nextOutfit(current);
    if (reduce.matches) { show(to); return; }
    busy = true;
    const tl = gsap.timeline({ onComplete: () => { busy = false; } });
    tl.add(burst(), 0)
      .to(ed, { opacity: 0, scale: 0.94, duration: 0.25, ease: 'power2.in' }, 0.05)
      .call(() => show(to), [], 0.32)
      .to(ed, { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' }, 0.5);
  };
  button.addEventListener('click', onClick);
  show('hanfu');
  status.textContent = ''; // say nothing until the first change
  return () => button.removeEventListener('click', onClick);
}
