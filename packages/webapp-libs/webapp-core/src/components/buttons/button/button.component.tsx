import { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { ReactNode } from 'react';

import { Button as ButtonBase, buttonVariants } from '../../ui/button';
import { renderIcon } from './button.utils';

export interface ButtonBaseProps extends VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: ReactNode;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonBaseProps {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ icon, children, asChild, ...props }, ref) => {
  // When asChild is true, pass children directly (user is responsible for single child)
  // When asChild is false (default), we can have multiple children
  if (asChild) {
    return (
      <ButtonBase ref={ref} asChild {...props}>
        {children}
      </ButtonBase>
    );
  }

  // Normal button - can have icon + children
  return (
    <ButtonBase ref={ref} {...props}>
      {renderIcon({ icon })}
      {children}
    </ButtonBase>
  );
});
Button.displayName = 'Button';
