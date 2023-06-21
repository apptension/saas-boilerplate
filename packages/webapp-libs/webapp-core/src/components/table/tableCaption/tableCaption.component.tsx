import * as React from 'react';

import { cn } from '../../../lib/utils';

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn('text-muted-foreground mt-4 text-sm', className)} {...props} />
  )
);
TableCaption.displayName = 'TableCaption';
export { TableCaption };
