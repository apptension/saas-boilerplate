import { FormattedMessage, useIntl } from 'react-intl';

import { Button, Layout, Text } from '../../base';
import { EmailComponentProps } from '../../types';

export type InvoiceFileAddedProps = EmailComponentProps & {
  projectName: string;
  invoiceNumber: string;
  fileName: string;
  invoiceUrl: string;
};

export const Template = ({
  projectName,
  invoiceNumber,
  fileName,
  invoiceUrl,
}: InvoiceFileAddedProps) => {
  const intl = useIntl();

  const preheaderText = intl.formatMessage({
    defaultMessage: 'A file has been added to your invoice',
    id: 'Email / InvoiceFileAdded / Preheader',
  });

  return (
    <Layout
      preheader={preheaderText}
      title={
        <FormattedMessage
          defaultMessage="File Added to Invoice"
          id="Email / InvoiceFileAdded / Title"
        />
      }
      text={
        <FormattedMessage
          defaultMessage="A new file has been attached to your invoice."
          id="Email / InvoiceFileAdded / Text"
        />
      }
      footer={{
        companyName: 'SaaS Boilerplate',
      }}
    >
      <Text>
        <strong>
          <FormattedMessage defaultMessage="Invoice:" id="Email / InvoiceFileAdded / Invoice" />
        </strong>{' '}
        {invoiceNumber}
      </Text>
      <Text>
        <strong>
          <FormattedMessage defaultMessage="Project:" id="Email / InvoiceFileAdded / Project" />
        </strong>{' '}
        {projectName}
      </Text>
      <Text>
        <strong>
          <FormattedMessage defaultMessage="File:" id="Email / InvoiceFileAdded / File" />
        </strong>{' '}
        {fileName}
      </Text>
      <Button linkTo={invoiceUrl}>
        <FormattedMessage defaultMessage="View Invoice" id="Email / InvoiceFileAdded / ViewInvoice" />
      </Button>
    </Layout>
  );
};

export const Subject = ({ invoiceNumber }: InvoiceFileAddedProps) => (
  <FormattedMessage
    defaultMessage="File Added to Invoice {invoiceNumber}"
    id="Email / InvoiceFileAdded / Subject"
    values={{ invoiceNumber }}
  />
);
