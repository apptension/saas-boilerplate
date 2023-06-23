import { Slot } from '@radix-ui/react-slot';
import { type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { ReactNode } from 'react';

import { cn } from '../../../lib/utils';
import { buttonVariants } from './button.styles';
import { renderIcon } from './button.utils';

export interface ButtonBaseProps extends VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: ReactNode;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonBaseProps {}

/**
 * [`shadcn/ui` docs](https://ui.shadcn.com/docs/components/button)
 *
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, icon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        <>
          {renderIcon({ icon })}
          {children}
        </>
      </Comp>
    );
  }
);
Button.displayName = 'Button';
