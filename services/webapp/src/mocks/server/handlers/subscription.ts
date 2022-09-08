import { rest, DefaultBodyType, PathParams } from 'msw';
import { SubscriptionGetApiResponseData } from '../../../shared/services/api/subscription/types';
import { SUBSCRIPTION_URL } from '../../../shared/services/api/subscription';

export const mockGetSubscription = (response: SubscriptionGetApiResponseData) => {
  return rest.get<DefaultBodyType, PathParams, SubscriptionGetApiResponseData>(
    SUBSCRIPTION_URL.INDEX,
    (req, res, ctx) => res(ctx.json(response))
  );
};
