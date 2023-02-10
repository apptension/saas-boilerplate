import { Story } from '@storybook/react';
import { Elements } from '@stripe/react-stripe-js';
import { times } from 'ramda';

import { fillStripeAllPaymentMethodsQuery, paymentMethodFactory } from '../../../../../mocks/factories';
import { useApiForm } from '../../../../hooks/useApiForm';
import { stripePromise } from '../../../../services/stripe';
import { withActiveSubscriptionContext, withRelay } from '../../../../utils/storybook';
import { StripePaymentMethodSelector, StripePaymentMethodSelectorProps } from './stripePaymentMethodSelector.component';
import { PaymentFormFields } from './stripePaymentMethodSelector.types';

const Template: Story<StripePaymentMethodSelectorProps> = (args: StripePaymentMethodSelectorProps) => {
  const formControls = useApiForm<PaymentFormFields>();
  return (
    <Elements stripe={stripePromise}>
      <StripePaymentMethodSelector {...args} formControls={formControls} />
    </Elements>
  );
};

export default {
  title: 'Shared/Finances/Stripe/StripePaymentMethodSelector',
  component: StripePaymentMethodSelector,
  decorators: [
    withActiveSubscriptionContext,
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
