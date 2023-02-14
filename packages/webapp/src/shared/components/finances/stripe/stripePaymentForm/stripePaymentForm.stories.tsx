import { action } from '@storybook/addon-actions';
import { Story } from '@storybook/react';
import { Elements } from '@stripe/react-stripe-js';
import { append, times } from 'ramda';

import {
  fillSubscriptionScheduleQueryWithPhases,
  paymentMethodFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../services/api/subscription/types';
import { stripePromise } from '../../../../services/stripe';
import { withProviders } from '../../../../utils/storybook';
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
          undefined,
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
