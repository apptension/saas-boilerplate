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
    defaultMessage: 'Your personal data export is ready for download',
    id: 'Email / User Export / Preheader',
  });

  return (
    <Layout
      preheader={preheaderText}
      title={<FormattedMessage defaultMessage="Exported user data" id="Email / User Export / Title" />}
      text={
        <FormattedMessage
          defaultMessage="We have received your request to export your personal data, in accordance with GDPR regulations. We have processed your request and your data has been compiled into a package that is now available for download."
          id="Email / User Export / Text"
        />
      }
      footer={{
        companyName: 'SaaS Boilerplate',
      }}
    >
      <EmailText variant="secondary" align="center">
        <FormattedMessage
          defaultMessage="Please note that this package contains sensitive information and should be downloaded to a secure location. This link will remain active for the next 48 hours."
          id="Email / User Export / Warning"
        />
      </EmailText>

      <Button linkTo={data.export_url}>
        <FormattedMessage defaultMessage="Download your data" id="Email / User Export / Download" />
      </Button>

      <EmailText variant="muted" align="center">
        <FormattedMessage
          defaultMessage="If you have any questions or concerns about your data, please do not hesitate to contact us."
          id="Email / User Export / Bottom text"
        />
      </EmailText>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage defaultMessage="Exported user data" id="Email / User Export / Subject" />
);
