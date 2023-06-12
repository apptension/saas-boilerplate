import * as ToastPrimitives from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import * as React from 'react';
import { useIntl } from 'react-intl';

import { cn } from '../../../lib/utils';

export const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => {
  const intl = useIntl();
  return (
    <ToastPrimitives.Close
      ref={ref}
      className={cn(
        'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
        className
      )}
      toast-close=""
      aria-label={intl.formatMessage({
        defaultMessage: 'Dismiss',
        id: 'Toast message / Dismiss',
      })}
      {...props}
    >
      <X className="h-4 w-4" />
    </ToastPrimitives.Close>
  );
});
ToastClose.displayName = ToastPrimitives.Close.displayName;
