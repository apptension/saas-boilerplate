import { Elements } from '@stripe/react-stripe-js';
import React from 'react';
import { produce } from 'immer';
import { times } from 'ramda';
import { makeContextRenderer } from '../../../../../utils/testUtils';
import { StripePaymentForm, StripePaymentFormProps } from '../stripePaymentForm.component';
import { paymentMethodFactory } from '../../../../../../mocks/factories/stripe';
import { store } from '../../../../../../mocks/store';

describe('StripePaymentForm: Component', () => {
  const defaultProps: StripePaymentFormProps = {
    onSuccess: jest.fn(),
  };

  const component = (props: Partial<StripePaymentFormProps>) => (
    <Elements stripe={null}>
      <StripePaymentForm {...defaultProps} {...props} />
    </Elements>
  );
  const render = makeContextRenderer(component);

  it('should render without errors', () => {
    render(
      {},
      {
        store: produce(store, (state) => {
          state.stripe.paymentMethods = times(() => paymentMethodFactory(), 2);
        }),
      }
    );
  });
});
