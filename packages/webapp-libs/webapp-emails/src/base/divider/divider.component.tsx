import { DividerLine } from './divider.styles';

export type DividerProps = {
  /** Spacing above and below */
  spacing?: 'sm' | 'md' | 'lg';
};

/**
 * Horizontal divider for email content separation
 */
export const Divider = ({ spacing = 'md' }: DividerProps) => {
  return <DividerLine $spacing={spacing} />;
};
