import * as React from 'react';

export interface SealProps {
  /** 1–4 characters, as a string ("观然") or array. */
  characters?: string | string[];
  size?: number;
  tone?: 'seal' | 'ink' | 'cobalt';
  style?: React.CSSProperties;
}

/** Red intaglio chop (印章) — a signature stamp of 1–4 Chinese characters. */
export function Seal(props: SealProps): JSX.Element;
