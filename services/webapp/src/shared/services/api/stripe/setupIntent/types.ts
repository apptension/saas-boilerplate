import { ApiFormSubmitResponse } from '../../types';

export interface StripeSetupIntent {
  id: string;
  clientSecret: string;
}

export type StripeSetupIntentGetApiResponseData = StripeSetupIntent;
export type StripeSetupIntentCreateApiResponseData = ApiFormSubmitResponse<void, StripeSetupIntent>;
