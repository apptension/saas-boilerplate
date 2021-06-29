import { ReactNode } from 'react';
import { Container, Text } from './emptyState.styles';

export type EmptyStateProps = {
  children?: ReactNode;
  className?: string;
};
/**
 * Generic EmptyState component to represent empty lists, tables etc.
 * Use it everywhere where possible so you can later adjust it to the designs
 */
export const EmptyState = ({ children, className }: EmptyStateProps) => {
  return (
    <Container className={className}>
      <Text>{children}</Text>
    </Container>
  );
};
