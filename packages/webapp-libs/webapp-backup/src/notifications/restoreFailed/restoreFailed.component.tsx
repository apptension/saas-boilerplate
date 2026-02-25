import { Notification, NotificationType } from '@sb/webapp-notifications';
import { AlertTriangle } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

export type RestoreFailedProps = NotificationType<{
  restore_id: string;
  backup_id: string;
  tenant_name: string;
  error: string;
}>;

export const RestoreFailed = ({
  data: { tenant_name, error },
  ...restProps
}: RestoreFailedProps) => {
  return (
    <Notification
      {...restProps}
      icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
      iconClassName="bg-destructive/10"
      title={<FormattedMessage defaultMessage="Restore Failed" id="Notifications / Restore Failed / Title" />}
      content={
        <FormattedMessage
          defaultMessage='Failed to restore backup for "{tenant_name}". {error}'
          id="Notifications / Restore Failed / Content"
          values={{ tenant_name, error }}
        />
      }
    />
  );
};
