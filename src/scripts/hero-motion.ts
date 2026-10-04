import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function parallaxOffset(pointer: number, depth: number, maxShift = 28): number {
  const p = Math.max(-1, Math.min(1, pointer));
  return Math.round(p * depth * maxShift * 100) / 100;
}

export function scrollShift(scrollFactor: number, maxPercent = 10): number {
  return -maxPercent * scrollFactor || 0;
}

/** Starting yPercent at page top: layers behind Melbourne (depth 0.5) start higher, layers in front start lower. */
export function spreadPercent(depth: number, k = 30): number {
  return Math.round((depth - 0.5) * k * 100) / 100 || 0;
}

/** Settled yPercent once the scene reaches the top: a tighter landscape than the painting, back layers sink, front layers rise. */
export function collapsePercent(depth: number, c = 10): number {
  return Math.round((depth - 0.5) * -c * 100) / 100 || 0;
}

export function cloudDuration(depth: number, index: number): number {
  return 200 - depth * 110 + (index % 3) * 15;
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

    gsap
      .timeline({ repeat: -1, repeatDelay: 2.5 })
      .set('[data-tram]', { left: '31%', opacity: 0 })
      .to('[data-tram]', { opacity: 1, duration: 0.8 })
      .to('[data-tram]', { left: '58%', duration: 11, ease: 'none' }, 0)
      .to('[data-tram]', { opacity: 0, duration: 0.8 }, 10.2);

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
    });

    gsap.to('.hero__cross circle', { opacity: 0.35, duration: 2.4, stagger: { each: 0.5, repeat: -1, yoyo: true }, ease: 'sine.inOut' });

    const layers = [...scene.querySelectorAll<HTMLElement>('[data-depth]')];
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
        const collapsed = collapsePercent(depth, mobile.matches ? 6 : 10);
        if (share > 0.001) {
          tl.fromTo(layer, { yPercent: spreadPercent(depth, mobile.matches ? 16 : 30) }, { yPercent: collapsed, ease: 'none', duration: share });
        } else {
          tl.set(layer, { yPercent: collapsed });
        }
        tl.to(layer, { yPercent: collapsed + scrollShift(factor), ease: 'none', duration: 1 - share });
      };
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
      if (onMove) scene.removeEventListener('pointermove', onMove);
      ScrollTrigger.removeEventListener('refreshInit', onRefreshInit);
    };
  });

  return () => mm.revert();
}
