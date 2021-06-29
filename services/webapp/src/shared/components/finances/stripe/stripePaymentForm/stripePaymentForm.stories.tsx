import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Elements } from '@stripe/react-stripe-js';
import { times } from 'ramda';
import { stripePromise } from '../../../../services/stripe';
import { withRedux } from '../../../../utils/storybook';
import { paymentMethodFactory } from '../../../../../mocks/factories';
import { StripePaymentForm, StripePaymentFormProps } from './stripePaymentForm.component';

const Template: Story<StripePaymentFormProps> = (args) => {
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
    withRedux((state) => {
      state.stripe.paymentMethods = times(() => paymentMethodFactory(), 3);
    }),
  ],
};

export const Default = Template.bind({});
Default.args = { onSuccess: action('Success') };
