import { FormattedMessage } from 'react-intl';

import { Button, Layout } from '../../base';
import { EmailComponentProps } from '../../types';

export type ExportedUserDataResult = { email: string; export_url: string };
export type UserExportAdminProps = EmailComponentProps & {
  data: Array<ExportedUserDataResult>;
};

export const Template = ({ data }: UserExportAdminProps) => {
  return (
    <Layout
      title={<FormattedMessage defaultMessage="Exported user data" id="Email / User Export Admin / Title" />}
      text={
        <FormattedMessage
          defaultMessage="Below are results of user export job. Each user received separate email with the download link."
          id="Email / User Export Admin / Text"
        />
      }
    >
      <table style={{ width: '100%' }}>
        <tbody>
          {data.map((row) => (
            <tr key={row.email}>
              <td>{row.email}</td>
              <td>
                <Button linkTo={row.export_url}>
                  <FormattedMessage defaultMessage="Download" id="Email / User Export Admin / Download" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage defaultMessage="Exported user data" id="Email / User Export Admin / Subject" />
);
