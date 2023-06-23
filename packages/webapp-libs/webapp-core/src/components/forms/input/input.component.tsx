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
              `border-input text-primary ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-md border 
              bg-transparent px-3 py-2 text-sm transition-all duration-200 ease-in file:border-0 
              file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none 
              focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
              {
                'border-red-500': !!error,
              }
            )}
            ref={ref}
            {...props}
          />
          {label && (
            <p
              className={cn(`order-first mb-1 text-xs`, {
                'text-red-500': !!error,
              })}
            >
              {label}
            </p>
          )}
        </label>
        <p className="absolute top-[calc(100%+4px)] m-0 text-xs leading-3 text-red-500">{error}</p>
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
