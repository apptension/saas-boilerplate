import { Story } from '@storybook/react';
import { Elements } from '@stripe/react-stripe-js';
import { append, times } from 'ramda';

import {
  fillSubscriptionScheduleQueryWithPhases,
  paymentMethodFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../../../mocks/factories';
import { useApiForm } from '../../../../hooks/';
import { SubscriptionPlanName } from '../../../../services/api/subscription/types';
import { stripePromise } from '../../../../services/stripe';
import { withActiveSubscriptionContext, withProviders } from '../../../../utils/storybook';
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
