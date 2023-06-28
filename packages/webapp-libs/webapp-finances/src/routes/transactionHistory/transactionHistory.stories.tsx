import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { append } from 'ramda';

import { fillAllStripeChargesQuery } from '../../tests/factories';
import { withProviders } from '../../utils/storybook';
import { TransactionHistory } from './transactionHistory.component';

const Template: StoryFn = () => {
  return <TransactionHistory />;
};

const meta: Meta = {
  title: 'Routes/Finances/TransactionHistory',
  component: TransactionHistory,
  decorators: [
    withProviders({
      apolloMocks: append(fillAllStripeChargesQuery()),
    }),
  ],
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,
  args: { children: 'text' },
};
