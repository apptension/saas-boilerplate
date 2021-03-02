import { StripeElementChangeEvent } from '@stripe/stripe-js';

import { StripePaymentMethod } from '../../../../services/api/stripe/paymentMethod';

export enum StripePaymentMethodSelectionType {
  SAVED_PAYMENT_METHOD,
  NEW_CARD,
}

export type StripePaymentMethodSelection =
  | {
      type: StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD;
      data: StripePaymentMethod;
    }
  | {
      type: StripePaymentMethodSelectionType.NEW_CARD;
      data: StripeElementChangeEvent | null;
    };
