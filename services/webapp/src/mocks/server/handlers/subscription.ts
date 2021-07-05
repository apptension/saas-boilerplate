import { rest } from 'msw';
import {
  SubscriptionGetApiResponseData,
  SubscriptionUpdateApiRequestData,
  SubscriptionUpdateApiResponseData,
} from '../../../shared/services/api/subscription/types';
import { SUBSCRIPTION_URL } from '../../../shared/services/api/subscription';

export const mockGetSubscription = (response: SubscriptionGetApiResponseData) => {
  return rest.get<void, SubscriptionGetApiResponseData>(SUBSCRIPTION_URL.INDEX, (req, res, ctx) =>
    res(ctx.json(response))
  );
};

export const mockUpdateSubscription = (response: SubscriptionUpdateApiResponseData) => {
  return rest.put<SubscriptionUpdateApiRequestData, SubscriptionUpdateApiResponseData>(
    SUBSCRIPTION_URL.INDEX,
    (req, res, ctx) => res(ctx.json(response))
  );
};
