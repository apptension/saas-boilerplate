import { client } from '../client';
import { apiURLs } from '../helpers';
import {
  SubscriptionGetApiResponseData,
  SubscriptionPlansListApiResponseData,
  SubscriptionUpdateApiRequestData,
  SubscriptionUpdateApiResponseData,
} from './types';

export const SUBSCRIPTION_URL = apiURLs('/finances/', {
  INDEX: '/subscription/me/',
  CANCEL: '/subscription/me/cancel/',
  LIST: '/subscription-plans/',
});

export const get = async () => {
  const res = await client.get<SubscriptionGetApiResponseData>(SUBSCRIPTION_URL.INDEX);
  return res.data;
};

export const update = async (data: SubscriptionUpdateApiRequestData) => {
  const res = await client.put<SubscriptionUpdateApiResponseData>(SUBSCRIPTION_URL.INDEX, data);
  return res.data;
};

export const list = async () => {
  const res = await client.get<SubscriptionPlansListApiResponseData>(SUBSCRIPTION_URL.LIST);
  return res.data;
};

export const cancel = async () => {
  const res = await client.post<void>(SUBSCRIPTION_URL.CANCEL);
  return res.data;
};
