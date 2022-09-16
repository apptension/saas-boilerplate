import { useIntl } from 'react-intl';
import { useFragment } from 'react-relay';
import { FormattedDate } from '../../../../dateTime/formattedDate';
import { useSubscriptionPlanDetails } from '../../../../../hooks/finances/useSubscriptionPlanDetails';
import StripeChargeFragmentGraphql, {
  stripeChargeFragment$key,
} from '../../../../../../modules/stripe/__generated__/stripeChargeFragment.graphql';
import { StripePaymentMethodInfo } from '../../stripePaymentMethodInfo';
import SubscriptionPlanItemFragmentGraphql, {
  subscriptionPlanItemFragment$key,
} from '../../../../../../modules/subscription/__generated__/subscriptionPlanItemFragment.graphql';
import { Container, Amount, Card, Details, TransactionDate } from './transactionHistoryEntry.styles';

export type TransactionHistoryEntryProps = {
  entry: stripeChargeFragment$key;
  className?: string;
};

export const TransactionHistoryEntry = ({ entry, className }: TransactionHistoryEntryProps) => {
  const intl = useIntl();
  const data = useFragment<stripeChargeFragment$key>(StripeChargeFragmentGraphql, entry);
  const subscriptionPlanData = useFragment<subscriptionPlanItemFragment$key>(
    SubscriptionPlanItemFragmentGraphql,
    data.invoice?.subscription?.plan ?? null
  );
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
      <Card>
        <StripePaymentMethodInfo method={data.paymentMethod} />
      </Card>
      <Amount>{data.amount} USD</Amount>
    </Container>
  );
};
