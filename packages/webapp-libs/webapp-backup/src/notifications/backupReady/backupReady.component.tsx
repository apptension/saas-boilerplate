import { Notification, NotificationType } from '@sb/webapp-notifications';
import { FileArchive } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

export type BackupReadyProps = NotificationType<{
  backup_id: string;
  tenant_name: string;
  backup_date: string;
  file_size: number;
  backup_settings_url: string;
  model_counts: Record<string, number>;
}>;

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const BackupReady = ({
  data: { tenant_name, backup_date, file_size, model_counts },
  ...restProps
}: BackupReadyProps) => {
  const totalRecords = Object.values(model_counts || {}).reduce((sum, count) => sum + count, 0);

  return (
    <Notification
      {...restProps}
      icon={<FileArchive className="h-4 w-4 text-emerald-600" />}
      iconClassName="bg-emerald-100"
      title={<FormattedMessage defaultMessage="Backup Ready" id="Notifications / Backup Ready / Title" />}
      content={
        <>
          <FormattedMessage
            defaultMessage='Your backup of "{tenant_name}" is ready ({file_size}). {totalRecords, plural, one {# record} other {# records}} backed up.'
            id="Notifications / Backup Ready / Content"
            values={{
              tenant_name,
              file_size: formatFileSize(file_size),
              totalRecords,
            }}
          />
          <br />
          <span className="text-xs text-muted-foreground">
            <FormattedMessage
              defaultMessage="You can download it from the backup list in settings."
              id="Notifications / Backup Ready / Download Note"
            />
          </span>
        </>
      }
    />
  );
};
