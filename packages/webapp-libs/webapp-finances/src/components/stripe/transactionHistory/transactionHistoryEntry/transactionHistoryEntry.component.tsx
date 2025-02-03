import { SubscriptionPlanName } from '@sb/webapp-api-client/api/subscription';
import { FragmentType, getFragmentData } from '@sb/webapp-api-client/graphql';
import { FormattedDate } from '@sb/webapp-core/components/dateTime/formattedDate';
import { TableCell, TableRow } from '@sb/webapp-core/components/ui/table';
import { useIntl } from 'react-intl';

import { useSubscriptionPlanDisplayName } from '../../../../hooks/useSubscriptionPlanDetails/useSubscriptionPlanDetails.hook';
import {
  STRIPE_CHARGE_FRAGMENT,
  SUBSCRIPTION_PLAN_ITEM_FRAGMENT,
} from '../../../../routes/subscriptions/subscriptions.graphql';
import { StripePaymentMethodInfo } from '../../stripePaymentMethodInfo';

export type TransactionHistoryEntryProps = {
  entry: FragmentType<typeof STRIPE_CHARGE_FRAGMENT>;
  className?: string;
};

export const TransactionHistoryEntry = ({ entry, className }: TransactionHistoryEntryProps) => {
  const intl = useIntl();
  const data = getFragmentData(STRIPE_CHARGE_FRAGMENT, entry);

  const subscriptionPlanData = getFragmentData(SUBSCRIPTION_PLAN_ITEM_FRAGMENT, data.invoice?.subscription?.plan);
  const entryProductName = useSubscriptionPlanDisplayName(subscriptionPlanData?.product?.name as SubscriptionPlanName);

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
    <TableRow className={className}>
      <TableCell>{data.created && <FormattedDate value={data.created.toString()} />}</TableCell>
      <TableCell>{entryProductName ? subscriptionPaymentDescription : noInvoiceDescription}</TableCell>
      <TableCell>{data.paymentMethod && <StripePaymentMethodInfo method={data.paymentMethod} />}</TableCell>
      <TableCell>{data.amount} USD</TableCell>
    </TableRow>
  );
};
