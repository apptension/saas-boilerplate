import { SubscriptionPlanName } from '@sb/webapp-api-client/api/subscription';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import {
  paymentMethodFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '@sb/webapp-api-client/tests/factories';
import { Story } from '@storybook/react';
import { Elements } from '@stripe/react-stripe-js';
import { append, times } from 'ramda';

import { stripePromise } from '../../../services/stripe';
import { fillSubscriptionScheduleQueryWithPhases } from '../../../tests/factories';
import { withActiveSubscriptionContext, withProviders } from '../../../utils/storybook';
import { StripePaymentMethodSelector, StripePaymentMethodSelectorProps } from './stripePaymentMethodSelector.component';
import { PaymentFormFields } from './stripePaymentMethodSelector.types';

const Template: Story<StripePaymentMethodSelectorProps<PaymentFormFields>> = (
  args: StripePaymentMethodSelectorProps<PaymentFormFields>
) => {
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
Default.args = {};
