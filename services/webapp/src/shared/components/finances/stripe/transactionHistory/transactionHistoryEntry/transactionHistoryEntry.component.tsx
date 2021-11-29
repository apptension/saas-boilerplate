import { useIntl } from 'react-intl';
import { TransactionHistoryEntry as TransactionHistoryEntryData } from '../../../../../services/api/stripe/history/types';
import { FormattedDate } from '../../../../dateTime/formattedDate';
import { StripePaymentMethodInfo } from '../../stripePaymentMethodInfo';
import { useSubscriptionPlanDetails } from '../../../../../hooks/finances/useSubscriptionPlanDetails';
import { Container, Amount, Card, Details, TransactionDate } from './transactionHistoryEntry.styles';

export type TransactionHistoryEntryProps = {
  entry: TransactionHistoryEntryData;
  className?: string;
};

export const TransactionHistoryEntry = ({ entry, className }: TransactionHistoryEntryProps) => {
  const intl = useIntl();
  const { name: entryProductName } = useSubscriptionPlanDetails(entry.invoice?.items?.[0]?.price);

  const noInvoiceDescription = intl.formatMessage({
    defaultMessage: 'Donation',
    description: 'Stripe / Transaction History / Donation payment description',
  });

  const subscriptionPaymentDescription = intl.formatMessage(
    {
      defaultMessage: '{planName} plan',
      description: 'Stripe / Transaction History / Subscription payment description',
    },
    { planName: entryProductName }
  );

  return (
    <Container className={className}>
      <TransactionDate>
        <FormattedDate value={entry.created} />
      </TransactionDate>
      <Details>{entryProductName ? subscriptionPaymentDescription : noInvoiceDescription}</Details>
      <Card>
        <StripePaymentMethodInfo
          method={{
            ...entry.paymentMethodDetails,
            billingDetails: entry.billingDetails,
          }}
        />
      </Card>
      <Amount>{entry.amount} USD</Amount>
    </Container>
  );
};