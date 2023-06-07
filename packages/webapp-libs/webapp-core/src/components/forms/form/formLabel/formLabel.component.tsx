import * as LabelPrimitive from '@radix-ui/react-label';
import React from 'react';

import { cn } from '../../../../lib/utils';
import { useFormField } from '../formField';

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return <label ref={ref} className={cn(error && 'text-destructive', className)} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = 'FormLabel';

export { FormLabel };
