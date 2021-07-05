import { client } from '../../client';
import { apiURLs, appendId, URLParams } from '../../helpers';
import { StripePaymentMethodGetApiResponseData } from './types';
export * from './types';

export const STRIPE_PAYMENT_METHOD_URL = apiURLs('/finances/stripe/payment-method/', {
  LIST: '',
  REMOVE: appendId,
  SET_DEFAULT: ({ id }: URLParams<'id'>) => `/${id}/default/`,
});

export const list = async () => {
  const res = await client.get<StripePaymentMethodGetApiResponseData[]>(STRIPE_PAYMENT_METHOD_URL.LIST);
  return res.data;
};

export const remove = async (id: string) => {
  const res = await client.delete(STRIPE_PAYMENT_METHOD_URL.REMOVE({ id }));
  return res.data;
};

export const setDefault = async (id: string) => {
  const res = await client.post(STRIPE_PAYMENT_METHOD_URL.SET_DEFAULT({ id }));
  return res.data;
};
