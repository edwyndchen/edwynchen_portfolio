import * as React from 'react';

export interface WorkCardProps {
  /** Uppercase category eyebrow, e.g. "Fintech". */
  category?: string;
  title: string;
  description?: string;
  /** Affordance label. Default "View Case Study". */
  action?: string;
  href?: string;
  /** Optional media node (image / porcelain thumbnail) shown above the action. */
  media?: React.ReactNode;
  /** Show the ornamental cobalt corner-frame (the signature treatment). */
  framed?: boolean;
  style?: React.CSSProperties;
}

/**
 * The signature portfolio card — ornamental corner-frame over porcelain.
 * @startingPoint section="Content" subtitle="Framed portfolio / case-study card" viewport="700x300"
 */
export function WorkCard(props: WorkCardProps): JSX.Element;
