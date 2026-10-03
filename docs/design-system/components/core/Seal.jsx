import React from 'react';

/**
 * Seal — the intaglio chop (印章): an outlined square holding 1–4 Chinese
 * characters in the same colour as the outline. A signature mark beside
 * headlines and in card corners.
 */
export function Seal({ characters = '观然', size = 64, tone = 'seal', style = {}, ...rest }) {
  const chars = Array.isArray(characters) ? characters : String(characters).split('');
  const color = tone === 'seal' ? 'var(--seal-fg-seal)' : tone === 'ink' ? 'var(--seal-fg-ink)' : 'var(--seal-fg-brand)';
  const oneCol = chars.length <= 2;
  const fs = size * 0.82;              // large glyphs that fill the chop
  const pad = size * 0.16;             // shape wraps snugly around the text
  return (
    <span style={{
      display: 'inline-grid',
      gridTemplateColumns: oneCol ? '1fr' : '1fr 1fr',
      gridAutoRows: `${fs}px`,
      placeItems: 'center',
      width: 'fit-content', height: 'fit-content',
      background: 'transparent', color,
      border: `${Math.max(1.5, size * 0.03)}px solid ${color}`,
      fontFamily: 'var(--seal-font)', fontWeight: 400,
      fontSize: fs, lineHeight: 1, letterSpacing: 0,
      borderRadius: 'var(--seal-radius)',
      padding: `${pad}px ${oneCol ? pad * 0.9 : pad}px`,
      columnGap: size * 0.08, rowGap: size * 0.06,
      ...style,
    }} role="img" aria-label="seal" {...rest}>
      {chars.slice(0, 4).map((c, i) => (
        <span key={i} style={{ display: 'grid', placeItems: 'center', width: fs, height: fs }}>{c}</span>
      ))}
    </span>
  );
}
