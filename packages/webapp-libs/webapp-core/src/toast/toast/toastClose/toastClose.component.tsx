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
        'absolute right-3 top-3 rounded-md p-1 opacity-70 transition-all hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2',
        // Default variant
        'text-muted-foreground hover:text-foreground hover:bg-muted focus:ring-ring',
        // Success variant
        'group-[.success]:text-green-600 group-[.success]:hover:text-green-700 group-[.success]:hover:bg-green-100 group-[.success]:focus:ring-green-500 dark:group-[.success]:text-green-400 dark:group-[.success]:hover:text-green-300 dark:group-[.success]:hover:bg-green-900',
        // Destructive variant
        'group-[.destructive]:text-red-600 group-[.destructive]:hover:text-red-700 group-[.destructive]:hover:bg-red-100 group-[.destructive]:focus:ring-red-500 dark:group-[.destructive]:text-red-400 dark:group-[.destructive]:hover:text-red-300 dark:group-[.destructive]:hover:bg-red-900',
        // Warning variant
        'group-[.warning]:text-amber-600 group-[.warning]:hover:text-amber-700 group-[.warning]:hover:bg-amber-100 group-[.warning]:focus:ring-amber-500 dark:group-[.warning]:text-amber-400 dark:group-[.warning]:hover:text-amber-300 dark:group-[.warning]:hover:bg-amber-900',
        // Info variant
        'group-[.info]:text-blue-600 group-[.info]:hover:text-blue-700 group-[.info]:hover:bg-blue-100 group-[.info]:focus:ring-blue-500 dark:group-[.info]:text-blue-400 dark:group-[.info]:hover:text-blue-300 dark:group-[.info]:hover:bg-blue-900',
        className
      )}
      toast-close=""
      aria-label={intl.formatMessage({
        defaultMessage: 'Dismiss notification',
        id: 'Toast message / Dismiss',
      })}
      {...props}
    >
      <X className="h-4 w-4" />
    </ToastPrimitives.Close>
  );
});
ToastClose.displayName = ToastPrimitives.Close.displayName;
