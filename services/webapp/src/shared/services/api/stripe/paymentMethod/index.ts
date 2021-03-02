import { client } from '../../client';
import { StripePaymentMethodGetApiResponseData } from './types';

export const STRIPE_PAYMENT_METHOD_URL = '/finances/stripe/payment-method/';

export * from './types';

export const list = async () => {
  const res = await client.get<StripePaymentMethodGetApiResponseData[]>(STRIPE_PAYMENT_METHOD_URL);
  return res.data;
};
