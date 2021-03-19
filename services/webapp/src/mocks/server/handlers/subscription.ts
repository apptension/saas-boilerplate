import { rest } from 'msw';
import {
  SubscriptionGetApiResponseData,
  SubscriptionUpdateApiRequestData,
  SubscriptionUpdateApiResponseData,
} from '../../../shared/services/api/subscription/types';
import { SUBSCRIPTION_URL } from '../../../shared/services/api/subscription';
const baseUrl = process.env.REACT_APP_BASE_API_URL;

export const mockGetSubscription = (response: SubscriptionGetApiResponseData) => {
  return rest.get<void, SubscriptionGetApiResponseData>([baseUrl, SUBSCRIPTION_URL].join(''), (req, res, ctx) =>
    res(ctx.json(response))
  );
};

export const mockUpdateSubscription = (response: SubscriptionUpdateApiResponseData) => {
  return rest.put<SubscriptionUpdateApiRequestData, SubscriptionUpdateApiResponseData>(
    [baseUrl, SUBSCRIPTION_URL].join(''),
    (req, res, ctx) => res(ctx.json(response))
  );
};
