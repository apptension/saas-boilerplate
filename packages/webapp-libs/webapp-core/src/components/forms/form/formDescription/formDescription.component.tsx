import * as React from 'react';

import { useFormField } from '../';
import { cn } from '../../../../lib/utils';

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField();

    return <p ref={ref} id={formDescriptionId} className={cn('text-sm text-muted-foreground', className)} {...props} />;
  }
);
FormDescription.displayName = 'FormDescription';

export { FormDescription };
