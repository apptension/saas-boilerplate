import { FormattedMessage, useIntl } from 'react-intl';

import { Button, Layout, Text as EmailText } from '../../base';
import { EmailComponentProps } from '../../types';
import { ExportedUserDataResult } from '../userExportAdmin';

export type UserExportProps = EmailComponentProps & {
  data: ExportedUserDataResult;
};

export const Template = ({ data }: UserExportProps) => {
  const intl = useIntl();

  const preheaderText = intl.formatMessage({
    defaultMessage: 'Your download link is ready and valid for 48 hours',
    id: 'Email / User Export / Preheader',
  });

  return (
    <Layout
      preheader={preheaderText}
      title={
        <FormattedMessage defaultMessage="Your data export is ready" id="Email / User Export / Title" />
      }
      text={
        <FormattedMessage
          defaultMessage="Good news! We've processed your data export request. Your personal data has been securely compiled and is ready for download."
          id="Email / User Export / Text"
        />
      }
      footer={{
        companyName: 'SaaS Boilerplate',
      }}
    >
      <EmailText variant="secondary" align="center">
        <FormattedMessage
          defaultMessage="For your security, please download this file to a secure location. This link will expire in 48 hours."
          id="Email / User Export / Warning"
        />
      </EmailText>

      <Button linkTo={data.export_url}>
        <FormattedMessage defaultMessage="Download my data" id="Email / User Export / Download" />
      </Button>

      <EmailText variant="muted" align="center">
        <FormattedMessage
          defaultMessage="Questions about your data? We're here to help — just reply to this email."
          id="Email / User Export / Bottom text"
        />
      </EmailText>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage defaultMessage="Your data export is ready to download" id="Email / User Export / Subject" />
);
