import React from 'react';

import { cn } from '../../lib/utils';
import { Small } from '../typography';

export type EmptyStateProps = {
  children?: React.ReactNode;
  className?: string;
};
/**
 * Generic EmptyState component to represent empty lists, tables etc.
 * Use it everywhere where possible so you can later adjust it to the designs
 */
export const EmptyState = ({ children, className }: EmptyStateProps) => {
  return (
    <span className={cn('my-6 flex items-center justify-center align-middle', className)}>
      <Small className="text-center">{children}</Small>
    </span>
  );
};
