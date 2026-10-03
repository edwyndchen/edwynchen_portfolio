import React from 'react';

/**
 * Button — the porcelain-system action. Cobalt is primary; seal red is a rare
 * emphasis; secondary/ghost are quiet outlines. Calm press (1px settle), no bounce.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  iconRight,
  arrow = false,
  disabled = false,
  onClick,
  type = 'button',
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { padding: '8px 16px', font: 'var(--text-sm)' },
    md: { padding: '12px 24px', font: 'var(--text-sm)' },
    lg: { padding: '15px 32px', font: 'var(--text-md)' },
  };
  const s = sizes[size] || sizes.md;

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '44px',
    boxSizing: 'border-box',
    gap: '10px',
    fontFamily: 'var(--button-font)',
    fontWeight: 'var(--button-weight)',
    fontSize: s.font,
    letterSpacing: '0.02em',
    lineHeight: 1,
    padding: s.padding,
    borderRadius: 'var(--button-radius)',
    border: '1.5px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    transition: 'background var(--dur-med) var(--ease-standard), color var(--dur-med) var(--ease-standard), border-color var(--dur-med) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)',
    opacity: disabled ? 0.45 : 1,
    WebkitFontSmoothing: 'antialiased',
    ...style,
  };

  const variants = {
    primary: { background: 'var(--button-primary-bg)', color: 'var(--button-primary-fg)' },
    secondary: { background: 'transparent', color: 'var(--button-secondary-fg)', borderColor: 'var(--button-secondary-border)' },
    ghost: { background: 'transparent', color: 'var(--button-ghost-fg)' },
    seal: { background: 'var(--button-seal-bg)', color: 'var(--button-seal-fg)' },
    inverse: { background: 'var(--button-inverse-bg)', color: 'var(--button-inverse-fg)' },
  };

  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);

  const hoverStyle = !disabled && hover ? {
    primary: { background: 'var(--button-primary-bg-hover)' },
    secondary: { background: 'var(--button-secondary-bg-hover)', borderColor: 'var(--button-secondary-border-hover)' },
    ghost: { background: 'var(--button-ghost-bg-hover)' },
    seal: { background: 'var(--button-seal-bg-hover)' },
    inverse: { background: 'var(--button-inverse-bg-hover)' },
  }[variant] : {};

  const finalStyle = {
    ...base,
    ...variants[variant],
    ...hoverStyle,
    transform: !disabled && press ? 'translateY(1px)' : 'translateY(0)',
  };

  const Arrow = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" aria-hidden="true"
      style={{ transition: 'transform var(--dur-med) var(--ease-standard)', transform: hover ? 'translateX(3px)' : 'none' }}>
      <path d="M2 12h13.622" /><path d="M14.056 17.296 22 12l-7.944-5.296L15.822 12l-1.766 5.296Z" />
    </svg>
  );

  const content = <>{children}{arrow && Arrow}{iconRight}</>;
  const handlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => { setHover(false); setPress(false); },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
  };

  if (href && !disabled) {
    return <a href={href} style={finalStyle} onClick={onClick} {...handlers} {...rest}>{content}</a>;
  }
  return (
    <button type={type} style={finalStyle} disabled={disabled} onClick={onClick} {...handlers} {...rest}>
      {content}
    </button>
  );
}
