import { client } from '../client';
import { apiURLs } from '../helpers';
import { SubscriptionGetApiResponseData } from './types';

export * from './types';

export const SUBSCRIPTION_URL = apiURLs('/finances/', {
  INDEX: '/subscription/me/',
});

export const get = async () => {
  const res = await client.get<SubscriptionGetApiResponseData>(SUBSCRIPTION_URL.INDEX);
  return res.data;
};
