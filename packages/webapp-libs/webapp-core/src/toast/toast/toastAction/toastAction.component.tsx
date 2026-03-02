import * as ToastPrimitives from '@radix-ui/react-toast';
import * as React from 'react';

import { cn } from '../../../lib/utils';

export const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      // Default variant
      'ring-offset-background hover:bg-secondary focus:ring-ring',
      // Success variant
      'group-[.success]:border-green-300 group-[.success]:hover:bg-green-100 group-[.success]:focus:ring-green-500 dark:group-[.success]:border-green-700 dark:group-[.success]:hover:bg-green-900',
      // Destructive variant
      'group-[.destructive]:border-red-300 group-[.destructive]:hover:bg-red-100 group-[.destructive]:focus:ring-red-500 dark:group-[.destructive]:border-red-700 dark:group-[.destructive]:hover:bg-red-900',
      // Warning variant
      'group-[.warning]:border-amber-300 group-[.warning]:hover:bg-amber-100 group-[.warning]:focus:ring-amber-500 dark:group-[.warning]:border-amber-700 dark:group-[.warning]:hover:bg-amber-900',
      // Info variant
      'group-[.info]:border-blue-300 group-[.info]:hover:bg-blue-100 group-[.info]:focus:ring-blue-500 dark:group-[.info]:border-blue-700 dark:group-[.info]:hover:bg-blue-900',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

export type ToastActionElement = React.ReactElement<typeof ToastAction>;
