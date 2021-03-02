import { actionCreator } from '../helpers/actionCreator';
import { FetchStripePaymentMethodsSuccessPayload } from './stripe.types';

const { createPromiseAction } = actionCreator('STRIPE');

export const fetchStripePaymentMethods = createPromiseAction<void, FetchStripePaymentMethodsSuccessPayload>(
  'FETCH_STRIPE_PAYMENT_METHODS'
);
