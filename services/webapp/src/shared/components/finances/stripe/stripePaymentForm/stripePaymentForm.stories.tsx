import React from 'react';
import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Elements } from '@stripe/react-stripe-js';
import { produce } from 'immer';
import { times } from 'ramda';
import { stripePromise } from '../../../../services/stripe';
import { withRedux } from '../../../../utils/storybook';
import { store } from '../../../../../mocks/store';
import { paymentMethodFactory } from '../../../../../mocks/factories/stripe';
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
    withRedux(
      produce(store, (state) => {
        state.stripe.paymentMethods = times(() => paymentMethodFactory(), 3);
      })
    ),
  ],
};

export const Default = Template.bind({});
Default.args = { onSuccess: action('Success') };
