import { client } from '../../client';
import { StripeSetupIntentCreateApiResponseData, StripeSetupIntentGetApiResponseData } from './types';
//<-- IMPORT MODULE API -->

export const STRIPE_SETUP_INTENT_URL = '/finances/stripe/setup-intent/';

export const get = async (id: string) => {
  const res = await client.get<StripeSetupIntentGetApiResponseData>(STRIPE_SETUP_INTENT_URL + `/${id}`);
  return res.data;
};

export const create = async () => {
  const res = await client.post<StripeSetupIntentCreateApiResponseData>(STRIPE_SETUP_INTENT_URL);
  return res.data;
};
