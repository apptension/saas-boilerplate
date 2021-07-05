import { client } from '../../client';
import { apiURLs, appendId } from '../../helpers';
import { StripeSetupIntentCreateApiResponseData, StripeSetupIntentGetApiResponseData } from './types';
//<-- IMPORT MODULE API -->

export const STRIPE_SETUP_INTENT_URL = apiURLs('/finances/stripe/setup-intent/', {
  CREATE: '',
  GET: appendId,
});

export const get = async (id: string) => {
  const res = await client.get<StripeSetupIntentGetApiResponseData>(STRIPE_SETUP_INTENT_URL.GET({ id }));
  return res.data;
};

export const create = async () => {
  const res = await client.post<StripeSetupIntentCreateApiResponseData>(STRIPE_SETUP_INTENT_URL.CREATE);
  return res.data;
};
