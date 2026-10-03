function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(n.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Custom properties whose value is a hex colour or a single var() alias, e.g. { 'blue-700': '#2b4c86', 'text-brand': 'var(--blue-700)' } */
export function readTokens(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of css.matchAll(/--([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6}|var\(--[a-z0-9-]+\))\s*;/g)) out[m[1]] = m[2];
  return out;
}

/** Follows var() aliases down to a hex value. Throws if the chain is broken. */
export function resolveToken(tokens: Record<string, string>, name: string): string {
  let value = tokens[name];
  for (let hops = 0; value?.startsWith('var('); hops++) {
    if (hops > 10) throw new Error(`alias loop at --${name}`);
    value = tokens[value.slice(6, -1)];
  }
  if (!value) throw new Error(`--${name} does not resolve to a colour`);
  return value;
}
