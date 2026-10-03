import { describe, expect, test } from 'vitest';
import { cloudDuration, parallaxOffset, scrollShift } from '../../src/scripts/hero-motion';

describe('parallaxOffset', () => {
  test('centre pointer gives no offset', () => expect(parallaxOffset(0, 0.5)).toBe(0));
  test('scales with depth and pointer', () => {
    expect(parallaxOffset(1, 0.5, 28)).toBe(14);
    expect(parallaxOffset(-1, 0.25, 28)).toBe(-7);
  });
  test('clamps pointer to -1..1', () => {
    expect(parallaxOffset(5, 1, 28)).toBe(28);
    expect(parallaxOffset(-5, 1, 28)).toBe(-28);
  });
});

describe('scrollShift', () => {
  test('far layer (factor 0) does not move', () => expect(scrollShift(0)).toBe(0));
  test('front layers move further than back layers', () => expect(Math.abs(scrollShift(1.1))).toBeGreaterThan(Math.abs(scrollShift(0.3))));
  test('moves upward (negative yPercent)', () => expect(scrollShift(0.5)).toBe(-5));
});

describe('cloudDuration', () => {
  test('back clouds are slower than front clouds', () => expect(cloudDuration(0.04, 0)).toBeGreaterThan(cloudDuration(1, 0)));
  test('very slow: every crossing takes at least 80 seconds', () => {
    for (const d of [0.04, 0.12, 0.35, 1]) for (const i of [0, 1, 2]) expect(cloudDuration(d, i)).toBeGreaterThanOrEqual(80);
  });
});
