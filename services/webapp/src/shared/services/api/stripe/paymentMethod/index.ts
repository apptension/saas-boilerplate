import { client } from '../../client';
import { StripePaymentMethodGetApiResponseData } from './types';

export const STRIPE_PAYMENT_METHOD_URL = '/finances/stripe/payment-method/';
export const STRIPE_PAYMENT_METHOD_SET_DEFAULT_URL = '/finances/stripe/payment-method/:id/default/';

export * from './types';

export const list = async () => {
  const res = await client.get<StripePaymentMethodGetApiResponseData[]>(STRIPE_PAYMENT_METHOD_URL);
  return res.data;
};

export const remove = async (id: string) => {
  const res = await client.delete(STRIPE_PAYMENT_METHOD_URL + `${id}/`);
  return res.data;
};

export const setDefault = async (id: string) => {
  const res = await client.post(STRIPE_PAYMENT_METHOD_SET_DEFAULT_URL.replace(':id', id));
  return res.data;
};
