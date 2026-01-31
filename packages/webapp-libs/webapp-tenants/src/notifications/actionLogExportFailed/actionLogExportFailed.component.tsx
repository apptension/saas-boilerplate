import { Notification, NotificationType } from '@sb/webapp-notifications';
import { AlertTriangle } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

export type ActionLogExportFailedProps = NotificationType<{
  export_id: string;
  tenant_name: string;
  error: string;
}>;

export const ActionLogExportFailed = ({
  data: { tenant_name },
  ...restProps
}: ActionLogExportFailedProps) => {
  return (
    <Notification
      {...restProps}
      icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
      iconClassName="bg-destructive/10"
      title={
        <FormattedMessage
          defaultMessage="Activity Log Export Failed"
          id="Notifications / Action Log Export Failed / Title"
        />
      }
      content={
        <FormattedMessage
          defaultMessage='Failed to export activity logs from "{tenant_name}". Please try again.'
          id="Notifications / Action Log Export Failed / Content"
          values={{ tenant_name }}
        />
      }
    />
  );
};
