import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { webpSize } from '../../src/lib/image-size';

describe('webpSize', () => {
  it('reads an extended (alpha) WebP', () => {
    expect(webpSize(readFileSync('public/hero/cloud-n2.webp'))).toEqual({ width: 1100, height: 534 });
  });
  it('reads the portrait whatever its current size', () => {
    const s = webpSize(readFileSync('public/images/ed-porcelain.webp'));
    expect(s.width).toBeGreaterThan(100);
    expect(s.height).toBeGreaterThan(100);
  });
  it('rejects non-WebP data', () => {
    expect(() => webpSize(Buffer.from('not an image at all, honestly'))).toThrow();
  });
});
