import { rest } from 'msw';
import { StripePaymentIntentGetApiResponseData } from '../../../shared/services/api/stripe/paymentIntent';
import { paymentIntent, paymentMethod } from '../../../shared/services/api/stripe';
import { StripePaymentMethodGetApiResponseData } from '../../../shared/services/api/stripe/paymentMethod';
import {
  StripeSetupIntentGetApiResponseData,
  StripeSetupIntentCreateApiResponseData,
} from '../../../shared/services/api/stripe/setupIntent/types';
import { STRIPE_SETUP_INTENT_URL } from '../../../shared/services/api/stripe/setupIntent';

const baseUrl = process.env.REACT_APP_BASE_API_URL;

export const mockGetSetupIntent = (response: StripeSetupIntentGetApiResponseData) =>
  rest.get<void, StripeSetupIntentGetApiResponseData>([baseUrl, STRIPE_SETUP_INTENT_URL].join(''), (req, res, ctx) => {
    return res(ctx.json(response));
  });

export const mockCreateSetupIntent = (response: StripeSetupIntentCreateApiResponseData) =>
  rest.post<void, StripeSetupIntentCreateApiResponseData>(
    [baseUrl, STRIPE_SETUP_INTENT_URL].join(''),
    (req, res, ctx) => {
      return res(ctx.json(response));
    }
  );

export const mockGetStripePaymentIntent = (response: StripePaymentIntentGetApiResponseData) =>
  rest.get<void, StripePaymentIntentGetApiResponseData>(
    [baseUrl, paymentIntent.STRIPE_PAYMENT_INTENT_URL].join(''),
    (req, res, ctx) => {
      return res(ctx.json(response));
    }
  );

export const mockCreateStripePaymentIntent = (response: StripePaymentIntentGetApiResponseData) =>
  rest.post<void, StripePaymentIntentGetApiResponseData>(
    [baseUrl, paymentIntent.STRIPE_PAYMENT_INTENT_URL].join(''),
    (req, res, ctx) => {
      return res(ctx.json(response));
    }
  );

export const mockUpdateStripePaymentIntent = (response: StripePaymentIntentGetApiResponseData) =>
  rest.put<void, StripePaymentIntentGetApiResponseData>(
    [baseUrl, paymentIntent.STRIPE_PAYMENT_INTENT_URL].join(''),
    (req, res, ctx) => {
      return res(ctx.json(response));
    }
  );

export const mockGetStripePaymentMethods = (response: StripePaymentMethodGetApiResponseData[]) =>
  rest.get<void, StripePaymentMethodGetApiResponseData[]>(
    [baseUrl, paymentMethod.STRIPE_PAYMENT_METHOD_URL].join(''),
    (req, res, ctx) => {
      return res(ctx.json(response));
    }
  );
