import { Story } from '@storybook/react';
import { times } from 'ramda';

import { fillStripeAllPaymentMethodsQuery, paymentMethodFactory } from '../../../mocks/factories';
import { withActiveSubscriptionContext, withRedux, withRelay } from '../../../shared/utils/storybook';
import { PaymentConfirm } from './paymentConfirm.component';

const Template: Story = () => {
  return <PaymentConfirm />;
};

export default {
  title: 'Routes/Finances/PaymentConfirm',
  component: PaymentConfirm,
  decorators: [
    withActiveSubscriptionContext,
    withRedux(),
    withRelay((env) => {
      fillStripeAllPaymentMethodsQuery(
        times(() => paymentMethodFactory(), 3),
        env
      );
    }),
  ],
};

export const Default = Template.bind({});
Default.args = {};
