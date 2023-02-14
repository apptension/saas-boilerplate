import { Story } from '@storybook/react';

import {
  fillAllStripeChargesQuery,
  paymentMethodFactory,
  transactionHistoryEntryFactory,
} from '../../../../../mocks/factories';
import { withProviders } from '../../../../utils/storybook';
import { TransactionHistory } from './transactionHistory.component';

const Template: Story = () => {
  return <TransactionHistory />;
};

export default {
  title: 'Shared/Finances/Stripe/TransactionHistory',
  component: TransactionHistory,
  decorators: [
    withProviders({
      apolloMocks: (defaultMocks) => {
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
        return defaultMocks.concat([fillAllStripeChargesQuery(undefined, data)]);
      },
    }),
  ],
};

export const Default = Template.bind({});
