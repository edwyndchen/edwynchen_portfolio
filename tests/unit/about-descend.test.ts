import { describe, expect, it } from 'vitest';
import { DESCEND, ED_START } from '../../src/scripts/about-descend';

describe('About descent', () => {
  it('starts Ed hidden, a little above his rest spot (inside the walls\' cover)', () => {
    expect(ED_START.yPercent).toBeLessThan(-20);
    expect(ED_START.yPercent).toBeGreaterThan(-50);
    expect(ED_START.opacity).toBe(1); // there from the start, behind the walls
  });
  it('walls part first, Ed descends while they part, then glides once he has landed', () => {
    const { part, descend, glide } = DESCEND.phases;
    expect(part[0]).toBe(0);
    expect(descend[0]).toBeGreaterThanOrEqual(part[0]);
    expect(descend[0]).toBeLessThan(part[1]);
    expect(glide[0]).toBeGreaterThanOrEqual(descend[1]);
    expect(glide[1]).toBe(1);
  });
  it('pins longer on desktop than on phones', () => {
    expect(DESCEND.pin.desktop).toBeGreaterThan(DESCEND.pin.mobile);
  });
});

import { WIND, windFrequency, windScale, stillnessMap } from '../../src/scripts/fabric-wind';
import { readFileSync } from 'node:fs';

describe('fabric wind', () => {
  it('stays low-frequency and positive through a whole breath (soft folds, never noise)', () => {
    for (let t = 0; t < 30; t += 0.25) {
      const [x, y] = windFrequency(t);
      expect(x).toBeGreaterThan(0);
      expect(y).toBeGreaterThan(0);
      expect(Math.max(x, y)).toBeLessThan(0.02);
    }
  });
  it('breathes, not flutters: 4 to 8 second periods, x, y and gusts all out of step', () => {
    for (const p of [...WIND.period, WIND.gust]) expect(p).toBeGreaterThanOrEqual(4), expect(p).toBeLessThanOrEqual(8);
    expect(new Set([...WIND.period, WIND.gust]).size).toBe(3);
  });
  it('the face and both hands never move; the torso holds most of the way', () => {
    const hold = (n: string) => WIND.still.find((s) => s.name === n)?.hold;
    for (const n of ['face', 'stylus hand', 'tablet hand']) expect(hold(n)).toBe(1);
    expect(hold('torso')).toBeGreaterThanOrEqual(0.6);
    expect(hold('torso')).toBeLessThan(1);
  });
  it('paints the stillness map: white page, one feathered spot per held part, black at full hold', () => {
    const svg = decodeURIComponent(stillnessMap().replace('data:image/svg+xml,', ''));
    expect(svg).toContain('fill="#fff"');
    expect(svg.match(/<ellipse/g)).toHaveLength(WIND.still.length);
    expect(svg).toContain('rgb(0,0,0)');
    expect(svg).toContain('stop-opacity="0"');
  });
  it('gusts stay a ripple, never a warp: displacement 6 to 20px', () => {
    for (let t = 0; t < 30; t += 0.25) expect(windScale(t)).toBeGreaterThanOrEqual(6), expect(windScale(t)).toBeLessThanOrEqual(20);
  });
  it('the filter starts where the gusts rest: 2 octaves, scale equal to the resting displacement', () => {
    const src = readFileSync('src/components/About.astro', 'utf8');
    expect(src).toMatch(/numOctaves="2"/);
    const scale = Number(/feDisplacementMap[^>]*scale="(\d+(?:\.\d+)?)"/.exec(src)?.[1]);
    expect(scale).toBe(WIND.scale[0]);
  });
});

import { existsSync } from 'node:fs';
import { nextOutfit, PUFF_LAYOUT, PUFF_SWAP, PUFF_CLEAR, PUFF_REVEAL } from '../../src/scripts/outfit-swap';
import { OUTFIT_MAP } from '../../src/scripts/fabric-wind';
describe('costume change', () => {
  it('goes hanfu, Pig, Aquarius and round again', () => {
    expect(nextOutfit('hanfu')).toBe('pig');
    expect(nextOutfit('pig')).toBe('water');
    expect(nextOutfit('water')).toBe('hanfu');
  });
  it('changes clothes only once every cloud has landed, and before any start to clear', () => {
    const lastLands = (PUFF_LAYOUT.length - 1) * 0.01 + 0.3;
    expect(PUFF_SWAP).toBeGreaterThanOrEqual(lastLands);
    expect(PUFF_CLEAR).toBeGreaterThan(PUFF_SWAP);
  });
  it('brings the new outfit back only as the clouds thin away, never through dense cloud', () => {
    expect(PUFF_REVEAL).toBeGreaterThanOrEqual(PUFF_CLEAR + 0.3);
    expect(PUFF_REVEAL + 0.35).toBeLessThanOrEqual(PUFF_CLEAR + 0.8 + 0.2); // done by the time the last billow fades
  });
  it('covers the figure head to feet and sleeve to sleeve', () => {
    const ys = PUFF_LAYOUT.map(([, y]) => y), xs = PUFF_LAYOUT.map(([x]) => x);
    expect(Math.min(...ys)).toBeLessThanOrEqual(-0.35);
    expect(Math.max(...ys)).toBeGreaterThanOrEqual(0.35);
    expect(Math.min(...xs)).toBeLessThanOrEqual(-0.24);
    expect(Math.max(...xs)).toBeGreaterThanOrEqual(0.24);
  });
  it('has a wind map on disk for every painted-map outfit', () => {
    for (const src of Object.values(OUTFIT_MAP)) expect(existsSync(`public${src}`)).toBe(true);
  });
});

import { flowCopies, FLOW_PERIOD } from '../../src/scripts/fabric-wind';
describe('flowing water', () => {
  it('cross-fades two copies that always add up to one, each fading out as it wraps', () => {
    for (let t = 0; t < 30; t += 0.37) {
      const [a, b] = flowCopies(t, 31);
      expect(a.weight + b.weight).toBeCloseTo(1, 6);
      expect(a.shift).toBeGreaterThanOrEqual(0); expect(a.shift).toBeLessThan(FLOW_PERIOD);
    }
    expect(flowCopies(0, 31)[0].weight).toBe(0); // at the wrap point the copy is invisible
  });
});
