import { client } from '../client';
import { SubscriptionApiGetResponseData } from './types';

export const SUBSCRIPTION_URL = '/finances/subscription/me';

export const get = async () => {
  const res = await client.get<SubscriptionApiGetResponseData>(SUBSCRIPTION_URL);
  return res.data;
};
