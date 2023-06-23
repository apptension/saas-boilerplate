import * as React from 'react';

import { cn } from '../../../lib/utils';

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn('bg-primary text-primary-foreground font-medium', className)} {...props} />
  )
);
TableFooter.displayName = 'TableFooter';
export { TableFooter };
