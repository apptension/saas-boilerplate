import { client } from '../client';
import {
  SubscriptionGetApiResponseData,
  SubscriptionPlansListApiResponseData,
  SubscriptionUpdateApiRequestData,
  SubscriptionUpdateApiResponseData,
} from './types';

export const SUBSCRIPTION_URL = '/finances/subscription/me/';
export const SUBSCRIPTION_CANCEL_URL = '/finances/subscription/me/cancel/';
export const SUBSCRIPTIONS_PLANS_LIST_URL = '/finances/subscription-plans/';

export const get = async () => {
  const res = await client.get<SubscriptionGetApiResponseData>(SUBSCRIPTION_URL);
  return res.data;
};

export const update = async (data: SubscriptionUpdateApiRequestData) => {
  const res = await client.put<SubscriptionUpdateApiResponseData>(SUBSCRIPTION_URL, data);
  return res.data;
};

export const list = async () => {
  const res = await client.get<SubscriptionPlansListApiResponseData>(SUBSCRIPTIONS_PLANS_LIST_URL);
  return res.data;
};

export const cancel = async () => {
  const res = await client.post<void>(SUBSCRIPTION_CANCEL_URL);
  return res.data;
};
