/** Pixel size of a WebP from its header (VP8X, lossy VP8 or lossless VP8L), so markup always matches the file on disk. */
export function webpSize(buf: Uint8Array): { width: number; height: number } {
  const tag = (o: number, n: number) => String.fromCharCode(...buf.subarray(o, o + n));
  if (buf.length < 30 || tag(0, 4) !== 'RIFF' || tag(8, 4) !== 'WEBP') throw new Error('not a WebP');
  const u24 = (o: number) => buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16);
  const u16 = (o: number) => buf[o] | (buf[o + 1] << 8);
  switch (tag(12, 4)) {
    case 'VP8X':
      return { width: u24(24) + 1, height: u24(27) + 1 };
    case 'VP8 ':
      return { width: u16(26) & 0x3fff, height: u16(28) & 0x3fff };
    case 'VP8L': {
      const b = buf[21] | (buf[22] << 8) | (buf[23] << 16) | (buf[24] << 24);
      return { width: (b & 0x3fff) + 1, height: ((b >>> 14) & 0x3fff) + 1 };
    }
    default:
      throw new Error('unknown WebP chunk');
  }
}
