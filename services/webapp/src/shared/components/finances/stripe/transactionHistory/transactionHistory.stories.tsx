import { Story } from '@storybook/react';
import { useQueryLoader } from 'react-relay';
import { Suspense, useEffect } from 'react';

import {
  fillAllStripeChargesQuery,
  paymentMethodFactory,
  transactionHistoryEntryFactory,
} from '../../../../../mocks/factories';
import { withProviders } from '../../../../utils/storybook';
import stripeAllChargesQueryGraphql, {
  stripeAllChargesQuery,
} from '../../../../../modules/stripe/__generated__/stripeAllChargesQuery.graphql';
import { fillCommonQueryWithUser } from '../../../../utils/commonQuery';
import { TransactionHistory } from './transactionHistory.component';

const Template: Story = () => {
  const [queryRef, loadQuery] = useQueryLoader<stripeAllChargesQuery>(stripeAllChargesQueryGraphql);
  useEffect(() => {
    loadQuery({});
  }, [loadQuery]);

  const loader = <div>Loading...</div>;

  if (!queryRef) {
    return loader;
  }
  return (
    <Suspense fallback={loader}>
      <TransactionHistory transactionHistoryQueryRef={queryRef} />
    </Suspense>
  );
};

export default {
  title: 'Shared/Finances/Stripe/TransactionHistory',
  component: TransactionHistory,
  decorators: [
    withProviders({
      relayEnvironment: (defaultRelayEnv) => {
        fillCommonQueryWithUser(defaultRelayEnv);
        const data = [
          transactionHistoryEntryFactory({
            created: new Date(2020, 5, 5).toString(),
            amount: 50,
            paymentMethod: paymentMethodFactory({ card: { last4: '1234' }, billingDetails: { name: 'Owner 1' } }),
          }),
          transactionHistoryEntryFactory({
            created: new Date(2020, 10, 10).toString(),
            amount: 100,
            paymentMethod: paymentMethodFactory({ card: { last4: '9876' }, billingDetails: { name: 'Owner 2' } }),
          }),
        ];
        fillAllStripeChargesQuery(defaultRelayEnv, data);
      },
    }),
  ],
};

export const Default = Template.bind({});
