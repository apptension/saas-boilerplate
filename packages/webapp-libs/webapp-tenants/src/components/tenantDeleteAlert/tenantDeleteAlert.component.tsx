import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@sb/webapp-core/components/alertDialog';
import { buttonVariants } from '@sb/webapp-core/components/buttons/button/button.styles';
import { FormattedMessage } from 'react-intl';

export type TenantDeleteAlertProps = {
  onContinue: () => void;
  disabled: boolean;
};

export const TenantDeleteAlert = ({ onContinue, disabled }: TenantDeleteAlertProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger disabled={disabled} className={buttonVariants({ variant: 'destructive' })}>
        <FormattedMessage
          defaultMessage="Remove organization"
          id="Tenant General Settings / Danger Zone / Alert / Tenant Delete Button"
        />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <FormattedMessage
              defaultMessage="Are you absolutely sure?"
              id="Tenant Danger Settings / Danger Zone / Alert / Tenant Delete Title"
            />
          </AlertDialogTitle>
          <AlertDialogDescription>
            <FormattedMessage
              defaultMessage="This action cannot be undone. This will permanently delete your organization from our servers."
              id="Tenant Danger Settings / Danger Zone / Alert / Tenant Delete Description"
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <FormattedMessage
              defaultMessage="Cancel"
              id="Tenant Danger Settings / Danger Zone / Alert / Tenant Delete Cancel"
            />
          </AlertDialogCancel>
          <AlertDialogAction onClick={onContinue} className={buttonVariants({ variant: 'destructive' })}>
            <FormattedMessage
              defaultMessage="Continue"
              id="Tenant Danger Settings / Danger Zone / Alert / Tenant Delete Continue"
            />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
