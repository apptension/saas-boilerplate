import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

import { cn } from '../../../lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: ReactNode;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, required, type, ...props }: InputProps, ref) => {
    return (
      <div className={cn(`w-full`, className)}>
        <label className="flex flex-col items-start">
          {label && (
            <p
              className={cn(`order-first mb-1.5 text-sm font-medium`, {
                'text-destructive': !!error,
                'text-foreground': !error,
              })}
            >
              {label}
            </p>
          )}
          <input
            type={type}
            className={cn(
              `border-input text-primary ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-md border 
              bg-transparent px-3 py-2 text-sm transition-all duration-200 ease-in file:border-0 
              file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none 
              focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
              {
                'border-destructive focus-visible:ring-destructive': !!error,
              }
            )}
            ref={ref}
            {...props}
          />
        </label>
        {error && <p className="text-destructive mt-1.5 text-sm leading-tight">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
