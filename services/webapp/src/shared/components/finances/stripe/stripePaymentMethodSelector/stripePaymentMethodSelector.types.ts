import { StripeElementChangeEvent } from '@stripe/stripe-js';
import { StripePaymentMethod } from '../../../../services/api/stripe/paymentMethod';
import { stripePaymentMethodFragment$data } from '../../../../../modules/stripe/__generated__/stripePaymentMethodFragment.graphql';

export enum StripePaymentMethodSelectionType {
  SAVED_PAYMENT_METHOD,
  NEW_CARD,
}

export type StripeBillingInfoChangeEvent = {
  elementType: 'name';
  value: string;
};

export type StripePaymentMethodChangeEvent =
  | {
      type: StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD;
      data: StripePaymentMethod | stripePaymentMethodFragment$data;
    }
  | {
      type: StripePaymentMethodSelectionType.NEW_CARD;
      data: StripeBillingInfoChangeEvent | StripeElementChangeEvent | null;
    };

export type StripePaymentMethodSelection =
  | {
      type: StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD;
      data: stripePaymentMethodFragment$data;
    }
  | {
      type: StripePaymentMethodSelectionType.NEW_CARD;
      data: {
        name: string;
        cardErrors: Record<string, any>;
        cardMissingFields: Record<string, boolean>;
      };
    };

export type PaymentFormFields = { paymentMethod: StripePaymentMethodSelection };
