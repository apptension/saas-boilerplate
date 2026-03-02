import { Button } from '@sb/webapp-core/components/buttons';
import { Notification, NotificationType } from '@sb/webapp-notifications';
import { Download, FileArchive } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

export type ActionLogExportReadyProps = NotificationType<{
  export_id: string;
  tenant_name: string;
  log_count: number;
  file_size: number;
  download_url: string;
}>;

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const ActionLogExportReady = ({
  data: { tenant_name, log_count, file_size, download_url },
  ...restProps
}: ActionLogExportReadyProps) => {
  const handleDownload = () => {
    if (download_url) {
      window.open(download_url, '_blank');
    }
  };

  return (
    <Notification
      {...restProps}
      onClick={handleDownload}
      icon={<FileArchive className="h-4 w-4 text-emerald-600" />}
      iconClassName="bg-emerald-100"
      title={
        <FormattedMessage defaultMessage="Activity Log Export Ready" id="Notifications / Action Log Export Ready / Title" />
      }
      content={
        <FormattedMessage
          defaultMessage='Your export of {log_count, plural, one {# log} other {# logs}} from "{tenant_name}" is ready ({file_size}).'
          id="Notifications / Action Log Export Ready / Content"
          values={{
            tenant_name,
            log_count,
            file_size: formatFileSize(file_size),
          }}
        />
      }
    >
      {download_url && (
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
        >
          <Download className="h-3.5 w-3.5" />
          <FormattedMessage defaultMessage="Download" id="Notifications / Action Log Export Ready / Download" />
        </Button>
      )}
    </Notification>
  );
};
