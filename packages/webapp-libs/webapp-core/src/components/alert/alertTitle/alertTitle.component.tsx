import * as React from 'react';

import { cn } from '../../../lib/utils';

export const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props}>
      {props.children}
    </h5>
  )
);
AlertTitle.displayName = 'AlertTitle';
