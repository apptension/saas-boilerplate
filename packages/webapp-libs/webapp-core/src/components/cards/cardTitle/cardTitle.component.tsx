import * as React from 'react';

import { cn } from '../../../lib/utils';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props}>
      {props.children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

export { CardTitle };
