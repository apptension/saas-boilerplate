import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { ReactNode, forwardRef } from 'react';
import * as React from 'react';

import { cn } from '../../../lib/utils';

export type CheckboxProps = React.ForwardRefExoticComponent<
  CheckboxPrimitive.CheckboxProps &
    React.RefAttributes<HTMLButtonElement> & {
      label?: ReactNode;
      error?: string;
    }
>;

const Checkbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<CheckboxProps>
>(({ label, error, className, ...props }, ref) => (
  <div className={cn('relative flex items-center', className)}>
    <label className="inline-flex items-center">
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          `border-primary ring-offset-background focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground peer h-4 w-4 shrink-0 rounded-sm border transition-all duration-200 ease-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
          {
            'border-red-500': !!error,
          }
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
          <Check className="h-4 w-4" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <p
        className={cn('ml-2 text-xs font-medium leading-none', {
          'text-red-500': !!error,
        })}
      >
        {label}
      </p>
    </label>
    <p className="absolute top-[calc(100%+4px)] m-0 text-xs leading-3 text-red-500">{error}</p>
  </div>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
