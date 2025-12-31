import { ReactNode } from 'react';

import { Paragraph, SecondaryText, MutedText, SmallText } from './text.styles';

export type TextVariant = 'default' | 'secondary' | 'muted' | 'small';

export type TextProps = {
  /** Text variant */
  variant?: TextVariant;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Text content */
  children: ReactNode;
};

const textComponents = {
  default: Paragraph,
  secondary: SecondaryText,
  muted: MutedText,
  small: SmallText,
};

/**
 * Email-safe text component with consistent styling
 */
export const Text = ({ variant = 'default', align = 'center', children }: TextProps) => {
  const Component = textComponents[variant];
  return <Component $align={align}>{children}</Component>;
};
