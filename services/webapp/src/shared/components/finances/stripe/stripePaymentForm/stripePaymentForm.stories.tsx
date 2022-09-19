import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Elements } from '@stripe/react-stripe-js';
import { times } from 'ramda';
import { stripePromise } from '../../../../services/stripe';
import { withRelay } from '../../../../utils/storybook';
import { generateRelayEnvironmentWithPaymentMethods, paymentMethodFactory } from '../../../../../mocks/factories';
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
    withRelay((env) => {
      generateRelayEnvironmentWithPaymentMethods(
        times(() => paymentMethodFactory(), 3),
        env
      );
    }),
  ],
};

export const Default = Template.bind({});
Default.args = { onSuccess: action('Success') };
