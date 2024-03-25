import * as SelectPrimitive from '@radix-ui/react-select';
import React from 'react';

import { cn } from '../../../../lib/utils';

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn('bg-muted -mx-1 my-1 h-px', className)} {...props} />
));

SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export { SelectSeparator };
