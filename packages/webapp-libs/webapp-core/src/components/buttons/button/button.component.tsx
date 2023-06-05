import { Slot } from '@radix-ui/react-slot';
import { type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { ReactNode } from 'react';

import { cn } from '../../../lib/utils';
import { Icon, buttonVariants } from './button.styles';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: ReactNode;
}

/**
 * [`shadcn/ui` docs](https://ui.shadcn.com/docs/components/button)
 *
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, icon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {icon ? <Icon>{icon}</Icon> : null}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button };
