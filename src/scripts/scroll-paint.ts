import { gsap } from 'gsap';

/**
 * Paint the scroll (Ed, 2026-10-05). The contact scroll is a little painting toy:
 *   1. paint   – a faint skeleton of the scene pulses; wherever the brush goes, the painting comes through in bristly
 *                strokes (the pointer is a brush over the paper; "Paint it for me" does it for keyboard users)
 *   2. pig     – then a prompt: add a flying pig; it paints itself in, stroke by stroke, where you click
 *   3. seal    – then Ed's seal follows the pointer; one click presses it in red
 *   4. done    – "Start again" clears it all; the arrow swaps between the mountains and the river
 * Every step has a button, so it all works from the keyboard. Reduced motion: no pulsing, and reveals land at once.
 */
export type Step = 'paint' | 'pig' | 'seal' | 'done';
export const SCENES = [
  // land: the side the cliffs or headland are on; the flying pig always heads towards it (Ed, round 9)
  { key: 'apostles', label: 'the Twelve Apostles', src: '/scroll/apostles.webp', sketch: '/scroll/apostles-sketch.webp', land: 'right' },
  { key: 'prom', label: 'Wilsons Promontory', src: '/scroll/prom.webp', sketch: '/scroll/prom-sketch.webp', land: 'left' },
] as const;
/** How much of the scene must be painted before the pig prompt (fraction of the scene's own area). */
export const PAINTED_ENOUGH = 0.35;
/** The seal's contact point, as a fraction of its painting: the centre of its base, which faces the paper. */
export const SEAL_TIP = { x: 0.5, y: 0.97 };
/** The seal leans a little to the right, as if in a right hand (degrees). */
export const SEAL_TILT = 10;
/** How soft a stroke's edge is, as a share of the brush's radius. */
export const SOFTNESS = 0.45;
/** The brush's tip, as a fraction of its painting (bottom left: it leans right, as in a right hand). */
export const BRUSH_TIP = { x: 0.01, y: 0.99 };
/** What each step says (above the scroll, read out by screen readers): a little cheekier as it goes (Ed, round 9). */
export const PROMPTS: Record<Step, (scene: string) => string> = {
  paint: (scene) => `Grab the brush. ${scene[0].toUpperCase()}${scene.slice(1)} won’t paint ${scene.startsWith('the ') ? 'themselves' : 'itself'}.`,
  pig: () => 'Looking good. Now tap the sky: today’s the day you do see pigs fly.',
  seal: () => 'Pigs: airborne. Sign it with my seal to make it official.',
  done: () => 'Signed, sealed and flying. Told you pigs could fly.',
};
/** The step after this one. Pure, for tests. */
export const nextStep = (s: Step): Step => (s === 'paint' ? 'pig' : s === 'pig' ? 'seal' : 'done');

const UI = 'button, a, [data-paint-ui]';
const img = (src: string) => new Promise<HTMLImageElement>((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(i); i.src = src; });

interface Bristle { off: number; w: number; a: number }
// a loaded brush: dense hairs that lay down solid colour through the middle, drier and lighter towards the edges
const bristles = (n = 18): Bristle[] => Array.from({ length: n }, (_, k) => {
  const off = (k / (n - 1) - 0.5) * 2 + (Math.random() - 0.5) * 0.1;
  return { off, w: 0.24 + Math.random() * 0.26, a: Math.min(1, 1.05 - Math.abs(off) * 0.45 + (Math.random() - 0.5) * 0.15) };
});
/** One brush movement from a to b on a mask: each bristle drags its own line, so strokes come out streaky, like paint. */
function dab(ctx: CanvasRenderingContext2D, ax: number, ay: number, bx: number, by: number, r: number, br: Bristle[]) {
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  ctx.lineCap = 'round';
  // a soft halo on every hair feathers the stroke's edges into the paper (Ed: no harsh edges). shadowBlur is in device
  // pixels and ignores the transform, so it is scaled by the canvas's own pixel ratio
  ctx.shadowColor = '#000';
  ctx.shadowBlur = r * SOFTNESS * ctx.getTransform().a;
  for (const b of br) {
    ctx.globalAlpha = b.a;
    ctx.lineWidth = r * b.w;
    ctx.beginPath();
    ctx.moveTo(ax + nx * b.off * r, ay + ny * b.off * r);
    ctx.lineTo(bx + nx * b.off * r, by + ny * b.off * r);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}
/** A zig-zag of brush strokes that sweeps a box, for the automatic reveals (the pig, "Paint it for me"). */
function sweep(x: number, y: number, w: number, h: number, rows: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= rows; i++) {
    const yy = y + (h * i) / rows, ltr = i % 2 === 0;
    for (let k = 0; k <= 12; k++) { const t = k / 12; pts.push([x + w * (ltr ? t : 1 - t), yy + Math.sin(t * Math.PI) * (h / rows) * 0.35]); }
  }
  return pts;
}

export function initScrollPaint(root: HTMLElement): () => void {
  const paper = root.querySelector<HTMLElement>('[data-paint]');
  const canvas = root.querySelector<HTMLCanvasElement>('[data-paint-canvas]');
  const sketch = root.querySelector<HTMLImageElement>('[data-paint-sketch]');
  const prompt = root.querySelector<HTMLElement>('[data-paint-prompt]');
  const seal = root.querySelector<HTMLImageElement>('[data-seal]');
  const brush = root.querySelector<HTMLImageElement>('[data-brush]');
  const stamps = root.querySelector<HTMLElement>('[data-stamps]');
  const tpl = root.querySelector<HTMLTemplateElement>('[data-stamp-tpl]');
  const btn = (k: string) => root.querySelector<HTMLButtonElement>(`[data-paint-action="${k}"]`)!;
  if (!paper || !canvas || !sketch || !prompt || !seal || !brush || !stamps || !tpl) return () => {};
  const ctx = canvas.getContext('2d')!;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mask = document.createElement('canvas'), mctx = mask.getContext('2d')!;
  const pigLayer = document.createElement('canvas'), pctx = pigLayer.getContext('2d')!;
  const pigMask = document.createElement('canvas'), pmctx = pigMask.getContext('2d')!;

  let scene = 0, step: Step = 'paint', started = false;
  let art: HTMLImageElement | null = null, pigArt: HTMLImageElement | null = null;
  let W = 0, H = 0, dpr = 1, box = { x: 0, y: 0, w: 0, h: 0 }; // the scene's box on the canvas (css px)
  let pig: { x: number; y: number; w: number; h: number } | null = null;
  let raf = 0, busy = false; // busy: the pig is painting itself in

  // --- drawing ---
  const render = () => {
    raf = 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (art) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(art, box.x * dpr, box.y * dpr, box.w * dpr, box.h * dpr);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(mask, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (pig && pigArt) {
      pctx.setTransform(1, 0, 0, 1, 0, 0);
      pctx.clearRect(0, 0, pigLayer.width, pigLayer.height);
      pctx.globalCompositeOperation = 'source-over';
      // the painting faces right; mirrored when this scene's land is on the left
      if (SCENES[scene].land === 'left') {
        pctx.setTransform(-1, 0, 0, 1, (pig.x * 2 + pig.w) * dpr, 0);
        pctx.drawImage(pigArt, pig.x * dpr, pig.y * dpr, pig.w * dpr, pig.h * dpr);
        pctx.setTransform(1, 0, 0, 1, 0, 0);
      } else pctx.drawImage(pigArt, pig.x * dpr, pig.y * dpr, pig.w * dpr, pig.h * dpr);
      pctx.globalCompositeOperation = 'destination-in';
      pctx.drawImage(pigMask, 0, 0);
      ctx.drawImage(pigLayer, 0, 0);
    }
  };
  const ask = () => { if (!raf) raf = requestAnimationFrame(render); };
  const brushR = () => Math.max(18, W * 0.028);

  const layout = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    // keep what is painted when the size changes: scale the old masks onto the new size
    const oldMask = mask.width ? (() => { const c = document.createElement('canvas'); c.width = mask.width; c.height = mask.height; c.getContext('2d')!.drawImage(mask, 0, 0); return c; })() : null;
    const oldPig = pigMask.width ? (() => { const c = document.createElement('canvas'); c.width = pigMask.width; c.height = pigMask.height; c.getContext('2d')!.drawImage(pigMask, 0, 0); return c; })() : null;
    const k = W ? r.width / W : 1;
    W = r.width; H = r.height; dpr = Math.min(2, window.devicePixelRatio || 1);
    for (const c of [canvas, mask, pigLayer, pigMask]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    for (const [c, old] of [[mctx, oldMask], [pmctx, oldPig]] as const) {
      c.setTransform(1, 0, 0, 1, 0, 0);
      if (old) c.drawImage(old, 0, 0, mask.width, mask.height);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.strokeStyle = '#000';
    }
    if (pig && k !== 1) pig = { x: pig.x * k, y: pig.y * k, w: pig.w * k, h: pig.h * k };
    if (art) {
      // the scene sits on the foot of the paper, as wide as it can be without growing taller than the paper
      const ratio = art.naturalHeight / art.naturalWidth;
      const w = Math.min(W, H / ratio), h = w * ratio;
      box = { x: (W - w) / 2, y: H - h, w, h };
      Object.assign(sketch.style, { left: `${box.x}px`, top: `${box.y}px`, width: `${box.w}px`, height: `${box.h}px` });
    }
    ask();
  };

  // --- steps ---
  const say = () => {
    prompt.textContent = PROMPTS[step](SCENES[scene].label);
    root.dataset.step = step;
    btn('auto').hidden = step !== 'paint';
    btn('pig').hidden = step !== 'pig';
    btn('seal').hidden = step !== 'seal';
    paper.classList.toggle('is-brush', step === 'paint' || step === 'pig');
    if (step !== 'paint' && step !== 'pig') showBrush(false);
  };
  const go = (s: Step) => { step = s; say(); if (s !== 'seal') showSeal(false); };

  const coverage = () => {
    // painted share of the scene's own box, read off a small copy of the mask
    const s = document.createElement('canvas'), sw = 120, sh = Math.max(1, Math.round((box.h / box.w) * 120));
    s.width = sw; s.height = sh;
    const c = s.getContext('2d')!;
    c.drawImage(mask, box.x * dpr, box.y * dpr, box.w * dpr, box.h * dpr, 0, 0, sw, sh);
    const d = c.getImageData(0, 0, sw, sh).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 90) n++;
    return n / (sw * sh);
  };

  const firstStroke = () => {
    if (started) return;
    started = true;
    sketch.classList.add('is-gone');
  };

  // automatic strokes along a path (pig, "Paint it for me"); instant with reduced motion
  const autoPaint = (c: CanvasRenderingContext2D, pts: [number, number][], r: number, ms: number) => new Promise<void>((done) => {
    const br = bristles(14);
    if (reduce.matches || ms === 0) {
      for (let i = 1; i < pts.length; i++) dab(c, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], r, br);
      ask(); done(); return;
    }
    let i = 1;
    const per = pts.length / (ms / 16);
    const tick = () => {
      const until = Math.min(pts.length, i + Math.max(1, Math.round(per)));
      for (; i < until; i++) dab(c, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], r, br);
      ask();
      if (i < pts.length) requestAnimationFrame(tick); else done();
    };
    requestAnimationFrame(tick);
  });

  const paintAll = async () => {
    firstStroke();
    await autoPaint(mctx, sweep(box.x - 10, box.y, box.w + 20, box.h, 7), brushR() * 2.4, 1400);
    if (step === 'paint') go('pig');
  };

  const placePig = async (x: number, y: number) => {
    if (!pigArt) pigArt = await img('/scroll/pig.webp');
    // the crane-winged pig (Ed's pick, round 9), 30% smaller than the first cut
    const w = Math.max(80, Math.min(W * 0.154, 196)), h = w * (pigArt.naturalHeight / pigArt.naturalWidth || 0.7);
    const topLimit = 8;
    pig = { x: Math.min(Math.max(8, x - w / 2), W - w - 8), y: Math.min(Math.max(topLimit, y - h / 2), H - h - 8), w, h };
    busy = true;
    paper.classList.remove('is-brush');
    await autoPaint(pmctx, sweep(pig.x - 6, pig.y + 4, pig.w + 12, pig.h - 8, 4), Math.max(16, pig.h * 0.32), 900);
    busy = false;
    go('seal');
  };

  // --- the seal ---
  let sealShown = false;
  const showSeal = (on: boolean) => {
    if (on === sealShown) return;
    sealShown = on;
    paper.classList.toggle('is-sealing', on);
    gsap.to(seal, on
      ? { opacity: 1, scale: 1, rotation: SEAL_TILT, duration: 0.6, ease: 'sine.out', overwrite: 'auto' }
      : { opacity: 0, scale: 0.88, rotation: SEAL_TILT - 12, duration: 0.3, ease: 'sine.in', overwrite: 'auto' });
  };
  gsap.set(seal, { opacity: 0, scale: 0.88, rotation: SEAL_TILT - 12, transformOrigin: `${SEAL_TIP.x * 100}% ${SEAL_TIP.y * 100}%` });
  // the brush: follows the pointer while painting (mouse and trackpad), leaning right, its tip on the paper
  let brushShown = false;
  const showBrush = (on: boolean) => {
    if (on === brushShown) return;
    brushShown = on;
    paper.classList.toggle('is-painting', on);
    // like the seal (Ed liked it): it swings in from a little off-upright and settles as it appears, and swings away
    gsap.to(brush, on
      ? { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: 'sine.out', overwrite: 'auto' }
      : { opacity: 0, scale: 0.88, rotation: -12, duration: 0.3, ease: 'sine.in', overwrite: 'auto' });
  };
  gsap.set(brush, { opacity: 0, scale: 0.88, rotation: -12, transformOrigin: `${BRUSH_TIP.x * 100}% ${BRUSH_TIP.y * 100}%` });
  // the brush and seal live on the scroll (above rods and mount), not the paper: paper coordinates are shifted by where
  // the paper sits on the scroll
  const onScroll = () => {
    const a = paper.getBoundingClientRect(), b = (brush.offsetParent ?? paper).getBoundingClientRect();
    return [a.left - b.left, a.top - b.top] as const;
  };
  const placeBrush = (px: number, py: number) => { const [ox, oy] = onScroll(); gsap.set(brush, { x: ox + px - brush.offsetWidth * BRUSH_TIP.x, y: oy + py - brush.offsetHeight * BRUSH_TIP.y }); };
  const placeSeal = (px: number, py: number) => { const [ox, oy] = onScroll(); gsap.set(seal, { x: ox + px - seal.offsetWidth * SEAL_TIP.x, y: oy + py - seal.offsetHeight * SEAL_TIP.y }); };
  const stamp = (px: number, py: number) => {
    const mark = tpl.content.firstElementChild!.cloneNode(true) as HTMLElement;
    mark.style.left = `${px}px`; mark.style.top = `${py}px`;
    gsap.set(mark, { xPercent: -50, yPercent: -50, rotation: gsap.utils.random(4, 12), opacity: 0 }); // tilted right, like the seal
    stamps.append(mark);
    go('done');
    if (reduce.matches) { gsap.set(mark, { opacity: 1 }); showSeal(false); return; }
    placeSeal(px, py);
    gsap.timeline()
      .set(seal, { opacity: 1, scale: 1, rotation: SEAL_TILT })
      .to(seal, { y: '+=10', scale: 0.94, duration: 0.12, ease: 'power2.in' })
      .fromTo(mark, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power2.out' }, '>-0.02')
      .to(seal, { y: '-=34', opacity: 0, duration: 0.45, ease: 'power2.out', onComplete: () => { sealShown = false; paper.classList.remove('is-sealing'); } }, '>+0.05');
  };

  // --- the pointer ---
  const local = (e: PointerEvent | MouseEvent) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] as const; };
  const paperXY = (e: PointerEvent | MouseEvent) => { const r = paper.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] as const; };
  let drawing = false, last: [number, number] = [0, 0], strokeBr = bristles();
  // a click only counts (pig, seal) when the pointer barely moved since it went down: the end of a brush stroke is not a click
  let downAt: [number, number] = [-1e9, -1e9];
  const onDown = (e: PointerEvent) => {
    downAt = [e.clientX, e.clientY];
    // painting carries on through the pig step, so a visitor who keeps going is never cut off
    if ((step !== 'paint' && step !== 'pig') || (e.target as Element).closest(UI)) return;
    drawing = true; strokeBr = bristles(); last = [...local(e)] as [number, number];
    firstStroke();
    gsap.to(brush, { scale: 0.94, rotation: -4, duration: 0.15, ease: 'power2.out' }); // the brush presses into the paper
    dab(mctx, last[0] - 0.5, last[1], last[0] + 0.5, last[1], brushR(), strokeBr); ask();
  };
  const onMove = (e: PointerEvent) => {
    if ((step === 'paint' || step === 'pig') && e.pointerType === 'mouse') {
      const over = !(e.target as Element).closest(UI) && !busy;
      if (over) { const [x, y] = paperXY(e); placeBrush(x, y); }
      showBrush(over);
    }
    if (step === 'seal' && e.pointerType === 'mouse') {
      const over = !(e.target as Element).closest(UI);
      if (over) { const [x, y] = paperXY(e); placeSeal(x, y); }
      showSeal(over && !!pig && !busy);
    }
    if (!drawing) return;
    const p = local(e);
    // fill in fast movements with steps, so the stroke never breaks up
    const d = Math.hypot(p[0] - last[0], p[1] - last[1]), n = Math.max(1, Math.ceil(d / 6));
    for (let i = 1; i <= n; i++) {
      const x = last[0] + ((p[0] - last[0]) * i) / n, y = last[1] + ((p[1] - last[1]) * i) / n;
      dab(mctx, last[0] + ((p[0] - last[0]) * (i - 1)) / n, last[1] + ((p[1] - last[1]) * (i - 1)) / n, x, y, brushR(), strokeBr);
    }
    last = [p[0], p[1]];
    ask();
  };
  const onUp = () => {
    if (!drawing) return;
    drawing = false;
    gsap.to(brush, { scale: 1, rotation: 0, duration: 0.25, ease: 'power2.out' });
    if (step === 'paint' && coverage() >= PAINTED_ENOUGH) go('pig');
  };
  const onClick = (e: MouseEvent) => {
    if ((e.target as Element).closest(UI) || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 8) return;
    if (step === 'pig' && !pig && !busy) { const [x, y] = local(e as PointerEvent); placePig(x, y); }
    else if (step === 'seal' && pig && sealShown) { const [x, y] = paperXY(e); stamp(x, y); }
  };
  const onLeave = () => { showSeal(false); showBrush(false); onUp(); };

  // --- buttons ---
  const reset = () => {
    for (const c of [mctx, pmctx]) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, mask.width, mask.height); c.restore(); }
    pig = null; started = false;
    stamps.replaceChildren();
    sketch.classList.remove('is-gone');
    showSeal(false);
    go('paint');
    ask();
  };
  const loadScene = async (i: number) => {
    scene = i;
    const s = SCENES[i];
    sketch.src = s.sketch;
    art = await img(s.src);
    btn('next').setAttribute('aria-label', `Next scene: ${SCENES[(i + 1) % SCENES.length].label}`);
    reset();
    layout();
  };
  const actions: Record<string, () => void> = {
    auto: () => { if (step === 'paint') paintAll(); },
    pig: () => { if (step === 'pig' && !pig) placePig(W * 0.3, H * 0.2); },
    seal: () => {
      if (step !== 'seal' || !pig) return;
      const r = canvas.getBoundingClientRect(), pr = paper.getBoundingClientRect();
      stamp(r.left - pr.left + W * 0.84, r.top - pr.top + H * 0.2);
    },
    reset,
    next: () => loadScene((scene + 1) % SCENES.length),
  };
  const onAction = (e: Event) => {
    const k = (e.target as Element).closest<HTMLElement>('[data-paint-action]')?.dataset.paintAction;
    if (k) actions[k]?.();
  };

  canvas.addEventListener('pointerdown', onDown);
  paper.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  paper.addEventListener('pointerleave', onLeave);
  paper.addEventListener('click', onClick);
  root.addEventListener('click', onAction);
  const ro = new ResizeObserver(layout);
  ro.observe(canvas);
  loadScene(0);

  return () => {
    canvas.removeEventListener('pointerdown', onDown);
    paper.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    paper.removeEventListener('pointerleave', onLeave);
    paper.removeEventListener('click', onClick);
    root.removeEventListener('click', onAction);
    ro.disconnect();
  };
}
