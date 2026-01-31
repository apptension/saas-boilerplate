import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@sb/webapp-core/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
        warning: 'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
        info: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
        muted: 'border-transparent bg-muted text-muted-foreground',
        // Brand gradient variant: #FFFE25 → #42F272
        gradient: 'border-transparent bg-gradient-to-r from-[#FFFE25] to-[#42F272] text-black',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

