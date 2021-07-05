import { client } from '../../client';
import { apiURLs, appendId } from '../../helpers';
import {
  StripePaymentIntentCreateApiRequestData,
  StripePaymentIntentCreateApiResponseData,
  StripePaymentIntentGetApiResponseData,
  StripePaymentIntentUpdateApiRequestData,
  StripePaymentIntentUpdateApiResponseData,
} from './types';

export * from './types';

export const STRIPE_PAYMENT_INTENT_URL = apiURLs('/finances/stripe/payment-intent/', {
  CREATE: '',
  GET: appendId,
  UPDATE: appendId,
});

export const create = async (data: StripePaymentIntentCreateApiRequestData) => {
  const res = await client.post<StripePaymentIntentCreateApiResponseData>(STRIPE_PAYMENT_INTENT_URL.CREATE, data);
  return res.data;
};

export const get = async (id: string) => {
  const res = await client.get<StripePaymentIntentGetApiResponseData>(STRIPE_PAYMENT_INTENT_URL.GET({ id }));
  return res.data;
};

export const update = async (id: string, data: StripePaymentIntentUpdateApiRequestData) => {
  const res = await client.put<StripePaymentIntentUpdateApiResponseData>(
    STRIPE_PAYMENT_INTENT_URL.UPDATE({ id }),
    data
  );
  return res.data;
};
