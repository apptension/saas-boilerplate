import { rest } from 'msw';
import { SubscriptionApiGetResponseData } from '../../../shared/services/api/subscription/types';
import { SUBSCRIPTION_URL } from '../../../shared/services/api/subscription';
const baseUrl = process.env.REACT_APP_BASE_API_URL;

export const mockGetSubscription = (response: SubscriptionApiGetResponseData[] = []) =>
  rest.get<void, SubscriptionApiGetResponseData[]>([baseUrl, SUBSCRIPTION_URL].join(''), (req, res, ctx) => {
  return res(ctx.json(response));
});
