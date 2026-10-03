import * as React from 'react';

export interface LogoProps {
  /** `mark` gate glyph · `medallion` four-petal · `wordmark` full lockup. */
  variant?: 'mark' | 'medallion' | 'wordmark';
  /** Pixel height (wordmark/medallion) or square size (mark). Defaults 40–48. */
  size?: number;
  /** Any CSS color; the SVG fills with currentColor. */
  color?: string;
  title?: string;
  style?: React.CSSProperties;
}

/**
 * Edwyn Chen brand marks as recolorable inline SVG.
 * @startingPoint section="Core" subtitle="Wordmark, gate mark, and medallion in any color" viewport="700x150"
 */
export function Logo(props: LogoProps): JSX.Element;
