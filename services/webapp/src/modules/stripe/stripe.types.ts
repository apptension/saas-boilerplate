import { StripePaymentMethod } from '../../shared/services/api/stripe/paymentMethod';

export interface StripeState {
  paymentMethods: StripePaymentMethod[];
}

export type FetchStripePaymentMethodsSuccessPayload = StripePaymentMethod[];
