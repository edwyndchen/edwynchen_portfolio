import React from 'react';

/**
 * Eyebrow — the letterspaced uppercase label that sits above headlines
 * (DIGITAL DESIGNER, SELECTED WORK). Optional leading rule or seal dot.
 */
export function Eyebrow({ children, tone = 'brand', rule = false, align = 'left', style = {}, ...rest }) {
  const color = { brand: 'var(--eyebrow-fg-brand)', muted: 'var(--eyebrow-fg-muted)', invert: 'var(--eyebrow-fg-invert)', seal: 'var(--eyebrow-fg-seal)' }[tone] || 'var(--eyebrow-fg-brand)';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '12px',
      fontFamily: 'var(--eyebrow-font)', fontSize: 'var(--eyebrow-size)', fontWeight: 'var(--eyebrow-weight)',
      letterSpacing: 'var(--eyebrow-tracking)', textTransform: 'uppercase', color,
      justifyContent: align === 'center' ? 'center' : 'flex-start', ...style,
    }} {...rest}>
      {rule && <span aria-hidden="true" style={{ width: '28px', height: '1px', background: 'currentColor', opacity: 0.5 }} />}
      {children}
    </span>
  );
}
