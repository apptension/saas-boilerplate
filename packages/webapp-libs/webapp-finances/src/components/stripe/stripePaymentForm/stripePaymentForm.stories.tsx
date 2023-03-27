import { SubscriptionPlanName } from '@sb/webapp-api-client/api/subscription/types';
import {
  paymentMethodFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '@sb/webapp-api-client/tests/factories';
import { action } from '@storybook/addon-actions';
import { Story } from '@storybook/react';
import { Elements } from '@stripe/react-stripe-js';
import { append, times } from 'ramda';

import { stripePromise } from '../../../services/stripe';
import { fillSubscriptionScheduleQueryWithPhases } from '../../../tests/factories';
import { withProviders } from '../../../utils/storybook';
import { StripePaymentForm, StripePaymentFormProps } from './stripePaymentForm.component';

const Template: Story<StripePaymentFormProps> = (args: StripePaymentFormProps) => {
  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm {...args} />
    </Elements>
  );
};

export default {
  title: 'Shared/Finances/Stripe/StripePaymentForm',
  component: StripePaymentForm,
  decorators: [
    withProviders({
      apolloMocks: append(
        fillSubscriptionScheduleQueryWithPhases(
          [
            subscriptionPhaseFactory({
              item: { price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }) },
            }),
          ],
          times(() => paymentMethodFactory(), 3)
        )
      ),
    }),
  ],
};

export const Default = Template.bind({});
Default.args = { onSuccess: action('Success') };
