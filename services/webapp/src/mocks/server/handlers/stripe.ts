import { rest, DefaultBodyType, PathParams } from 'msw';
import {
  StripeSetupIntentGetApiResponseData,
  StripeSetupIntentCreateApiResponseData,
} from '../../../shared/services/api/stripe/setupIntent/types';
import { STRIPE_SETUP_INTENT_URL } from '../../../shared/services/api/stripe/setupIntent';

export const mockGetSetupIntent = (response: StripeSetupIntentGetApiResponseData) =>
  rest.get<DefaultBodyType, PathParams, StripeSetupIntentGetApiResponseData>(
    STRIPE_SETUP_INTENT_URL.GET({ id: ':id' }),
    (req, res, ctx) => {
      return res(ctx.json(response));
    }
  );

export const mockCreateSetupIntent = (response: StripeSetupIntentCreateApiResponseData) =>
  rest.post<DefaultBodyType, PathParams, StripeSetupIntentCreateApiResponseData>(
    STRIPE_SETUP_INTENT_URL.CREATE,
    (req, res, ctx) => {
      return res(ctx.json(response));
    }
  );
