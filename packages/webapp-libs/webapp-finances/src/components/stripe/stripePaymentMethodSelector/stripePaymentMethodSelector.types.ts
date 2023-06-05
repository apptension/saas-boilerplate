import { StripePaymentMethodFragmentFragment } from '@sb/webapp-api-client/graphql';
import { StripeElementChangeEvent } from '@stripe/stripe-js';

export enum StripePaymentMethodSelectionType {
  SAVED_PAYMENT_METHOD = 'savedPaymentMethod',
  NEW_CARD = 'newCard',
}

export type StripePaymentMethodSelection =
  | {
      type: StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD;
      savedPaymentMethod: StripePaymentMethodFragmentFragment;
    }
  | {
      type: StripePaymentMethodSelectionType.NEW_CARD;
      newCard: {
        name: string;
        cardNumber: StripeElementChangeEvent;
        cardExpiry: StripeElementChangeEvent;
        cardCvc: StripeElementChangeEvent;
      };
    };

export type PaymentFormFields = {
  readonly paymentMethod: StripePaymentMethodSelection;
};
