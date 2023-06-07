import * as LabelPrimitive from '@radix-ui/react-label';
import React from 'react';

import { useFormField } from '../formField';
import { cn } from '@sb/webapp-core/lib/utils';

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return <label ref={ref} className={cn(error && 'text-destructive', className)} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = 'FormLabel';

export { FormLabel };
