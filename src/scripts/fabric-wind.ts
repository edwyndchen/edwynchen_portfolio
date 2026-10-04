/**
 * Cloth breathing in the wind: slowly drifts the base frequency of the portrait's feTurbulence, so the noise
 * that displaces the fabric morphs gently instead of wobbling. Retune here. Runs only with motion allowed and only
 * while the figure is on screen; throttled, since every change re-renders the filter.
 */
export const WIND = {
  base: [0.006, 0.011] as const, // x, y frequency at rest (low = broad, soft folds)
  swing: [0.0012, 0.0018] as const, // how far each drifts either side
  period: [11, 8.5] as const, // seconds for a full breath, x and y out of step so it never loops visibly
  fps: 24,
};

/** The frequency pair at time t (seconds). Pure, for tests. */
export function windFrequency(t: number): [number, number] {
  const f = (i: 0 | 1) => WIND.base[i] + WIND.swing[i] * Math.sin((2 * Math.PI * t) / WIND.period[i]);
  return [f(0), f(1)];
}

export function initFabricWind(ed: HTMLElement, turb: SVGFETurbulenceElement): () => void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return () => {};
  ed.classList.add('is-windy');

  let raf = 0;
  let last = 0;
  const t0 = performance.now();
  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    if (now - last < 1000 / WIND.fps) return;
    last = now;
    const [x, y] = windFrequency((now - t0) / 1000);
    turb.setAttribute('baseFrequency', `${x.toFixed(5)} ${y.toFixed(5)}`);
  };
  const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  // pause whenever the figure is off-screen
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
  io.observe(ed);
  // a visitor who turns reduced motion on mid-visit gets a still figure straight away
  const onChange = () => { if (reduce.matches) { stop(); io.disconnect(); ed.classList.remove('is-windy'); } };
  reduce.addEventListener('change', onChange);

  return () => { stop(); io.disconnect(); reduce.removeEventListener('change', onChange); ed.classList.remove('is-windy'); };
}
