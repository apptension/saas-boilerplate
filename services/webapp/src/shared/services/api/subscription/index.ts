import { client } from '../client';
import { apiURLs } from '../helpers';
import {
  SubscriptionGetApiResponseData,
  SubscriptionUpdateApiRequestData,
  SubscriptionUpdateApiResponseData,
} from './types';

export const SUBSCRIPTION_URL = apiURLs('/finances/', {
  INDEX: '/subscription/me/',
  CANCEL: '/subscription/me/cancel/',
});

export const get = async () => {
  const res = await client.get<SubscriptionGetApiResponseData>(SUBSCRIPTION_URL.INDEX);
  return res.data;
};

export const update = async (data: SubscriptionUpdateApiRequestData) => {
  const res = await client.put<SubscriptionUpdateApiResponseData>(SUBSCRIPTION_URL.INDEX, data);
  return res.data;
};

export const cancel = async () => {
  const res = await client.post<void>(SUBSCRIPTION_URL.CANCEL);
  return res.data;
};
