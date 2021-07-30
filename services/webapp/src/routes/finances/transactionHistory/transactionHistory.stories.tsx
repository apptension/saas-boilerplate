import { Story } from '@storybook/react';
import { times } from 'ramda';
import { transactionHistoryEntryFactory } from '../../../mocks/factories';
import { withProviders } from '../../../shared/utils/storybook';
import { TransactionHistory } from './transactionHistory.component';

const Template: Story = (args) => {
  return <TransactionHistory {...args} />;
};

export default {
  title: 'Routes/TransactionHistory',
  component: TransactionHistory,
  decorators: [
    withProviders({
      store: (state) => {
        state.stripe.transactionHistory = times(() => transactionHistoryEntryFactory(), 5);
      },
    }),
  ],
};

export const Default = Template.bind({});
Default.args = { children: 'text' };
