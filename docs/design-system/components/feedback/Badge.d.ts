import * as React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  tone?: 'cobalt' | 'seal' | 'celadon' | 'neutral';
  variant?: 'pill' | 'tag';
  style?: React.CSSProperties;
}

/** Small uppercase category / status marker. */
export function Badge(props: BadgeProps): JSX.Element;
