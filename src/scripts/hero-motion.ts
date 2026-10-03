import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function parallaxOffset(pointer: number, depth: number, maxShift = 28): number {
  const p = Math.max(-1, Math.min(1, pointer));
  return Math.round(p * depth * maxShift * 100) / 100;
}

export function scrollShift(scrollFactor: number, maxPercent = 10): number {
  return -maxPercent * scrollFactor || 0;
}

export function cloudDuration(depth: number, index: number): number {
  return 200 - depth * 110 + (index % 3) * 15;
}

export function initHero(root: HTMLElement): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const scene = root.querySelector<HTMLElement>('.hero__scene');
  if (!scene) return () => {};
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    gsap.from('[data-reveal]', { y: 24, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' });

    gsap
      .timeline({ repeat: -1, repeatDelay: 2.5 })
      .set('[data-tram]', { left: '31%', opacity: 0 })
      .to('[data-tram]', { opacity: 1, duration: 0.8 })
      .to('[data-tram]', { left: '58%', duration: 11, ease: 'none' }, 0)
      .to('[data-tram]', { opacity: 0, duration: 0.8 }, 10.2);

    scene.querySelectorAll<HTMLElement>('.hero__cloud').forEach((c, i) => {
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
    layers.forEach((layer) =>
      gsap.to(layer, {
        yPercent: scrollShift(Number(layer.dataset.scroll)),
        ease: 'none',
        scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom top', scrub: true },
      }),
    );

    if (window.matchMedia('(pointer: fine)').matches) {
      scene.addEventListener('pointermove', (e) => {
        const r = scene.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
        layers.forEach((layer) => {
          const depth = Number(layer.dataset.depth);
          gsap.to(layer, { x: parallaxOffset(nx, depth), y: parallaxOffset(ny, depth, 10), duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
        });
      });
    }
  }, root);

  return () => ctx.revert();
}
