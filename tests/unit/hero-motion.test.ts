import { describe, expect, test } from 'vitest';
import { cloudDuration, collapsePercent, parallaxOffset, scrollShift, spreadPercent } from '../../src/scripts/hero-motion';

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
  test('slow: every crossing takes at least a minute', () => {
    for (const d of [0.04, 0.12, 0.35, 1]) for (const i of [0, 1, 2]) expect(cloudDuration(d, i)).toBeGreaterThanOrEqual(60);
  });
  test('20% faster than the first cut', () => expect(cloudDuration(0.5, 0)).toBeCloseTo((200 - 55) / 1.2));
});

describe('spreadPercent', () => {
  test('Melbourne layer (depth 0.5) stays anchored', () => expect(spreadPercent(0.5)).toBe(0));
  test('layers behind Melbourne start higher (spread up)', () => expect(spreadPercent(0.04)).toBeLessThan(0));
  test('layers in front start lower (spread down)', () => expect(spreadPercent(1)).toBeGreaterThan(0));
  test('increases monotonically with depth', () => {
    const ds = [0.04, 0.12, 0.35, 0.5, 1];
    for (let i = 1; i < ds.length; i++) expect(spreadPercent(ds[i])).toBeGreaterThan(spreadPercent(ds[i - 1]));
  });
  test('k scales the spread', () => {
    expect(spreadPercent(0.04, 60)).toBeCloseTo(spreadPercent(0.04, 30) * 2, 1);
    expect(Math.abs(spreadPercent(0.04, 16))).toBeLessThan(Math.abs(spreadPercent(0.04, 30)));
  });
  test('rounded to 2dp', () => expect(spreadPercent(0.04)).toBe(-13.8));
});

describe('collapsePercent', () => {
  test('Melbourne layer stays anchored', () => expect(collapsePercent(0.5)).toBe(0));
  test('collapses the opposite way to the spread: back layers settle lower, front higher', () => {
    expect(collapsePercent(0.04)).toBeGreaterThan(0);
    expect(collapsePercent(1)).toBeLessThan(0);
  });
  test('is gentler than the spread', () => expect(Math.abs(collapsePercent(0.04))).toBeLessThan(Math.abs(spreadPercent(0.04))));
});
