import * as React from 'react';

export interface BlockquoteProps {
  children: React.ReactNode;
  /** Attribution line (rendered uppercase). */
  cite?: string;
  tone?: 'default' | 'invert';
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

/** Large serif-italic pull quote in the exhibition voice, with seal-red quote tick. */
export function Blockquote(props: BlockquoteProps): JSX.Element;
