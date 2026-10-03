import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { contrastRatio, readTokens } from '../../src/lib/contrast';

describe('contrastRatio', () => {
  test('black on white is 21', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
  });
  test('is symmetric', () => {
    expect(contrastRatio('#142B6F', '#FBFAF7')).toBeCloseTo(contrastRatio('#FBFAF7', '#142B6F'), 5);
  });
});

describe('design tokens', () => {
  const tokens = readTokens(readFileSync('src/styles/tokens.css', 'utf8'));

  test('all six palette tokens exist', () => {
    for (const name of ['porcelain', 'cobalt-ink', 'cobalt', 'cobalt-wash', 'wattle-gold', 'gold-text']) {
      expect(tokens[name], name).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  test.each(['cobalt-ink', 'cobalt', 'gold-text'])('%s text on porcelain passes AA', (name) => {
    expect(contrastRatio(tokens[name], tokens.porcelain)).toBeGreaterThanOrEqual(4.5);
  });

  test('porcelain text on cobalt-ink passes AA', () => {
    expect(contrastRatio(tokens.porcelain, tokens['cobalt-ink'])).toBeGreaterThanOrEqual(4.5);
  });
});
