import React from 'react';

/* Double-line ornamental frame (classic 回-style border, sharp corners):
   outer rule + a parallel inner rule. */
function DoubleFrame() {
  return (
    <span aria-hidden="true" style={{ position: 'absolute', inset: 6, border: '1px solid var(--card-frame-border)', pointerEvents: 'none' }} />
  );
}

/**
 * WorkCard — the signature portfolio card: an ornamental double-line cobalt
 * frame (sharp corners) over a porcelain body, with an eyebrow category, serif
 * title, and a "View Case Study →" affordance. Optional image / thumbnail slot.
 */
export function WorkCard({
  category, title, description, action = 'View Case Study',
  href = '#', media, framed = true, style = {}, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <a href={href} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', display: 'block', textDecoration: 'none',
        background: 'var(--card-bg)',
        border: framed ? '1.5px solid var(--card-border)' : '1px solid var(--card-border-quiet)',
        borderRadius: 'var(--card-radius)', padding: framed ? '30px 28px 24px' : '28px 26px 22px',
        boxShadow: hover ? 'var(--card-shadow-hover)' : 'var(--card-shadow)',
        transform: hover ? 'translateY(-3px)' : 'none',
        transition: 'transform var(--dur-med) var(--ease-entrance), box-shadow var(--dur-med) var(--ease-standard)',
        color: 'var(--card-title-fg)', ...style,
      }} {...rest}>
      {framed && <DoubleFrame />}
      {category && (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--card-eyebrow-fg)' }}>{category}</span>
      )}
      <h3 style={{ font: 'var(--type-h3)', color: 'var(--card-title-fg)', margin: '8px 0 6px' }}>{title}</h3>
      {description && (
        <p style={{ font: 'var(--type-body)', color: 'var(--card-body-fg)', margin: '0 0 18px', maxWidth: '32ch' }}>{description}</p>
      )}
      {media && (
        <div style={{ margin: '4px 0 18px', borderRadius: 'var(--radius-image)', overflow: 'hidden', background: 'var(--card-media-bg)' }}>{media}</div>
      )}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--card-action-fg)' }}>
        {action}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" aria-hidden="true" style={{ transform: hover ? 'translateX(3px)' : 'none', transition: 'transform var(--dur-med) var(--ease-standard)' }}>
          <path d="M2 12h13.622" /><path d="M14.056 17.296 22 12l-7.944-5.296L15.822 12l-1.766 5.296Z" />
        </svg>
      </span>
    </a>
  );
}
