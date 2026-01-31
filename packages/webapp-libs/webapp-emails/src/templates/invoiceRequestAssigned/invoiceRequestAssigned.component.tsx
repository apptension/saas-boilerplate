import { FormattedMessage, useIntl } from 'react-intl';

import { Button, Layout, Text } from '../../base';
import { EmailComponentProps } from '../../types';

export type InvoiceRequestAssignedProps = EmailComponentProps & {
  projectName: string;
  iterationName: string;
  requestedAmount: string;
  currency: string;
  requesterName: string;
  isCorrection: boolean;
  requestUrl: string;
};

export const Template = ({
  projectName,
  iterationName,
  requestedAmount,
  currency,
  requesterName,
  isCorrection,
  requestUrl,
}: InvoiceRequestAssignedProps) => {
  const intl = useIntl();

  const preheaderText = intl.formatMessage({
    defaultMessage: 'A new invoice request requires your review',
    id: 'Email / InvoiceRequestAssigned / Preheader',
  });

  const title = isCorrection
    ? intl.formatMessage({
        defaultMessage: 'Invoice Correction Request Assigned to You',
        id: 'Email / InvoiceRequestAssigned / Title Correction',
      })
    : intl.formatMessage({
        defaultMessage: 'Invoice Request Assigned to You',
        id: 'Email / InvoiceRequestAssigned / Title',
      });

  return (
    <Layout
      preheader={preheaderText}
      title={title}
      text={
        <FormattedMessage
          defaultMessage="You have been assigned to review an invoice request. Please review the details and take appropriate action."
          id="Email / InvoiceRequestAssigned / Text"
        />
      }
      footer={{
        companyName: 'SaaS Boilerplate',
      }}
    >
      <Text>
        <strong>
          <FormattedMessage defaultMessage="Project:" id="Email / InvoiceRequestAssigned / Project" />
        </strong>{' '}
        {projectName}
      </Text>
      {iterationName && (
        <Text>
          <strong>
            <FormattedMessage defaultMessage="Iteration:" id="Email / InvoiceRequestAssigned / Iteration" />
          </strong>{' '}
          {iterationName}
        </Text>
      )}
      <Text>
        <strong>
          <FormattedMessage defaultMessage="Amount:" id="Email / InvoiceRequestAssigned / Amount" />
        </strong>{' '}
        {requestedAmount} {currency}
      </Text>
      <Text>
        <strong>
          <FormattedMessage defaultMessage="Requested by:" id="Email / InvoiceRequestAssigned / RequestedBy" />
        </strong>{' '}
        {requesterName}
      </Text>
      <Button linkTo={requestUrl}>
        <FormattedMessage defaultMessage="Review Request" id="Email / InvoiceRequestAssigned / ReviewRequest" />
      </Button>
    </Layout>
  );
};

export const Subject = ({ isCorrection }: InvoiceRequestAssignedProps) =>
  isCorrection ? (
    <FormattedMessage
      defaultMessage="Invoice Correction Request Assigned to You"
      id="Email / InvoiceRequestAssigned / Subject Correction"
    />
  ) : (
    <FormattedMessage
      defaultMessage="Invoice Request Assigned to You"
      id="Email / InvoiceRequestAssigned / Subject"
    />
  );
