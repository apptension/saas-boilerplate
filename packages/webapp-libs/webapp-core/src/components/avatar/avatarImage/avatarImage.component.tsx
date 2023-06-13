import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as React from 'react';

import { cn } from '../../../lib/utils';

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => {
  return <AvatarPrimitive.Image ref={ref} className={cn('aspect-square h-full w-full', className)} {...props} />;
});

AvatarImage.displayName = AvatarPrimitive.Image.displayName;

export { AvatarImage };
