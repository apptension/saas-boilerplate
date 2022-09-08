import { client } from '../client';
import { apiURLs } from '../helpers';
import { SubscriptionGetApiResponseData } from './types';

export const SUBSCRIPTION_URL = apiURLs('/finances/', {
  INDEX: '/subscription/me/',
  CANCEL: '/subscription/me/cancel/',
});

export const get = async () => {
  const res = await client.get<SubscriptionGetApiResponseData>(SUBSCRIPTION_URL.INDEX);
  return res.data;
};

export const cancel = async () => {
  const res = await client.post<void>(SUBSCRIPTION_URL.CANCEL);
  return res.data;
};
