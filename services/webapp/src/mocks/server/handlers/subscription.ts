import { rest, DefaultBodyType, PathParams } from 'msw';
import {
  SubscriptionGetApiResponseData,
  SubscriptionUpdateApiRequestData,
  SubscriptionUpdateApiResponseData,
} from '../../../shared/services/api/subscription/types';
import { SUBSCRIPTION_URL } from '../../../shared/services/api/subscription';

export const mockGetSubscription = (response: SubscriptionGetApiResponseData) => {
  return rest.get<DefaultBodyType, PathParams, SubscriptionGetApiResponseData>(SUBSCRIPTION_URL.INDEX, (req, res, ctx) =>
    res(ctx.json(response))
  );
};

export const mockUpdateSubscription = (response: SubscriptionUpdateApiResponseData) => {
  return rest.put<SubscriptionUpdateApiRequestData, PathParams, SubscriptionUpdateApiResponseData>(
    SUBSCRIPTION_URL.INDEX,
    (req, res, ctx) => res(ctx.json(response))
  );
};
