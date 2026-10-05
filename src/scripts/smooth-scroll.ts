import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Smooth scrolling across the whole site (Ed, round 10): the wheel and trackpad glide to a stop instead of stepping.
 * Lenis eases the page's real scroll position, so ScrollTrigger, anchors and the browser's own scrollbar all keep
 * working; it runs on GSAP's ticker so the scrubbed scenes and the scroll move in the same frame. Touch keeps the
 * phone's own native scrolling. Off for reduced motion. Retune `SMOOTH` here.
 */
export const SMOOTH = {
  // 0..1, how much of the remaining distance each frame covers: lower glides longer
  // (0.13, round 10: 0.09 trailed the wheel by ~0.4s, which stacked with the scrubs and felt heavy)
  lerp: 0.13,
  wheelMultiplier: 1,
};

let lenis: Lenis | null = null;

/** Scroll the page to y, through the smooth scroller when it runs (so the two never fight). */
export function scrollToY(y: number, opts: { immediate?: boolean } = {}): void {
  if (lenis) lenis.scrollTo(y, { immediate: opts.immediate, force: true });
  else window.scrollTo({ top: y, behavior: opts.immediate ? 'auto' : 'smooth' });
}

export function initSmoothScroll(): void {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);
  lenis = new Lenis({ lerp: SMOOTH.lerp, wheelMultiplier: SMOOTH.wheelMultiplier });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // links to a place on this page glide there too (a handler that has already taken the click, like the About
  // stage's, wins); the target takes focus, as a native jump would give it
  window.addEventListener('click', (e) => {
    const a = (e.target as Element).closest?.<HTMLAnchorElement>('a[href*="#"]');
    if (e.defaultPrevented || !a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const url = new URL(a.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    lenis?.scrollTo(target, { offset: -pad });
    history.pushState(null, '', url.hash);
    if (!target.matches('a, button, input, select, textarea, [tabindex]')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  // the landing doors lock the page (html.intro): hold the smooth scroller still until they have gone
  const root = document.documentElement;
  const sync = () => (root.classList.contains('intro') ? lenis?.stop() : lenis?.start());
  sync();
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class'] });
}
