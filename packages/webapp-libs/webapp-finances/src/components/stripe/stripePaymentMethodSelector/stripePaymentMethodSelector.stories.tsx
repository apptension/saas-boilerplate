import { SubscriptionPlanName } from '@sb/webapp-api-client/api/subscription';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import {
  paymentMethodFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '@sb/webapp-api-client/tests/factories';
import { Form } from '@sb/webapp-core/components/forms';
import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { Elements } from '@stripe/react-stripe-js';
import { append, times } from 'ramda';

import { stripePromise } from '../../../services/stripe';
import { fillSubscriptionScheduleQueryWithPhases } from '../../../tests/factories';
import { withActiveSubscriptionContext, withProviders } from '../../../utils/storybook';
import { StripePaymentMethodSelector, StripePaymentMethodSelectorProps } from './stripePaymentMethodSelector.component';
import { PaymentFormFields } from './stripePaymentMethodSelector.types';

const Template: StoryFn<StripePaymentMethodSelectorProps<PaymentFormFields>> = (
  args: StripePaymentMethodSelectorProps<PaymentFormFields>
) => {
  const { form } = useApiForm<PaymentFormFields>();
  return (
    <Form {...form}>
      <Elements stripe={stripePromise} options={{ locale: 'en' }}>
        <StripePaymentMethodSelector {...args} control={form.control} />
      </Elements>
    </Form>
  );
};

const meta: Meta<typeof StripePaymentMethodSelector> = {
  title: 'Finances/StripePaymentMethodSelector',
  component: StripePaymentMethodSelector,
  decorators: [
    withActiveSubscriptionContext,
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

export const Default: StoryObj<typeof meta> = {
  render: Template,
  args: {},
};
