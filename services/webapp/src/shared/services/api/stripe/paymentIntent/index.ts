import { client } from '../../client';
import {
  StripePaymentIntentCreateApiRequestData,
  StripePaymentIntentCreateApiResponseData,
  StripePaymentIntentGetApiResponseData,
  StripePaymentIntentUpdateApiRequestData,
  StripePaymentIntentUpdateApiResponseData,
} from './types';

export * from './types';

export const STRIPE_PAYMENT_INTENT_URL = '/finances/stripe/payment-intent/';

export const create = async (data: StripePaymentIntentCreateApiRequestData) => {
  const res = await client.post<StripePaymentIntentCreateApiResponseData>(STRIPE_PAYMENT_INTENT_URL, data);
  return res.data;
};

export const get = async (id: string) => {
  const res = await client.get<StripePaymentIntentGetApiResponseData>(`${STRIPE_PAYMENT_INTENT_URL}${id}/`);
  return res.data;
};

export const update = async (id: string, data: StripePaymentIntentUpdateApiRequestData) => {
  const res = await client.put<StripePaymentIntentUpdateApiResponseData>(`${STRIPE_PAYMENT_INTENT_URL}${id}/`, data);
  return res.data;
};
