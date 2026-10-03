import React from 'react';

/**
 * Blockquote — a large serif-italic pull quote in the exhibition voice, with an
 * optional attribution and a leading seal-red tick.
 */
export function Blockquote({ children, cite, tone = 'default', size = 'md', style = {}, ...rest }) {
  const color = tone === 'invert' ? 'var(--quote-fg-invert)' : 'var(--quote-fg)';
  const dim = tone === 'invert' ? 'var(--quote-cite-fg-invert)' : 'var(--quote-cite-fg)';
  const sizes = { sm: 'var(--text-display-sm)', md: 'var(--text-display-md)', lg: 'var(--text-display-lg)' };
  return (
    <figure style={{ margin: 0, ...style }} {...rest}>
      <span aria-hidden="true" style={{ display: 'block', font: `500 ${'var(--text-display-lg)'} var(--quote-font)`, color: 'var(--quote-mark-fg)', lineHeight: 0.6, height: '0.5em' }}>“</span>
      <blockquote style={{
        margin: '10px 0 0', fontFamily: 'var(--quote-font)', fontStyle: 'italic',
        fontWeight: 'var(--fw-medium)', fontSize: sizes[size], lineHeight: 'var(--lh-snug)',
        color, letterSpacing: 'var(--ls-display)', textWrap: 'balance',
      }}>{children}</blockquote>
      {cite && <figcaption style={{ marginTop: '16px', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', letterSpacing: 'var(--ls-caps)', textTransform: 'uppercase', color: dim }}>{cite}</figcaption>}
    </figure>
  );
}
