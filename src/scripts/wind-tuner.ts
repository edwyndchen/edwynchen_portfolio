import { WIND } from './fabric-wind';

/**
 * Dev-only sliders for the fabric wind: `npm run dev`, open /?wind, scroll to About. Every slider edits WIND live;
 * "Copy settings" puts the values on the clipboard to paste back into fabric-wind.ts (or send to Claude).
 * Never bundled into a production build (About.astro only imports it behind import.meta.env.DEV).
 */
export function mountWindTuner(): void {
  const panel = document.createElement('div');
  panel.setAttribute('role', 'group');
  panel.setAttribute('aria-label', 'Wind tuner');
  panel.style.cssText =
    'position:fixed;z-index:9999;right:12px;bottom:12px;width:min(300px,calc(100vw - 24px));max-height:80vh;overflow:auto;' +
    'background:#fff;border:1px solid #c9d3e6;border-radius:8px;padding:12px 14px;font:12px/1.4 Manrope,system-ui,sans-serif;' +
    'color:#1f3a73;box-shadow:0 6px 24px rgba(20,40,90,.15)';

  // each control: label, range, read value, write value (reads/writes WIND directly, so the running wind picks it up)
  const torso = WIND.still.find((s) => s.name === 'torso');
  const breath0 = [...WIND.period];
  const controls: [string, number, number, number, () => number, (v: number) => void][] = [
    ['Strength (px)', 0, 24, 0.5, () => WIND.scale[0], (v) => (WIND.scale[0] = v)],
    ['Gusts (± px)', 0, 12, 0.5, () => WIND.scale[1], (v) => (WIND.scale[1] = v)],
    ['Fold size (smaller = broader)', 0.002, 0.02, 0.0005, () => WIND.base[1], (v) => { WIND.base[0] = +(v * 0.55).toFixed(4); WIND.base[1] = v; }],
    ['Fold drift', 0, 0.008, 0.0002, () => WIND.swing[1], (v) => { WIND.swing[0] = +(v * 0.73).toFixed(4); WIND.swing[1] = v; }],
    ['Speed (×)', 0.3, 3, 0.05, () => breath0[0] / WIND.period[0], (v) => { WIND.period[0] = +(breath0[0] / v).toFixed(2); WIND.period[1] = +(breath0[1] / v).toFixed(2); }],
  ];
  if (torso) controls.push(['Torso stillness (%)', 0, 100, 5, () => Math.round(torso.hold * 100), (v) => { torso.hold = v / 100; window.dispatchEvent(new Event('wind:retune')); }]);

  const title = document.createElement('strong');
  title.textContent = 'Wind tuner';
  title.style.cssText = 'display:block;margin-bottom:8px;font-size:13px';
  panel.append(title);
  for (const [label, min, max, step, get, set] of controls) {
    const row = document.createElement('label');
    row.style.cssText = 'display:block;margin-bottom:8px';
    const name = document.createElement('span');
    const out = document.createElement('output');
    out.style.cssText = 'float:right;font-variant-numeric:tabular-nums';
    name.textContent = label;
    const input = document.createElement('input');
    Object.assign(input, { type: 'range', min: String(min), max: String(max), step: String(step), value: String(get()) });
    input.style.cssText = 'display:block;width:100%';
    out.value = String(get());
    input.addEventListener('input', () => { set(Number(input.value)); out.value = String(+get().toFixed(4)); });
    row.append(name, out, input);
    panel.append(row);
  }
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.textContent = 'Copy settings';
  copy.style.cssText = 'margin-top:4px;padding:6px 10px;border:1px solid #1f3a73;border-radius:6px;background:#fff;color:#1f3a73;cursor:pointer';
  copy.addEventListener('click', async () => {
    const { fps: _fps, ...rest } = WIND;
    try {
      await navigator.clipboard.writeText(JSON.stringify(rest, null, 2));
      copy.textContent = 'Copied';
    } catch {
      copy.textContent = 'Copy failed: see console';
      console.log(JSON.stringify(rest, null, 2));
    }
    setTimeout(() => (copy.textContent = 'Copy settings'), 1500);
  });
  panel.append(copy);
  document.body.append(panel);
}
