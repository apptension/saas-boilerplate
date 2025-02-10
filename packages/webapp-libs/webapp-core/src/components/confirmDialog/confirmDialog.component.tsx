import { VariantProps } from 'class-variance-authority';
import { MouseEvent, PropsWithChildren, ReactNode, useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { buttonVariants } from '../ui/button';

export interface ConfirmDialogProps extends PropsWithChildren {
  onContinue: (e: MouseEvent<HTMLButtonElement>) => void;
  onCancel?: (e: MouseEvent<HTMLButtonElement>) => void;
  title: ReactNode;
  description?: ReactNode;
  continueLabel?: ReactNode;
  cancelLabel?: ReactNode;
  variant?: VariantProps<typeof buttonVariants>['variant'];
}

export const ConfirmDialog = ({
  children,
  title,
  description,
  continueLabel,
  cancelLabel,
  onCancel,
  onContinue,
  variant = 'default',
}: ConfirmDialogProps) => {
  const [open, setOpen] = useState(false);
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(true);
  };
  const handleCancel = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      setOpen(false);
      onCancel?.(e);
    },
    [onCancel, setOpen]
  );
  const handleContinue = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      setOpen(false);
      onContinue(e);
    },
    [onContinue, setOpen]
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild onClick={onClick}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {cancelLabel ?? <FormattedMessage id="Confirm Dialog / Cancel label" defaultMessage="Cancel" />}
          </AlertDialogCancel>
          <AlertDialogAction className={buttonVariants({ variant })} onClick={handleContinue}>
            {continueLabel ?? <FormattedMessage id="Confirm Dialog / Continue label" defaultMessage="Continue" />}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
