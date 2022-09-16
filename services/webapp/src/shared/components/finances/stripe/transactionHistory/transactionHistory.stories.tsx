import { Story } from '@storybook/react';
import { useQueryLoader } from 'react-relay';
import { Suspense, useEffect } from 'react';
import { OperationDescriptor } from 'react-relay/hooks';

import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { paymentMethodFactory, transactionHistoryEntryFactory } from '../../../../../mocks/factories';
import { withProviders } from '../../../../utils/storybook';
import stripeAllChargesQueryGraphql, {
  stripeAllChargesQuery,
} from '../../../../../modules/stripe/__generated__/stripeAllChargesQuery.graphql';
import { fillCommonQueryWithUser } from '../../../../utils/commonQuery';
import { connectionFromArray } from '../../../../utils/testUtils';
import { TransactionHistory } from './transactionHistory.component';

const defaultRelayEnv = createMockEnvironment();

fillCommonQueryWithUser(defaultRelayEnv);

defaultRelayEnv.mock.queueOperationResolver((operation: OperationDescriptor) =>
  MockPayloadGenerator.generate(operation, {
    ChargeConnection: () =>
      connectionFromArray([
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
      ]),
  })
);

defaultRelayEnv.mock.queuePendingOperation(stripeAllChargesQueryGraphql, {});

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
  decorators: [withProviders({ relayEnvironment: defaultRelayEnv })],
};

export const Default = Template.bind({});
