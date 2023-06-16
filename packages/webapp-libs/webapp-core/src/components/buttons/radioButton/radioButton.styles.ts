import { cva } from 'class-variance-authority';

export const radioButtonVariants = cva(
  'inline-flex items-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background cursor-pointer space-x-2',
  {
    variants: {
      variant: {
        outline:
          'border border-input hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:border [&:has(:disabled)]:text-accent-foreground/50',
        ghost:
          'hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:border [&:has(:disabled)]:text-accent-foreground/50',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'default',
    },
  }
);
