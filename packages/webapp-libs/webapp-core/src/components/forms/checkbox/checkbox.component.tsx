import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { ReactNode, forwardRef } from 'react';
import * as React from 'react';
import { cn } from '@sb/webapp-core/lib/utils';

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
>(({ label, error, className, value, ...props }, ref) => {
  console.log(value);
  return (
    <div className={cn('flex items-center relative', className)}>
      <label className="inline-flex items-center">
        <CheckboxPrimitive.Root
          ref={ref}
          className={cn(
            `peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground transition-all duration-200 ease-in`,
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
          className={cn('text-sm font-medium leading-none ml-2', {
            'text-red-500': !!error,
          })}
        >
          {label}
        </p>
      </label>
      <p className="leading-3 text-xs absolute m-0 top-[calc(100%+4px)] text-red-500">{error}</p>
    </div>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
