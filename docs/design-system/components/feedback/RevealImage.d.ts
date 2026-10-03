import * as React from 'react';

export interface RevealImageProps {
  /** Background image URL. Omit and pass `children` for a custom media node. */
  src?: string;
  alt?: string;
  /** Title revealed on hover (serif). */
  title?: string;
  /** Sub-caption revealed on hover. */
  caption?: string;
  /** CSS aspect-ratio, e.g. "4 / 3" or "1 / 1". */
  ratio?: string;
  tone?: 'light' | 'dark';
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Porcelain gallery tile with a slow hover-reveal caption overlay.
 * @startingPoint section="Content" subtitle="Hover-reveal gallery / portfolio image tile" viewport="700x360"
 */
export function RevealImage(props: RevealImageProps): JSX.Element;
