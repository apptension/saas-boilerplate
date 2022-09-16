import { Story } from '@storybook/react';
import { times } from 'ramda';
import { OperationDescriptor } from 'react-relay/hooks';
import { MockPayloadGenerator } from 'relay-test-utils';
import { transactionHistoryEntryFactory } from '../../../mocks/factories';
import { withProviders } from '../../../shared/utils/storybook';
import { connectionFromArray } from '../../../shared/utils/testUtils';
import StripeAllChargesQueryGraphql from '../../../modules/stripe/__generated__/stripeAllChargesQuery.graphql';
import { fillCommonQueryWithUser } from '../../../shared/utils/commonQuery';
import { TransactionHistory } from './transactionHistory.component';

const Template: Story = () => {
  return <TransactionHistory />;
};

export default {
  title: 'Routes/TransactionHistory',
  component: TransactionHistory,
  decorators: [
    withProviders({
      relayEnvironment: (env) => {
        fillCommonQueryWithUser(env);
        env.mock.queueOperationResolver((operation: OperationDescriptor) =>
          MockPayloadGenerator.generate(operation, {
            ChargeConnection: () => connectionFromArray(times(() => transactionHistoryEntryFactory(), 5)),
          })
        );
        env.mock.queuePendingOperation(StripeAllChargesQueryGraphql, {});
      },
    }),
  ],
};

export const Default = Template.bind({});
Default.args = { children: 'text' };
