import * as React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  /** Visual style. `primary` cobalt fill · `secondary` cobalt outline · `ghost` bare · `seal` red · `inverse` on dark. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'seal' | 'inverse';
  size?: 'sm' | 'md' | 'lg';
  /** Render as an anchor when set. */
  href?: string;
  /** Optional trailing icon node. */
  iconRight?: React.ReactNode;
  /** Show the built-in wayfinding arrow (slides on hover). */
  arrow?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
}

/**
 * The porcelain-system action button.
 * @startingPoint section="Core" subtitle="Cobalt / seal / outline actions with wayfinding arrow" viewport="700x150"
 */
export function Button(props: ButtonProps): JSX.Element;
