import { Story } from '@storybook/react';
import { times } from 'ramda';
import { prepareState } from '../../../mocks/store';
import { transactionHistoryEntryFactory } from '../../../mocks/factories';
import { withProviders } from '../../../shared/utils/storybook';
import { TransactionHistory } from './transactionHistory.component';

const Template: Story = (args) => {
  return <TransactionHistory {...args} />;
};

const store = prepareState((state) => {
  state.stripe.transactionHistory = times(() => transactionHistoryEntryFactory(), 5);
});

export default {
  title: 'Routes/TransactionHistory',
  component: TransactionHistory,
  decorators: [withProviders({ store })],
};

export const Default = Template.bind({});
Default.args = { children: 'text' };
