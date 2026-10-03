import { describe, expect, it } from 'vitest';
import { flightStart, TOWER_START } from '../../src/scripts/about-rise';
import { PASSAGE } from '../../src/scripts/cloud-passage';

describe('About fly-in', () => {
  it('starts Ed hidden to the right, travelling less on phones', () => {
    expect(flightStart(true)).toEqual({ xPercent: 55, yPercent: 6, rotation: 3, opacity: 0 });
    expect(flightStart(false).xPercent).toBe(35);
  });
  it('starts the tower left of its rest spot so it drifts right out of his way', () => {
    expect(TOWER_START.xPercent).toBeLessThan(0);
  });
});

describe('cloud passage drift', () => {
  it('banks drift in opposite directions and the near bank moves further (parallax)', () => {
    const dir = (r: readonly number[]) => Math.sign(r[1] - r[0]);
    const span = (r: readonly number[]) => Math.abs(r[1] - r[0]);
    expect(dir(PASSAGE.far.xPercent)).toBe(-dir(PASSAGE.near.xPercent));
    expect(span(PASSAGE.near.yPercent)).toBeGreaterThan(span(PASSAGE.far.yPercent));
  });
  it('small puffs drift left to right, the way their tails trail', () => {
    expect(PASSAGE.puff.xPercent[1]).toBeGreaterThan(PASSAGE.puff.xPercent[0]);
  });
});
