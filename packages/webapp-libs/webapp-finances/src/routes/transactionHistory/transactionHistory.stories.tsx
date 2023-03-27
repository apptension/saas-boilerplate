import { Story } from '@storybook/react';
import { append } from 'ramda';

import { fillAllStripeChargesQuery } from '../../tests/factories';
import { withProviders } from '../../utils/storybook';
import { TransactionHistory } from './transactionHistory.component';

const Template: Story = () => {
  return <TransactionHistory />;
};

export default {
  title: 'Routes/TransactionHistory',
  component: TransactionHistory,
  decorators: [
    withProviders({
      apolloMocks: append(fillAllStripeChargesQuery()),
    }),
  ],
};

export const Default = Template.bind({});
Default.args = { children: 'text' };
