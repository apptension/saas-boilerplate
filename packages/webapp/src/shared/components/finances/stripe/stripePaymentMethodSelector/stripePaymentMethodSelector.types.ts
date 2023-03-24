import { StripePaymentMethod } from '@sb/webapp-api-client/api/stripe/paymentMethod';
import { StripePaymentMethodFragmentFragment } from '@sb/webapp-api-client/graphql';
import { StripeElementChangeEvent } from '@stripe/stripe-js';

export enum StripePaymentMethodSelectionType {
  SAVED_PAYMENT_METHOD = 'savedPaymentMethod',
  NEW_CARD = 'newCard',
}

export type StripeBillingInfoChangeEvent = {
  elementType: 'name';
  value: string;
};

export type StripePaymentMethodChangeEvent =
  | {
      type: StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD;
      data: StripePaymentMethod | StripePaymentMethodFragmentFragment;
    }
  | {
      type: StripePaymentMethodSelectionType.NEW_CARD;
      data: StripeBillingInfoChangeEvent | StripeElementChangeEvent | null;
    };

export type StripePaymentMethodSelection =
  | {
      type: StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD;
      data: StripePaymentMethodFragmentFragment;
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

type OnChangeType = (...event: any[]) => void;

export type ChangeHandlerType = (
  onChange: OnChangeType,
  value: StripePaymentMethodSelection
) => (event: StripePaymentMethodChangeEvent) => void;

export type MethodRemovedHandlerType = (
  handleChange: OnChangeType,
  value: StripePaymentMethodSelection,
  paymentMethods: StripePaymentMethodFragmentFragment[],
  deletePaymentMethod: (id: string) => void
) => (id: string) => void;
