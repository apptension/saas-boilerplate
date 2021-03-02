import { ApiFormSubmitResponse } from '../../types';

export interface StripePaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
}

export enum TestProduct {
  A = '5',
  B = '10',
  C = '15',
}

export interface StripePaymentIntentCreateApiRequestData {
  product: TestProduct;
}

export type StripePaymentIntentGetApiResponseData = StripePaymentIntent;
export type StripePaymentIntentCreateApiResponseData = ApiFormSubmitResponse<
  StripePaymentIntentCreateApiRequestData,
  StripePaymentIntent
>;
export type StripePaymentIntentUpdateApiRequestData = StripePaymentIntentCreateApiRequestData;
export type StripePaymentIntentUpdateApiResponseData = ApiFormSubmitResponse<
  StripePaymentIntentUpdateApiRequestData,
  StripePaymentIntent
>;
