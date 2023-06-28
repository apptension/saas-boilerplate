import { SubscriptionPlanName } from '@sb/webapp-api-client/api/subscription/types';
import {
  paymentMethodFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '@sb/webapp-api-client/tests/factories';
import { action } from '@storybook/addon-actions';
import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { Elements } from '@stripe/react-stripe-js';
import { append, times } from 'ramda';

import { stripePromise } from '../../../services/stripe';
import { fillSubscriptionScheduleQueryWithPhases } from '../../../tests/factories';
import { withProviders } from '../../../utils/storybook';
import { StripePaymentForm, StripePaymentFormProps } from './stripePaymentForm.component';

const Template: StoryFn<StripePaymentFormProps> = (args: StripePaymentFormProps) => {
  return (
    <Elements stripe={stripePromise} options={{ locale: 'en' }}>
      <StripePaymentForm {...args} />
    </Elements>
  );
};

const meta: Meta<typeof StripePaymentForm> = {
  title: 'Finances/StripePaymentForm',
  component: StripePaymentForm,
  decorators: [
    withProviders({
      apolloMocks: append(
        fillSubscriptionScheduleQueryWithPhases(
          [
            subscriptionPhaseFactory({
              item: {
                price: subscriptionPlanFactory({
                  product: { name: SubscriptionPlanName.FREE },
                }),
              },
            }),
          ],
          times(() => paymentMethodFactory(), 3)
        )
      ),
    }),
  ],
};

export default meta;

export const Default: StoryObj<typeof StripePaymentForm> = {
  render: Template,
  args: { onSuccess: action('Success') },
};
