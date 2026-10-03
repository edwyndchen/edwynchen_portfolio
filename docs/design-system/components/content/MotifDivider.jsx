import React from 'react';

/**
 * MotifDivider — a centered ornamental section divider using the porcelain
 * medallion motif flanked by hairline rules. Quiet punctuation between sections.
 */
export function MotifDivider({ tone = 'brand', label, style = {}, ...rest }) {
  const color = tone === 'invert' ? 'var(--divider-fg-invert)' : 'var(--divider-fg)';
  const rule = tone === 'invert' ? 'var(--divider-rule-invert)' : 'var(--divider-rule)';
  const Medallion = (
    <svg width="22" height="22" viewBox="0 0 160 160" fill="none" aria-hidden="true" style={{ color, flex: '0 0 auto' }}>
      <path d="M74.8232 54.8232H36.5137C40.9046 47.2328 47.2328 40.9036 54.8232 36.5127V44.8232H64.8232V21.7129C43.739 27.1395 27.1395 43.739 21.7129 64.8232H74.8232V74.8232H10C12.4472 40.1484 40.1484 12.4472 74.8232 10V54.8232Z" fill="currentColor"/>
      <path d="M74.8232 104.823H36.5137C40.9046 112.414 47.2328 118.743 54.8232 123.134V114.823H64.8232V137.934C43.739 132.507 27.1395 115.907 21.7129 94.8232H74.8232V84.8232H10C12.4472 119.498 40.1484 147.199 74.8232 149.646V104.823Z" fill="currentColor"/>
      <path d="M84.8232 54.8232H123.133C118.742 47.2328 112.414 40.9036 104.823 36.5127V44.8232H94.8232V21.7129C115.907 27.1395 132.507 43.739 137.934 64.8232H84.8232V74.8232H149.646C147.199 40.1484 119.498 12.4472 84.8232 10V54.8232Z" fill="currentColor"/>
      <path d="M84.8232 104.823H123.133C118.742 112.414 112.414 118.743 104.823 123.134V114.823H94.8232V137.934C115.907 132.507 132.507 115.907 137.934 94.8232H84.8232V84.8232H149.646C147.199 119.498 119.498 147.199 84.8232 149.646V104.823Z" fill="currentColor"/>
    </svg>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '18px', width: '100%', ...style }} {...rest}>
      <span style={{ flex: 1, height: 1, background: rule }} />
      {label
        ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label)', fontWeight: 'var(--fw-semibold)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color }}>{Medallion}{label}{Medallion}</span>
        : Medallion}
      <span style={{ flex: 1, height: 1, background: rule }} />
    </div>
  );
}
