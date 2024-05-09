import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import * as React from 'react';

import { cn } from '../../../lib/utils';

export const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description ref={ref} className={cn('text-muted-foreground text-sm', className)} {...props} />
));

AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;
