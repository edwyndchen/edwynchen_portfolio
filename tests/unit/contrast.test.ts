import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { contrastRatio, readTokens, resolveToken } from '../../src/lib/contrast';

describe('contrastRatio', () => {
  test('black on white is 21', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
  });
  test('is symmetric', () => {
    expect(contrastRatio('#3231b0', '#FAF8F2')).toBeCloseTo(contrastRatio('#FAF8F2', '#3231b0'), 5);
  });
});

describe('design tokens', () => {
  // DS primitives and semantics first, site aliases last (same order as the @imports)
  const css = ['tokens/colors.css', 'tokens/typography.css', 'tokens/spacing.css', 'tokens.css']
    .map((f) => readFileSync(`src/styles/${f}`, 'utf8'))
    .join('\n');
  const tokens = readTokens(css);
  const hex = (name: string) => resolveToken(tokens, name);

  test('site aliases resolve to the DS colours', () => {
    expect(hex('porcelain').toLowerCase()).toBe('#faf8f2');
    expect(hex('ink').toLowerCase()).toBe('#1b1c1a');
    expect(hex('cobalt').toLowerCase()).toBe('#3231b0');
    for (const name of ['cobalt-ink', 'cobalt-wash', 'wattle-gold', 'gold-text']) {
      expect(hex(name), name).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  // the text/ground pairs the site actually uses
  test.each([
    ['text-primary', 'surface-page'],
    ['text-brand', 'surface-page'],
    ['text-gold', 'surface-page'],
    ['text-secondary', 'surface-page'],
    ['text-secondary', 'surface-raised'],
    ['text-brand', 'surface-raised'],
    ['text-on-invert', 'surface-invert'],
    ['text-invert-dim', 'surface-invert'],
  ])('%s on %s passes AA', (fg, bg) => {
    expect(contrastRatio(hex(fg), hex(bg))).toBeGreaterThanOrEqual(4.5);
  });
});
