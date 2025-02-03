import { VariantProps } from 'class-variance-authority';
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';
import * as React from 'react';

import { FormControl, FormItem, FormLabel } from '..';
import { cn } from '../../../lib/utils';
import { RadioGroupItem } from '../../ui/radio-group';
import { radioButtonVariants } from './radioButton.styles';

export type RadioButtonProps = ComponentPropsWithoutRef<typeof RadioGroupItem> &
  VariantProps<typeof radioButtonVariants>;

export const RadioButton = forwardRef<
  ElementRef<typeof RadioGroupItem>,
  ComponentPropsWithoutRef<typeof RadioGroupItem>
>(({ children, className, size, variant = 'ghost', ...inputProps }: RadioButtonProps, ref) => {
  return (
    <FormItem>
      <FormLabel className={cn(radioButtonVariants({ variant, size, className }))}>
        <FormControl>
          <RadioGroupItem {...inputProps} />
        </FormControl>
        <div className="flex flex-1 items-center space-x-2">{children}</div>
      </FormLabel>
    </FormItem>
  );
});
