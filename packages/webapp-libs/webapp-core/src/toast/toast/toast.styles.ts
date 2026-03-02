import { cva } from 'class-variance-authority';

export const toastVariants = cva(
  [
    // Base styles
    'group relative pointer-events-auto flex w-full items-center justify-between gap-3 overflow-hidden rounded-lg border py-4 px-4 pr-10 shadow-lg',
    // Transition for all properties (smooth stacking)
    'transition-all duration-300 ease-out',
    // Swipe handling
    'data-[swipe=move]:transition-none data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
    // Open animation - slide in from bottom
    'data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-full data-[state=open]:fade-in-0',
    // Close animation - fade out and slide down
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:zoom-out-95',
    'data-[swipe=end]:animate-out data-[swipe=end]:slide-out-to-right-full',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-background border border-border',
        success:
          'group success border-l-4 border-l-green-500 border-y border-r border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950/50 dark:text-green-100',
        destructive:
          'group destructive border-l-4 border-l-destructive border-y border-r border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100',
        warning:
          'group warning border-l-4 border-l-amber-500 border-y border-r border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100',
        info: 'group info border-l-4 border-l-blue-500 border-y border-r border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
