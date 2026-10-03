import React from 'react';

/**
 * Badge — a small status/category marker. `pill` (rounded outline chip) or
 * `tag` (square hairline). Cobalt by default, seal for emphasis, celadon rare.
 */
export function Badge({ children, tone = 'cobalt', variant = 'pill', style = {}, ...rest }) {
  const tones = {
    cobalt: { color: 'var(--badge-cobalt-fg)', border: 'var(--badge-cobalt-border)', bg: 'var(--badge-cobalt-bg)' },
    seal: { color: 'var(--badge-seal-fg)', border: 'var(--badge-seal-border)', bg: 'var(--badge-seal-bg)' },
    celadon: { color: 'var(--badge-celadon-fg)', border: 'var(--badge-celadon-border)', bg: 'var(--badge-celadon-bg)' },
    neutral: { color: 'var(--badge-neutral-fg)', border: 'var(--badge-neutral-border)', bg: 'var(--badge-neutral-bg)' },
  };
  const t = tones[tone] || tones.cobalt;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)',
      letterSpacing: 'var(--ls-caps)', textTransform: 'uppercase', lineHeight: 1,
      padding: '5px 11px', color: t.color, background: t.bg,
      border: `1px solid ${t.border}`,
      borderRadius: variant === 'pill' ? 'var(--badge-radius-pill)' : 'var(--badge-radius-tag)',
      ...style,
    }} {...rest}>{children}</span>
  );
}
