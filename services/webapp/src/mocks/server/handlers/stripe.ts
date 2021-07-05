import { rest } from 'msw';
import {
  STRIPE_PAYMENT_INTENT_URL,
  StripePaymentIntentGetApiResponseData,
} from '../../../shared/services/api/stripe/paymentIntent';
import {
  STRIPE_PAYMENT_METHOD_URL,
  StripePaymentMethodGetApiResponseData,
} from '../../../shared/services/api/stripe/paymentMethod';
import {
  StripeSetupIntentGetApiResponseData,
  StripeSetupIntentCreateApiResponseData,
} from '../../../shared/services/api/stripe/setupIntent/types';
import { STRIPE_SETUP_INTENT_URL } from '../../../shared/services/api/stripe/setupIntent';

export const mockGetSetupIntent = (response: StripeSetupIntentGetApiResponseData) =>
  rest.get<void, StripeSetupIntentGetApiResponseData>(STRIPE_SETUP_INTENT_URL.GET({ id: ':id' }), (req, res, ctx) => {
    return res(ctx.json(response));
  });

export const mockCreateSetupIntent = (response: StripeSetupIntentCreateApiResponseData) =>
  rest.post<void, StripeSetupIntentCreateApiResponseData>(STRIPE_SETUP_INTENT_URL.CREATE, (req, res, ctx) => {
    return res(ctx.json(response));
  });

export const mockGetStripePaymentIntent = (response: StripePaymentIntentGetApiResponseData) =>
  rest.get<void, StripePaymentIntentGetApiResponseData>(
    STRIPE_PAYMENT_INTENT_URL.GET({ id: ':id' }),
    (req, res, ctx) => {
      return res(ctx.json(response));
    }
  );

export const mockCreateStripePaymentIntent = (response: StripePaymentIntentGetApiResponseData) =>
  rest.post<void, StripePaymentIntentGetApiResponseData>(STRIPE_PAYMENT_INTENT_URL.CREATE, (req, res, ctx) => {
    return res(ctx.json(response));
  });

export const mockUpdateStripePaymentIntent = (response: StripePaymentIntentGetApiResponseData) =>
  rest.put<void, StripePaymentIntentGetApiResponseData>(
    STRIPE_PAYMENT_INTENT_URL.UPDATE({ id: ':id' }),
    (req, res, ctx) => {
      return res(ctx.json(response));
    }
  );

export const mockGetStripePaymentMethods = (response: StripePaymentMethodGetApiResponseData[]) =>
  rest.get<void, StripePaymentMethodGetApiResponseData[]>(STRIPE_PAYMENT_METHOD_URL.LIST, (req, res, ctx) => {
    return res(ctx.json(response));
  });
