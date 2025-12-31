import { ReactNode } from 'react';

import { H1, H2, H3, H4 } from './heading.styles';

export type HeadingLevel = 1 | 2 | 3 | 4;

export type HeadingProps = {
  /** Heading level (1-4) */
  level?: HeadingLevel;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Heading content */
  children: ReactNode;
};

const headingComponents = {
  1: H1,
  2: H2,
  3: H3,
  4: H4,
};

/**
 * Email-safe heading component with consistent styling
 */
export const Heading = ({ level = 2, align = 'center', children }: HeadingProps) => {
  const Component = headingComponents[level];
  return <Component $align={align}>{children}</Component>;
};
