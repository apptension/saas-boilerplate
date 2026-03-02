import { FormattedMessage, useIntl } from 'react-intl';

import { Button, Layout, Text } from '../../base';
import { EmailComponentProps } from '../../types';

export type InvoiceCreatedProps = EmailComponentProps & {
  projectName: string;
  iterationName: string;
  invoiceNumber: string;
  invoiceAmount: string;
  currency: string;
  invoiceUrl: string;
};

export const Template = ({
  projectName,
  iterationName,
  invoiceNumber,
  invoiceAmount,
  currency,
  invoiceUrl,
}: InvoiceCreatedProps) => {
  const intl = useIntl();

  const preheaderText = intl.formatMessage({
    defaultMessage: 'Your invoice request has been processed',
    id: 'Email / InvoiceCreated / Preheader',
  });

  return (
    <Layout
      preheader={preheaderText}
      title={
        <FormattedMessage
          defaultMessage="Invoice Created from Your Request"
          id="Email / InvoiceCreated / Title"
        />
      }
      text={
        <FormattedMessage
          defaultMessage="Great news! An invoice has been created based on your request."
          id="Email / InvoiceCreated / Text"
        />
      }
      footer={{
        companyName: 'SaaS Boilerplate',
      }}
    >
      <Text>
        <strong>
          <FormattedMessage defaultMessage="Invoice Number:" id="Email / InvoiceCreated / InvoiceNumber" />
        </strong>{' '}
        {invoiceNumber}
      </Text>
      <Text>
        <strong>
          <FormattedMessage defaultMessage="Amount:" id="Email / InvoiceCreated / Amount" />
        </strong>{' '}
        {invoiceAmount} {currency}
      </Text>
      <Text>
        <strong>
          <FormattedMessage defaultMessage="Project:" id="Email / InvoiceCreated / Project" />
        </strong>{' '}
        {projectName}
      </Text>
      {iterationName && (
        <Text>
          <strong>
            <FormattedMessage defaultMessage="Iteration:" id="Email / InvoiceCreated / Iteration" />
          </strong>{' '}
          {iterationName}
        </Text>
      )}
      <Button linkTo={invoiceUrl}>
        <FormattedMessage defaultMessage="View Invoice" id="Email / InvoiceCreated / ViewInvoice" />
      </Button>
    </Layout>
  );
};

export const Subject = ({ invoiceNumber }: InvoiceCreatedProps) => (
  <FormattedMessage
    defaultMessage="Invoice {invoiceNumber} Created"
    id="Email / InvoiceCreated / Subject"
    values={{ invoiceNumber }}
  />
);
