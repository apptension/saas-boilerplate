import { Story } from '@storybook/react';
import { times } from 'ramda';
import { transactionHistoryEntryFactory, transactionHistoryEntryInvoiceFactory } from '../../../../../mocks/factories';
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
      store: (state) => {
        state.stripe.transactionHistory = [
          transactionHistoryEntryFactory({
            invoice: transactionHistoryEntryInvoiceFactory(),
          }),
          ...times(() => transactionHistoryEntryFactory(), 3),
          transactionHistoryEntryFactory({
            invoice: transactionHistoryEntryInvoiceFactory(),
          }),
        ];
      },
    }),
  ],
};

export const Default = Template.bind({});
