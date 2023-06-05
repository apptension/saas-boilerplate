import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

import { cn } from '../../../lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: ReactNode;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, required, type, ...props }: InputProps, ref) => {
    return (
      <div className={cn(`relative w-full max-w-xs`, className)}>
        <label className="flex flex-col items-start">
          <input
            type={type}
            className={cn(
              `h-10 w-full border-input transition-all duration-200 ease-in rounded-md border border-input bg-transparent 
              px-3 py-2 text-primary text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm 
              file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 
              focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
              {
                'border-red-500': !!error,
              }
            )}
            ref={ref}
            {...props}
          />
          {label && (
            <p
              className={cn(`text-xs mb-1 order-first`, {
                'text-red-500': !!error,
              })}
            >
              {label}
            </p>
          )}
        </label>
        <p className="leading-3 text-xs absolute m-0 top-[calc(100%+4px)] text-red-500">{error}</p>
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
