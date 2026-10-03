import React from 'react';

/**
 * CaseStudyFrame — the hand-scroll (卷轴) frame used to present case-study
 * cover imagery. The scroll art is the background "frame"; your image/media
 * sits within the scroll's inner writable area, exactly as a mounted painting.
 */
export function CaseStudyFrame({
  src = 'assets/scroll-frame.png', image, alt = '', placeholder = 'Case study image',
  ratio = '1200 / 620', children, style = {}, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', width: '100%', aspectRatio: ratio, ...style }} {...rest}>
      <img src={src} alt="" aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none',
          filter: hover
            ? 'drop-shadow(0 18px 22px rgba(38,32,24,0.28))'
            : 'drop-shadow(0 10px 14px rgba(38,32,24,0.18))',
          transition: 'filter 0.4s ease' }} />
      <div style={{
        position: 'absolute', inset: '17% 9.5%',
        overflow: 'hidden',
        background: 'transparent',
      }}>
        {image ? (
          <img src={image} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            transform: hover ? 'scale(1.06)' : 'scale(1)',
            filter: hover ? 'saturate(1.08) brightness(1.03)' : 'none',
            transition: 'transform 0.5s cubic-bezier(.2,.7,.2,1), filter 0.4s ease' }} />
        ) : children ? children : (
          <div style={{
            width: '100%', height: '100%', display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
            fontWeight: 'var(--fw-medium)', letterSpacing: '0.02em',
            color: 'var(--frame-placeholder-fg)',
          }}>{placeholder}</div>
        )}
      </div>
    </div>
  );
}
