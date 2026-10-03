import * as React from 'react';

export interface CaseStudyFrameProps {
  /** Path to the scroll frame art. Default assumes `assets/scroll-frame.png` alongside a copy of this design system. */
  src?: string;
  /** Case-study cover image URL, drawn inside the scroll's inner writable area. */
  image?: string;
  alt?: string;
  /** Placeholder label shown when no `image`/`children` is supplied. */
  placeholder?: string;
  /** CSS aspect-ratio matching the scroll art (default "1200 / 620"). */
  ratio?: string;
  /** Custom media node instead of `image`. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * The hand-scroll (卷轴) frame for case-study cover imagery.
 * @startingPoint section="Content" subtitle="Scroll-framed case study cover image" viewport="700x360"
 */
export function CaseStudyFrame(props: CaseStudyFrameProps): JSX.Element;
