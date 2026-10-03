import React from 'react';

/**
 * RevealImage — the porcelain gallery tile. Shows a media slot; on hover a
 * slow ink-blue overlay fades in with the caption.
 * Pass `src` for a background image, or `children` for any media node.
 */
export function RevealImage({
  src, alt = '', title, caption,
  ratio = '4 / 3', tone = 'light', children, style = {}, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const dark = tone === 'dark';
  return (
    <figure onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', margin: 0, overflow: 'hidden',
        borderRadius: 'var(--reveal-radius)', aspectRatio: ratio,
        background: dark ? 'var(--reveal-bg-dark)' : 'var(--reveal-bg)',
        boxShadow: 'var(--reveal-shadow)', cursor: 'pointer',
        ...style,
      }} {...rest}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: src ? `url(${src})` : undefined,
        backgroundSize: 'cover', backgroundPosition: 'center',
        transform: hover ? 'scale(1.04)' : 'scale(1)',
        transition: 'transform var(--dur-slow) var(--ease-entrance)',
      }} role={src ? 'img' : undefined} aria-label={src ? alt : undefined}>{children}</div>

      {/* protection gradient + reveal overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(22,35,63,0.55), rgba(22,35,63,0) 55%)',
        opacity: hover ? 1 : 0.85, transition: 'opacity var(--dur-med) var(--ease-standard)',
      }} />

      {(title || caption) && (
        <figcaption style={{
          position: 'absolute', left: 16, bottom: 16, right: 16, color: 'var(--reveal-caption-fg)',
          opacity: hover ? 1 : 0, transform: hover ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity var(--dur-med) var(--ease-standard), transform var(--dur-med) var(--ease-entrance)',
        }}>
          {title && <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-medium)', fontSize: 'var(--text-2xl)', lineHeight: 1.15 }}>{title}</div>}
          {caption && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--reveal-caption-sub-fg)', marginTop: 4 }}>{caption}</div>}
        </figcaption>
      )}
    </figure>
  );
}
