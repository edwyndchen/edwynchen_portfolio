import { describe, expect, it } from 'vitest';
import { DESCEND, ED_START } from '../../src/scripts/about-descend';

describe('About descent', () => {
  it('starts Ed hidden above the opening', () => {
    expect(ED_START.yPercent).toBeLessThan(-50);
    expect(ED_START.opacity).toBe(0);
  });
  it('walls part first, Ed descends while they part, then glides once he has landed', () => {
    const { part, descend, glide } = DESCEND.phases;
    expect(part[0]).toBe(0);
    expect(descend[0]).toBeGreaterThan(part[0]);
    expect(descend[0]).toBeLessThan(part[1]);
    expect(glide[0]).toBeGreaterThanOrEqual(descend[1]);
    expect(glide[1]).toBe(1);
  });
  it('pins longer on desktop than on phones', () => {
    expect(DESCEND.pin.desktop).toBeGreaterThan(DESCEND.pin.mobile);
  });
});

import { WIND, windFrequency } from '../../src/scripts/fabric-wind';
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
  it('breathes slowly: 8 to 12 second periods, x and y out of step', () => {
    for (const p of WIND.period) expect(p).toBeGreaterThanOrEqual(8), expect(p).toBeLessThanOrEqual(12);
    expect(WIND.period[0]).not.toBe(WIND.period[1]);
  });
  it('the filter is subtle: 2 octaves, displacement scale 6 to 10', () => {
    const src = readFileSync('src/components/About.astro', 'utf8');
    expect(src).toMatch(/numOctaves="2"/);
    const scale = Number(/feDisplacementMap[^>]*scale="(\d+(?:\.\d+)?)"/.exec(src)?.[1]);
    expect(scale).toBeGreaterThanOrEqual(6);
    expect(scale).toBeLessThanOrEqual(10);
  });
});
