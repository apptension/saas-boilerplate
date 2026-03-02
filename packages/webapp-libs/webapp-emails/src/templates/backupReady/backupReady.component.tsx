import { FormattedMessage, useIntl } from 'react-intl';

import { Button, Layout, Text } from '../../base';
import { EmailComponentProps } from '../../types';

export type BackupReadyProps = EmailComponentProps & {
  tenantName: string;
  backupDate: string;
  fileSize: number;
  backupSettingsUrl: string;
  modelCounts: Record<string, number>;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

export const Template = ({
  tenantName,
  backupDate,
  fileSize,
  backupSettingsUrl,
  modelCounts,
}: BackupReadyProps) => {
  const intl = useIntl();

  const preheaderText = intl.formatMessage({
    defaultMessage: 'Your backup is ready',
    id: 'Email / BackupReady / Preheader',
  });

  const title = intl.formatMessage({
    defaultMessage: 'Backup Ready',
    id: 'Email / BackupReady / Title',
  });

  const formattedDate = new Date(backupDate).toLocaleString(intl.locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalRecords = Object.values(modelCounts).reduce((sum, count) => sum + count, 0);

  return (
    <Layout
      preheader={preheaderText}
      title={title}
      text={
        <FormattedMessage
          defaultMessage="Your periodic backup of tenant data has been completed successfully."
          id="Email / BackupReady / Text"
        />
      }
      footer={{
        companyName: 'SaaS Boilerplate',
      }}
    >
      <Text>
        <strong>
          <FormattedMessage defaultMessage="Tenant:" id="Email / BackupReady / Tenant" />
        </strong>{' '}
        {tenantName}
      </Text>
      <Text>
        <strong>
          <FormattedMessage defaultMessage="Backup Date:" id="Email / BackupReady / BackupDate" />
        </strong>{' '}
        {formattedDate}
      </Text>
      <Text>
        <strong>
          <FormattedMessage defaultMessage="File Size:" id="Email / BackupReady / FileSize" />
        </strong>{' '}
        {formatFileSize(fileSize)}
      </Text>
      {totalRecords > 0 && (
        <Text>
          <strong>
            <FormattedMessage defaultMessage="Total Records:" id="Email / BackupReady / TotalRecords" />
          </strong>{' '}
          {totalRecords.toLocaleString()}
        </Text>
      )}
      <Button linkTo={backupSettingsUrl}>
        <FormattedMessage defaultMessage="View Backup" id="Email / BackupReady / DownloadButton" />
      </Button>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage defaultMessage="Backup Ready" id="Email / BackupReady / Subject" />
);
