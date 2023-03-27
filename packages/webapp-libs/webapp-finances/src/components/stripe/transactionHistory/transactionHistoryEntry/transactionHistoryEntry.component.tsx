import { FragmentType, useFragment } from '@sb/webapp-api-client/graphql';
import { FormattedDate } from '@sb/webapp-core/components/dateTime/formattedDate';
import { useIntl } from 'react-intl';

import { useSubscriptionPlanDetails } from '../../../../hooks';
import {
  STRIPE_CHARGE_FRAGMENT,
  SUBSCRIPTION_PLAN_ITEM_FRAGMENT,
} from '../../../../routes/subscriptions/subscriptions.graphql';
import { StripePaymentMethodInfo } from '../../stripePaymentMethodInfo';
import { Amount, Card, Container, Details, TransactionDate } from './transactionHistoryEntry.styles';

export type TransactionHistoryEntryProps = {
  entry: FragmentType<typeof STRIPE_CHARGE_FRAGMENT>;
  className?: string;
};

export const TransactionHistoryEntry = ({ entry, className }: TransactionHistoryEntryProps) => {
  const intl = useIntl();
  const data = useFragment(STRIPE_CHARGE_FRAGMENT, entry);

  const subscriptionPlanData = useFragment(SUBSCRIPTION_PLAN_ITEM_FRAGMENT, data.invoice?.subscription?.plan);
  const { name: entryProductName } = useSubscriptionPlanDetails(subscriptionPlanData ?? undefined);

  const noInvoiceDescription = intl.formatMessage({
    defaultMessage: 'Donation',
    id: 'Stripe / Transaction History / Donation payment description',
  });

  const subscriptionPaymentDescription = intl.formatMessage(
    {
      defaultMessage: '{planName} plan',
      id: 'Stripe / Transaction History / Subscription payment description',
    },
    { planName: entryProductName }
  );

  return (
    <Container className={className}>
      <TransactionDate>{data.created && <FormattedDate value={data.created.toString()} />}</TransactionDate>
      <Details>{entryProductName ? subscriptionPaymentDescription : noInvoiceDescription}</Details>
      <Card>{data.paymentMethod && <StripePaymentMethodInfo method={data.paymentMethod} />}</Card>
      <Amount>{data.amount} USD</Amount>
    </Container>
  );
};
