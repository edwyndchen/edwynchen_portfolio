import * as React from 'react';

export interface EyebrowProps {
  children: React.ReactNode;
  tone?: 'brand' | 'muted' | 'invert' | 'seal';
  /** Show a short leading hairline rule. */
  rule?: boolean;
  align?: 'left' | 'center';
  style?: React.CSSProperties;
}

/** Letterspaced uppercase section label that sits above headlines. */
export function Eyebrow(props: EyebrowProps): JSX.Element;
