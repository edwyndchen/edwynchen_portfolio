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

/** Where each puff cloud settles, as fractions of the figure's box from its centre: a tight, overlapping cover of
 *  the whole tall figure, head to feet and sleeve to sleeve. */
export const PUFF_LAYOUT: [number, number][] = [
  [0, 0], [0, -0.43], [-0.24, -0.3], [0.24, -0.3], [-0.28, -0.08], [0.28, -0.08],
  [0, 0.2], [-0.24, 0.16], [0.24, 0.16], [-0.18, 0.38], [0.18, 0.38], [0, -0.18],
];
/** Seconds into the puff: when the outfit changes (every cloud is in place) and when the clouds start to clear. */
export const PUFF_SWAP = 0.52;
export const PUFF_CLEAR = 0.62;
/** ...and when the new outfit fades in: once the clouds are about half gone, done as they vanish. */
export const PUFF_REVEAL = 1.02;

export function initOutfitSwap(button: HTMLButtonElement): () => void {
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

  // the puff, a magic trick: big billows close over the whole figure, the outfit changes while he is completely
  // hidden, and when the clouds drift apart and thin away the new outfit is already standing there
  const clouds = [...puff.querySelectorAll<HTMLElement>('img')];
  const mist = puff.querySelector<HTMLElement>('[data-puff-mist]');
  // every outfit is fetched and decoded up front: a painting still loading when it is swapped in would pop in
  // after the clouds had gone, which gives the trick away
  for (const img of imgs.values()) { img!.loading = 'eager'; img!.decode().catch(() => {}); }
  const burst = (ready: Promise<unknown>, swap: () => void) => {
    const ed = button.querySelector<HTMLElement>('.about__outfits')!;
    const tl = gsap.timeline();
    const w = puff.clientWidth, h = puff.clientHeight;
    // a soft, solid bank of porcelain mist behind the billows: whatever gaps they leave, he can't be seen through it
    if (mist) {
      tl.fromTo(mist, { opacity: 0, scale: 0.75 }, { opacity: 1, scale: 1, duration: 0.14, ease: 'power2.out' }, 0)
        .to(mist, { opacity: 0, scale: 1.15, duration: 0.6, ease: 'power1.in' }, PUFF_CLEAR + 0.12);
    }
    clouds.forEach((c, i) => {
      const [px, py] = PUFF_LAYOUT[i % PUFF_LAYOUT.length];
      const x = px * w, y = py * h, flip = i % 2 ? -1 : 1;
      // each billow bursts out already solid (opaque within 0.06s), so he is never seen through a half-formed cloud
      tl.fromTo(c,
        { xPercent: -50, yPercent: -50, x: x * 0.35, y: y * 0.35, scale: 0.5, rotation: flip * 12 },
        { x, y, scale: 1, rotation: 0, duration: 0.3, ease: 'power3.out' }, i * 0.01)
        .fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.06, ease: 'none' }, i * 0.01)
        .to(c, { x: x * 1.8 + flip * w * 0.05, y: y * 1.5 - h * 0.05, scale: 1.25, opacity: 0, duration: 0.8, ease: 'power1.in' }, PUFF_CLEAR + i * 0.02);
    });
    // fully covered: he steps out of sight, changes under the cloud (the cover holds until the new painting is
    // decoded), and only reappears as the billows thin away, so he is never glimpsed through them
    tl.set(ed, { opacity: 0 }, PUFF_SWAP - 0.02)
      .to(ed, { opacity: 1, duration: 0.35, ease: 'power1.out' }, PUFF_REVEAL);
    tl.call(() => {
      tl.pause();
      ready.then(() => { swap(); requestAnimationFrame(() => requestAnimationFrame(() => tl.resume())); });
    }, [], PUFF_SWAP);
    if (import.meta.env.DEV) (window as unknown as { __puff?: gsap.core.Timeline }).__puff = tl; // e2e/dev: scrub frames
    return tl;
  };

  const onClick = () => {
    if (busy) return;
    const to = nextOutfit(current);
    if (reduce.matches) { show(to); return; }
    busy = true;
    const ready = imgs.get(to)!.decode().catch(() => {});
    burst(ready, () => show(to)).eventCallback('onComplete', () => { busy = false; });
  };
  // the wand's label follows the pointer while it is over him (hover devices only)
  const tip = document.querySelector<HTMLElement>('[data-wand-tip]');
  const fig = button.parentElement;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const onTipMove = (e: PointerEvent) => {
    if (!tip || !fig || !fine.matches || e.pointerType !== 'mouse') return;
    const r = fig.getBoundingClientRect();
    // below-right of the wand, flipped to its left when it would run off the screen
    const flip = e.clientX + 26 + tip.offsetWidth > document.documentElement.clientWidth - 8;
    const x = e.clientX - r.left + (flip ? -tip.offsetWidth - 10 : 26);
    tip.style.transform = `translate(${Math.round(x)}px, ${Math.round(e.clientY - r.top + 24)}px)`;
    tip.classList.add('is-on');
  };
  const onTipLeave = () => tip?.classList.remove('is-on');
  button.addEventListener('pointermove', onTipMove);
  button.addEventListener('pointerleave', onTipLeave);
  button.addEventListener('click', onClick);
  show('hanfu');
  status.textContent = ''; // say nothing until the first change
  return () => {
    button.removeEventListener('click', onClick);
    button.removeEventListener('pointermove', onTipMove);
    button.removeEventListener('pointerleave', onTipLeave);
  };
}
