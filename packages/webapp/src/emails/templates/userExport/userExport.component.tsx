import { FormattedMessage } from 'react-intl';

import { Button, Layout } from '../../base';
import { EmailComponentProps } from '../../types';
import { ExportedUserDataResult } from '../userExportAdmin';
import { Text } from './userExport.styles';

export type UserExportProps = EmailComponentProps & {
  data: ExportedUserDataResult;
};

export const Template = ({ data }: UserExportProps) => {
  return (
    <Layout
      title={<FormattedMessage defaultMessage="Exported user data" id="Email / User Export / Title" />}
      text={
        <Text>
          <FormattedMessage
            defaultMessage="Dear User,{br}{br}
  We have received your request to export your personal data, in accordance with GDPR regulations. We have processed your request and your data has been compiled into a package that is now available for download.
  {br}{br}
  Please note that this package contains sensitive information and should be downloaded to a secure location.
  {br}{br}
  To download the package, please click on the download button below. This link will remain active for the next 48 hours. If you do not download the package within this timeframe, you will need to generate a new request."
            id="Email / User Export / Text"
            values={{ br: <br /> }}
          />
        </Text>
      }
    >
      <Button linkTo={data.export_url}>
        <FormattedMessage defaultMessage="Download" id="Email /  User Export / Download" />
      </Button>

      <Text>
        <FormattedMessage
          defaultMessage="{br}If you have any questions or concerns about your data, please do not hesitate to contact us.
{br}{br}
  Best regards,"
          id="Email / User Export / Bottom text"
          values={{ br: <br /> }}
        />
      </Text>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage defaultMessage="Exported user data" id="Email / User Export / Subject" />
);
