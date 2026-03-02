import { FormattedMessage, useIntl } from 'react-intl';

import { Button, Layout } from '../../base';
import { EmailComponentProps } from '../../types';
import {
  DataCard,
  DataCardAction,
  DataCardEmail,
  DataTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './userExportAdmin.styles';

export type ExportedUserDataResult = { email: string; export_url: string };
export type UserExportAdminProps = EmailComponentProps & {
  data: Array<ExportedUserDataResult>;
};

export const Template = ({ data }: UserExportAdminProps) => {
  const intl = useIntl();

  const preheaderText = intl.formatMessage({
    defaultMessage: 'Export complete — all download links included below',
    id: 'Email / User Export Admin / Preheader',
  });

  return (
    <Layout
      preheader={preheaderText}
      title={
        <FormattedMessage defaultMessage="Data export completed" id="Email / User Export Admin / Title" />
      }
      text={
        <FormattedMessage
          defaultMessage="The user data export job has finished successfully. Each user has received an email with their personal download link. Below is a summary with direct download links for your records."
          id="Email / User Export Admin / Text"
        />
      }
      footer={{
        companyName: 'SaaS Boilerplate',
      }}
    >
      {/* Desktop table view */}
      <DataTable>
        <TableHead>
          <tr>
            <TableHeader $align="left">
              <FormattedMessage defaultMessage="Email" id="Email / User Export Admin / Email Header" />
            </TableHeader>
            <TableHeader $align="right">
              <FormattedMessage defaultMessage="Action" id="Email / User Export Admin / Action Header" />
            </TableHeader>
          </tr>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={row.email} $isEven={index % 2 === 0}>
              <TableCell $align="left">{row.email}</TableCell>
              <TableCell $align="right" $isAction>
                <Button linkTo={row.export_url} variant="primary" inline>
                  <FormattedMessage defaultMessage="Download" id="Email / User Export Admin / Download" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>

      {/* Mobile card view */}
      {data.map((row) => (
        <DataCard key={row.email}>
          <DataCardEmail>{row.email}</DataCardEmail>
          <DataCardAction>
            <Button linkTo={row.export_url} variant="primary" inline>
              <FormattedMessage defaultMessage="Download" id="Email / User Export Admin / Download" />
            </Button>
          </DataCardAction>
        </DataCard>
      ))}
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage defaultMessage="Exported user data" id="Email / User Export Admin / Subject" />
);
