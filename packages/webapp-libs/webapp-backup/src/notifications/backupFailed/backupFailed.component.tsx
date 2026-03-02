import { Notification, NotificationType } from '@sb/webapp-notifications';
import { AlertTriangle } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

export type BackupFailedProps = NotificationType<{
  tenant_name: string;
  error: string;
}>;

export const BackupFailed = ({
  data: { tenant_name, error },
  ...restProps
}: BackupFailedProps) => {
  return (
    <Notification
      {...restProps}
      icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
      iconClassName="bg-destructive/10"
      title={<FormattedMessage defaultMessage="Backup Failed" id="Notifications / Backup Failed / Title" />}
      content={
        <FormattedMessage
          defaultMessage='Failed to create backup for "{tenant_name}". {error}'
          id="Notifications / Backup Failed / Content"
          values={{ tenant_name, error }}
        />
      }
    />
  );
};
