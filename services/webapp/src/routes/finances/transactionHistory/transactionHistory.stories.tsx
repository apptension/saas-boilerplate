import { Story } from '@storybook/react';
import { withProviders } from '../../../shared/utils/storybook';
import { fillCommonQueryWithUser } from '../../../shared/utils/commonQuery';
import { fillAllStripeChargesQuery } from '../../../mocks/factories';
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
        fillAllStripeChargesQuery(env);
      },
    }),
  ],
};

export const Default = Template.bind({});
Default.args = { children: 'text' };
