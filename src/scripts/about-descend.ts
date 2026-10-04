import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Work -> About, retune here. Timeline positions are fractions of the pinned scroll; pin lengths are % of the
 * viewport height. `part` is where each wall's inner edge travels to in phase 1, as a fraction of the viewport
 * width from its own side (desktop leaves a centre opening for Ed; phones open almost to the edges).
 */
export const DESCEND = {
  phases: { part: [0, 0.4], descend: [0.25, 0.65], glide: [0.65, 1], clear: [0.58, 0.92] },
  // phones: the opening can only reach the screen edges, which leaves the walls' wisps across him, so there the
  // walls part and slide straight off first and he descends into clear page (the text reads from the first part)
  phasesMobile: { part: [0, 0.35], descend: [0.5, 0.9], glide: [1, 1], clear: [0.28, 0.6] },
  pin: { desktop: 180, mobile: 140 },
  part: { desktop: 0.14, mobile: 0.04 },
  // how far above his rest spot Ed starts (yPercent of his own height): enough to read as a descent, little enough
  // that he is mostly on screen by the time he is inked (phones much less: the bio sits right above him and stays
  // readable the whole way, so he must not sweep across it)
  dropFrom: { desktop: -75, mobile: -18 },
  scrub: 1,
} as const;

/** Ed waits above the opening, centred, unseen, with a slight tilt that settles as he comes down. */
export const ED_START = { yPercent: DESCEND.dropFrom.desktop, rotation: 2, opacity: 0 };

/** The two-column layout (and its choreography) starts at tablet width; keep in step with About.astro. */
export const SPLIT = '48rem';

/**
 * A pinned stage. Two cloud walls meet over it, part, Ed descends through the opening and (tablet and up) glides
 * right into his column while the text rises in on the left. On phones the stage is one screen (heading, bio, Ed):
 * the text is under the walls, never faded, so it reads as soon as they part, and Ed drops a short way into the
 * space below it. When the pin releases, About is simply the finished layout. Reduced motion and no-JS never stage
 * it: the walls stay hidden, all at rest.
 */
export function initAboutDescend(root: HTMLElement): () => void {
  const ed = root.querySelector<HTMLElement>('.about__ed');
  const fig = root.querySelector<HTMLElement>('.about__figure');
  const stage = root.querySelector<HTMLElement>('.about__stage');
  // everything that rises in beside Ed on the two-column layout: the bio and the list below it
  const text = [...root.querySelectorAll<HTMLElement>('.about__text, .about__more')];
  const box = root.querySelector<HTMLElement>('.about__walls');
  const left = root.querySelector<HTMLElement>('.about__wall--left');
  const right = root.querySelector<HTMLElement>('.about__wall--right');
  if (!ed || !fig || !stage || text.length < 2 || !box || !left || !right) return () => {};
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();
  mm.add(
    { desktop: `(min-width: ${SPLIT}) and (prefers-reduced-motion: no-preference)`, mobile: `(max-width: calc(${SPLIT} - 0.01rem)) and (prefers-reduced-motion: no-preference)` },
    (c) => {
      const desktop = Boolean(c.conditions?.desktop);
      if (!desktop && !c.conditions?.mobile) return;
      root.classList.add('is-staged');
      const vw = () => document.documentElement.clientWidth;
      // the screen holds still on the section (two columns) or on the one-screen stage under the nav (phones)
      const focus = desktop ? root : stage;
      const navH = () => document.querySelector('.nav')?.getBoundingClientRect().height ?? 72;
      // the walls' box is centred on that focus, so while pinned it overfills the screen top and bottom
      const placeBox = () => {
        const r = focus.getBoundingClientRect();
        const centre = r.top - root.getBoundingClientRect().top + r.height / 2;
        box.style.top = `${centre - window.innerHeight * 0.6}px`;
      };
      placeBox();
      ScrollTrigger.addEventListener('refreshInit', placeBox);

      // inner edge of a wall at rest, in px from the screen's left (layout box, ignores the tween's transform)
      const inner = (el: HTMLElement) => el.offsetLeft + Number(getComputedStyle(el).getPropertyValue('--inner')) * el.offsetWidth;
      const opening = desktop ? DESCEND.part.desktop : DESCEND.part.mobile;
      const leftPart = () => vw() * opening - inner(left);
      const rightPart = () => vw() * (1 - opening) - inner(right);
      // fully off: the left painting's furthest billow (0.7 of its width) and the right painting's whole box,
      // since its wispy tails reach almost to its left side
      const leftOff = () => -(left.offsetLeft + left.offsetWidth * 0.7);
      const rightOff = () => vw() - right.offsetLeft;
      // Ed starts centred on the screen; on desktop his rest spot is the right column, so he glides there
      const edX = () => {
        if (!desktop) return 0;
        const r = fig.getBoundingClientRect();
        return vw() / 2 - (r.left + r.width / 2);
      };

      // explicit sets, not fromTo: a scrubbed timeline sitting at progress 0 never renders its children,
      // so on a page loaded already scrolled to this point the start state would otherwise never apply
      gsap.set([left, right], { x: 0 });
      gsap.set(ed, { ...ED_START, yPercent: desktop ? DESCEND.dropFrom.desktop : DESCEND.dropFrom.mobile, x: edX });
      if (desktop) gsap.set(text, { y: 24, opacity: 0 });

      const ph = desktop ? DESCEND.phases : DESCEND.phasesMobile;
      const [p0, p1] = ph.part;
      const [d0, d1] = ph.descend;
      const [g0, g1] = ph.glide;
      const [c0, c1] = ph.clear;
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: focus,
          start: desktop ? 'center center' : () => `top top+=${navH()}`,
          end: `+=${desktop ? DESCEND.pin.desktop : DESCEND.pin.mobile}%`,
          pin: root,
          scrub: DESCEND.scrub,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: (st) => {
            root.dataset.pinStart = String(Math.round(st.start));
            root.dataset.pinEnd = String(Math.round(st.end));
          },
          onLeave: () => float.play(),
        },
      });
      // phase 1: the walls part, easing in and out so the first scroll does not throw them open
      tl.to(left, { x: leftPart, duration: p1 - p0, ease: 'sine.inOut' }, p0)
        .to(right, { x: rightPart, duration: p1 - p0, ease: 'sine.inOut' }, p0)
        // phase 2: Ed comes down through the opening, inked quickly, the tilt settling as he lands
        .to(ed, { yPercent: 0, rotation: 0, duration: d1 - d0, ease: 'power2.out' }, d0)
        .to(ed, { opacity: 1, duration: 0.1 }, d0)
        // phase 3: the walls drift off the sides, a touch ahead of the glide so the text rises into clear page
        .to(left, { x: leftOff, duration: c1 - c0, ease: 'sine.inOut' }, c0)
        .to(right, { x: rightOff, duration: c1 - c0, ease: 'sine.inOut' }, c0);
      // ...and on desktop Ed glides into his column while the text rises in on the left
      if (desktop) {
        tl.to(ed, { x: 0, duration: g1 - g0, ease: 'power2.inOut' }, g0)
          .to(text, { y: 0, opacity: 1, duration: (g1 - g0) * 0.8, ease: 'power2.out' }, g0 + (g1 - g0) * 0.2);
      }

      // idle, once landed: a slow ±6px float on its own transform channel (y), so it never fights the scrub
      const float = gsap.fromTo(ed, { y: 6 }, { y: -6, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true });
      if (tl.scrollTrigger && tl.scrollTrigger.progress >= 1) float.play();

      // the jump is intercepted, so keyboard focus has to be moved by hand (without undoing the scroll)
      const focusAbout = () => {
        root.setAttribute('tabindex', '-1');
        root.focus({ preventScroll: true });
      };
      // a refresh (late images, resize) briefly unwraps the pin, which moves the section and drops its focus: put it back
      let hadFocus = false;
      const noteFocus = () => { hadFocus = document.activeElement === root; };
      const keepFocus = () => { if (hadFocus && document.activeElement !== root) root.focus({ preventScroll: true }); };
      ScrollTrigger.addEventListener('refreshInit', noteFocus);
      ScrollTrigger.addEventListener('refresh', keepFocus);
      // a nav link to #about lands where the stage is finished, not on the closed walls at the pin start
      const onClick = (e: MouseEvent) => {
        const a = (e.target as Element).closest?.('a[href="#about"], a[href="/#about"]');
        if (!a || location.pathname !== '/' || !tl.scrollTrigger) return;
        e.preventDefault();
        window.scrollTo({ top: tl.scrollTrigger.end, behavior: 'smooth' });
        history.pushState(null, '', '#about');
        focusAbout();
      };
      document.addEventListener('click', onClick);
      if (location.hash === '#about' && tl.scrollTrigger) {
        const st = tl.scrollTrigger;
        requestAnimationFrame(() => {
          window.scrollTo(0, st.end);
          focusAbout();
        });
      }

      return () => {
        ScrollTrigger.removeEventListener('refreshInit', placeBox);
        ScrollTrigger.removeEventListener('refreshInit', noteFocus);
        ScrollTrigger.removeEventListener('refresh', keepFocus);
        document.removeEventListener('click', onClick);
        root.classList.remove('is-staged');
        root.removeAttribute('tabindex');
        box.style.top = '';
        delete root.dataset.pinStart;
        delete root.dataset.pinEnd;
      };
    },
  );

  // the paintings load lazily and the pin adds a screenful of scroll: recompute every trigger once they are in
  const refresh = () => ScrollTrigger.refresh();
  if (document.readyState === 'complete') refresh();
  else window.addEventListener('load', refresh, { once: true });
  for (const img of root.querySelectorAll('img')) if (!img.complete) img.addEventListener('load', refresh, { once: true });

  return () => mm.revert();
}
