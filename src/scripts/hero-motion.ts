import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { whilePlaying } from './motion';

export function parallaxOffset(pointer: number, depth: number, maxShift = 28): number {
  const p = Math.max(-1, Math.min(1, pointer));
  return Math.round(p * depth * maxShift * 100) / 100;
}

export function scrollShift(scrollFactor: number, maxPercent = 10): number {
  return -maxPercent * scrollFactor || 0;
}

/**
 * Starting yPercent at page top. We start high above the land (Ed, round 9): the layers behind Melbourne (depth 0.5)
 * stand well up and apart from the city, the further back the higher; layers in front start a little lower.
 */
export function spreadPercent(depth: number, k = 50): number {
  const kk = depth < 0.5 ? k : k * 0.3;
  return Math.round((depth - 0.5) * kk * 100) / 100 || 0;
}

/** Settled yPercent once the scene reaches the top: coming down, the land flattens, every layer close to the city's
 * level (just a touch of depth left: back layers a hair lower, front a hair higher). */
export function collapsePercent(depth: number, c = 3): number {
  return Math.round((depth - 0.5) * -c * 100) / 100 || 0;
}

/**
 * Scale at the end of the hero's scroll (Ed, round 10: a slight zoom into the city as you scroll, with the parallax).
 * Nearer layers grow more than far ones, so the zoom itself adds depth: the far range ~4%, the city ~8%, the front
 * clouds 12% (20% more than the first cut, Ed). Every layer zooms towards the same point, the city (`ZOOM_ORIGIN`), so the layers stay registered.
 */
export function zoomScale(depth: number, zoom = 0.12): number {
  return Math.round((1 + zoom * (0.3 + 0.7 * depth)) * 1000) / 1000;
}
export const ZOOM_ORIGIN = '50% 72%';

/** Clouds cross 20% faster than the first cut (Ed, 2026-10-04): every duration divided by this. */
export const CLOUD_SPEED = 1.2;

/** Seconds for a cloud to cross its layer. Front clouds (depth 1) take 75s; further back they slow sharply, as far
 * things do (Ed, round 9: the back clouds were drifting like near ones, behind the mountains). */
export function cloudDuration(depth: number, index: number): number {
  return (90 / (0.22 + 0.78 * depth) + (index % 3) * 15) / CLOUD_SPEED;
}


export function initHero(root: HTMLElement): () => void {
  const scene = root.querySelector<HTMLElement>('.hero__scene');
  if (!scene) return () => {};
  gsap.registerPlugin(ScrollTrigger);

  // matchMedia, not a one-off check: switching reduced motion on mid-session reverts every tween to the static
  // scene (and switching it off starts them again)
  const mm = gsap.matchMedia(root);
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    let onMove: ((e: PointerEvent) => void) | undefined;

    gsap.fromTo('[data-reveal]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out' });

    // the endless ones (tram, clouds) answer to the Pause motion switch
    const endless: gsap.core.Animation[] = [];
    const tram = gsap
      .timeline({ repeat: -1, repeatDelay: 2.5 })
      .set('[data-tram]', { left: '31%', opacity: 0 })
      .to('[data-tram]', { opacity: 1, duration: 0.8 })
      .to('[data-tram]', { left: '58%', duration: 11, ease: 'none' }, 0)
      .to('[data-tram]', { opacity: 0, duration: 0.8 }, 10.2);
    endless.push(tram);

    scene.querySelectorAll<HTMLElement>('.hero__cloud').forEach((c, i) => {
      if (c.offsetWidth === 0) return; // hidden on mobile: no endless tween for nothing
      const layer = c.parentElement as HTMLElement;
      const depth = Number((c.closest('[data-depth]') as HTMLElement).dataset.depth);
      const tween = gsap.fromTo(
        c,
        { x: () => -(c.offsetLeft + c.offsetWidth) },
        { x: () => layer.clientWidth - c.offsetLeft, duration: cloudDuration(depth, i), ease: 'none', repeat: -1, invalidateOnRefresh: true },
      );
      tween.progress((i * 0.37) % 1);
      endless.push(tween);
    });

    const offMotion = whilePlaying(() => endless.forEach((t) => t.resume()), () => endless.forEach((t) => t.pause()));

    // a data-static layer never moves, neither on scroll nor with the pointer (none at the moment)
    scene.querySelectorAll<HTMLElement>('[data-static]').forEach((l) => gsap.set(l, { yPercent: 0 }));
    const layers = [...scene.querySelectorAll<HTMLElement>('[data-depth]:not([data-static])')];
    // One scrubbed timeline per layer: phase 1 (page top -> scene top reaches viewport top) collapses the
    // tall spread into a tighter landscape; phase 2 is the scroll-out parallax from there.
    const mobile = window.matchMedia('(max-width: 48rem)');
    const settleShare = () => {
      const settle = scene.getBoundingClientRect().top + window.scrollY;
      return settle / (settle + scene.offsetHeight);
    };
    const builders = layers.map((layer) => {
      const depth = Number(layer.dataset.depth);
      const factor = Number(layer.dataset.scroll);
      const tl = gsap.timeline({ scrollTrigger: { trigger: scene, start: 0, end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true } });
      const build = () => {
        const share = settleShare();
        tl.clear();
        const collapsed = collapsePercent(depth, mobile.matches ? 2 : 3);
        if (share > 0.001) {
          tl.fromTo(layer, { yPercent: spreadPercent(depth, mobile.matches ? 30 : 50) }, { yPercent: collapsed, ease: 'none', duration: share });
        } else {
          tl.set(layer, { yPercent: collapsed });
        }
        tl.to(layer, { yPercent: collapsed + scrollShift(factor), ease: 'none', duration: 1 - share });
        // the zoom runs the whole way, alongside both phases
        tl.fromTo(layer, { scale: 1 }, { scale: zoomScale(depth, mobile.matches ? 0.072 : 0.12), ease: 'none', duration: 1 }, 0);
      };
      gsap.set(layer, { transformOrigin: ZOOM_ORIGIN });
      build();
      return build;
    });
    // layout changes (resize, fonts, images) move the scene, so the phase split is recomputed on every refresh
    const onRefreshInit = () => builders.forEach((b) => b());
    ScrollTrigger.addEventListener('refreshInit', onRefreshInit);

    if (window.matchMedia('(pointer: fine)').matches) {
      onMove = (e: PointerEvent) => {
        const r = scene.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
        layers.forEach((layer) => {
          const depth = Number(layer.dataset.depth);
          gsap.to(layer, { x: parallaxOffset(nx, depth), y: parallaxOffset(ny, depth, 10), duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
        });
      };
      scene.addEventListener('pointermove', onMove);
    }

    return () => {
      offMotion();
      if (onMove) scene.removeEventListener('pointermove', onMove);
      ScrollTrigger.removeEventListener('refreshInit', onRefreshInit);
    };
  });

  return () => mm.revert();
}
