import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isMotionPaused, whilePlaying } from './motion';
import { scrollToY } from './smooth-scroll';

/**
 * Work -> About, retune here. Timeline positions are fractions of the pinned scroll; pin lengths are % of the
 * viewport height. `part` is where each wall's inner edge travels to in phase 1, as a fraction of the viewport
 * width from its own side (desktop leaves a centre opening for Ed; phones open almost to the edges).
 */
export const DESCEND = {
  // Ed is already there behind the walls before they start to part, and comes down as they open (Ed, round 9), so
  // the opening reveals him rather than him arriving after it
  // Round 10 (Ed: he lingered too long in the centre, and felt choppy): the glide starts while he is still settling, so
  // the drop curves into the glide in one movement, with no pause between them
  phases: { part: [0, 0.4], descend: [0, 0.45], glide: [0.28, 0.85], clear: [0.3, 0.75] },
  // desktop walls: one continuous move each, closed to off the side, across this span (round 10)
  wallsDesktop: [0, 0.8],
  // phones: no pin (Ed, round 10: pinning snapped on phones, and he lingered with nothing left to do). The scene plays
  // as the stage scrolls up under the nav (`mobileFrom`, a fraction of the screen, to the nav): the walls part and slide
  // off the sides while he descends behind them, everything ending together, as the clouds clear and Tap me appears
  phasesMobile: { part: [0, 0.5], descend: [0, 0.75], glide: [1, 1], clear: [0.45, 1] },
  mobileFrom: 0.6, // (0.85 opened the clouds before they had covered the stage: Ed came up from below, unrevealed)
  // Ed stays hidden behind the walls (his ribbon reached up through their feathered top) and fades in over this first
  // stretch of the timeline, as the walls start to part (Ed, round 10)
  appear: [0, 0.05],
  // (round 10: 180 held the page still for almost two screens; shorter so the scroll keeps answering). Desktop only
  pin: { desktop: 90 }, // (Ed, round 10: 120 still took too long)
  // the walls start parting this far (fraction of a screen) before the pin, while the last work cards are still on
  // their way off screen (Ed, round 9); the timeline's phases run across this lead-in and the pin together
  lead: 0.55,
  part: { desktop: 0.14, mobile: 0.04 },
  // how far above his rest spot Ed starts (yPercent of his own height): enough to read as a descent, little enough
  // that he stays inside the walls' cover until they open (any higher and his head shows above the clouds) (phones much less: the bio sits right above him and stays
  // readable the whole way, so he must not sweep across it)
  dropFrom: { desktop: -30, mobile: -18 },
  // the page scroll is already smoothed (smooth-scroll.ts), so the scrub only needs a short catch-up (it was 1s,
  // which with the smooth scroll on top made the scene trail the scroll)
  scrub: 0.15,
} as const;

/** Ed waits behind the closed walls, centred, with a slight tilt that settles as he comes down. He is faded out until
 * the walls start to part (DESCEND.appear), still fully behind them, so he never pops in and never peeks over them. */
export const ED_START = { yPercent: DESCEND.dropFrom.desktop, rotation: 2, opacity: 0 };

/** The two-column layout (and its choreography) starts at tablet width; keep in step with About.astro. */
export const SPLIT = '48rem';

/**
 * A pinned stage (tablet and up). Two cloud walls meet over it, part, Ed descends through the opening and glides
 * right into his column while the text rises in on the left. On phones nothing pins: the stage is one screen (heading,
 * bio, Ed) and the walls part off it as it scrolls up to the nav, the text under them never faded, while Ed drops a
 * short way into the space below it. Afterwards About is simply the finished layout. Reduced motion and no-JS never stage
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
  // a phone's address bar showing and hiding resizes the screen: don't recompute every trigger (and jump) for it
  ScrollTrigger.config({ ignoreMobileResize: true });

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
      gsap.set([left, right], { x: 0, force3D: true });
      // decode the walls ahead of time, so their first frame on screen doesn't stall the scroll (round 10)
      for (const w of [left, right]) (w as HTMLImageElement).decode?.().catch(() => {});
      gsap.set(ed, { ...ED_START, yPercent: desktop ? DESCEND.dropFrom.desktop : DESCEND.dropFrom.mobile, x: edX });
      if (desktop) gsap.set(text, { y: 24, opacity: 0 });

      const ph = desktop ? DESCEND.phases : DESCEND.phasesMobile;
      const [p0, p1] = ph.part;
      const [d0, d1] = ph.descend;
      const [g0, g1] = ph.glide;
      const [c0, c1] = ph.clear;
      // desktop: the pin holds the stage still; the timeline starts a little earlier (DESCEND.lead) and ends with it.
      // Phones: no pin, the timeline runs as the stage scrolls up to the nav. (data-pin-* mark the scene's span, for tests)
      const mark = (st: ScrollTrigger) => {
        root.dataset.pinStart = String(Math.round(st.start));
        root.dataset.pinEnd = String(Math.round(st.end));
      };
      const pin = desktop
        ? ScrollTrigger.create({
            trigger: focus,
            start: 'center center',
            end: `+=${DESCEND.pin.desktop}%`,
            pin: root,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: mark,
          })
        : null;
      const tl = gsap.timeline({
        // force3D: stay on the GPU between phases too (GSAP's default drops to a 2D transform whenever a tween ends,
        // which made the browser repaint the huge wall paintings mid-scroll: the jitter, round 10)
        defaults: { ease: 'none', force3D: true },
        scrollTrigger: {
          ...(pin
            ? { start: () => Math.max(0, pin.start - window.innerHeight * DESCEND.lead), end: () => pin.end }
            : { trigger: stage, start: `top ${DESCEND.mobileFrom * 100}%`, end: () => `top top+=${navH()}` }),
          scrub: DESCEND.scrub,
          invalidateOnRefresh: true,
          onLeave: () => playFloat(),
          // the "magic trick" hint waits until he has landed (mid-descent it would float over the clouds)
          onUpdate: (st) => root.classList.toggle('is-landed', st.progress > 0.97),
          onToggle: (st) => root.classList.toggle('is-landed', st.progress > 0.97),
          onRefresh: (st) => {
            root.classList.toggle('is-landed', st.progress > 0.97); // loaded already past it
            if (!pin) mark(st);
          },
        },
      });
      if (desktop) {
        // desktop (Ed, round 10: the part-then-drift handover jerked, as two tweens fought over x): one unbroken move
        // per wall, from closed to off the side: quick to open (so Ed is revealed as he comes down), then easing away
        tl.to(left, { x: leftOff, duration: DESCEND.wallsDesktop[1] - DESCEND.wallsDesktop[0], ease: 'power1.out' }, DESCEND.wallsDesktop[0])
          .to(right, { x: rightOff, duration: DESCEND.wallsDesktop[1] - DESCEND.wallsDesktop[0], ease: 'power1.out' }, DESCEND.wallsDesktop[0]);
      } else {
        // phones: phase 1 the walls part, phase 3 they drift off the sides (Ed loves this one, round 10)
        tl.to(left, { x: leftPart, duration: p1 - p0, ease: 'power1.out' }, p0)
          .to(right, { x: rightPart, duration: p1 - p0, ease: 'power1.out' }, p0)
          .to(left, { x: leftOff, duration: c1 - c0, ease: 'sine.inOut' }, c0)
          .to(right, { x: rightOff, duration: c1 - c0, ease: 'sine.inOut' }, c0);
      }
      // Ed fades in behind the walls as they begin to part
      tl.to(ed, { opacity: 1, duration: DESCEND.appear[1] - DESCEND.appear[0] }, DESCEND.appear[0])
        // phase 2: Ed comes down through the opening, the tilt settling as he lands (sine: no hard stop to linger on)
        .to(ed, { yPercent: 0, rotation: 0, duration: d1 - d0, ease: 'sine.out' }, d0);
      // ...and on desktop Ed glides into his column while the text rises in on the left
      if (desktop) {
        tl.to(ed, { x: 0, duration: g1 - g0, ease: 'sine.inOut' }, g0)
          .to(text, { y: 0, opacity: 1, duration: (g1 - g0) * 0.8, ease: 'power2.out' }, g0 + (g1 - g0) * 0.2);
      }

      // idle, once landed: a slow ±6px float on its own transform channel (y), so it never fights the scrub
      const float = gsap.fromTo(ed, { y: 6 }, { y: -6, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true });
      const landed = () => Boolean(tl.scrollTrigger && tl.scrollTrigger.progress >= 1);
      // the float is endless, so it answers to the Pause motion switch
      const playFloat = () => { if (!isMotionPaused()) float.play(); };
      const offMotion = whilePlaying(() => { if (landed()) float.play(); }, () => float.pause());
      if (landed()) playFloat();

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
        scrollToY(tl.scrollTrigger.end);
        history.pushState(null, '', '#about');
        focusAbout();
      };
      document.addEventListener('click', onClick);
      if (location.hash === '#about' && tl.scrollTrigger) {
        const st = tl.scrollTrigger;
        requestAnimationFrame(() => {
          scrollToY(st.end, { immediate: true });
          focusAbout();
        });
      }

      return () => {
        pin?.kill();
        offMotion();
        ScrollTrigger.removeEventListener('refreshInit', placeBox);
        ScrollTrigger.removeEventListener('refreshInit', noteFocus);
        ScrollTrigger.removeEventListener('refresh', keepFocus);
        document.removeEventListener('click', onClick);
        root.classList.remove('is-staged', 'is-landed');
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
