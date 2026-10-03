import * as React from 'react';

export interface MotifDividerProps {
  tone?: 'brand' | 'invert';
  /** Optional centered label between the medallion motifs. */
  label?: string;
  style?: React.CSSProperties;
}

/** Centered ornamental section divider using the porcelain medallion motif. */
export function MotifDivider(props: MotifDividerProps): JSX.Element;
