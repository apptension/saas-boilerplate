import React from 'react';
import { Story } from '@storybook/react';

import { times } from 'ramda';
import { prepareState } from '../../../../../mocks/store';
import { transactionHistoryEntryFactory, transactionHistoryEntryInvoiceFactory } from '../../../../../mocks/factories';
import { withProviders } from '../../../../utils/storybook';
import { TransactionHistory } from './transactionHistory.component';

const store = prepareState((state) => {
  state.stripe.transactionHistory = [
    transactionHistoryEntryFactory({
      invoice: transactionHistoryEntryInvoiceFactory(),
    }),
    ...times(() => transactionHistoryEntryFactory(), 3),
    transactionHistoryEntryFactory({
      invoice: transactionHistoryEntryInvoiceFactory(),
    }),
  ];
});

const Template: Story = (args) => {
  return <TransactionHistory {...args} />;
};

export default {
  title: 'Shared/Finances/Stripe/TransactionHistory',
  component: TransactionHistory,
  decorators: [withProviders({ store })],
};

export const Default = Template.bind({});
