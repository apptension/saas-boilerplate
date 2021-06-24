import { StripeElementChangeEvent } from '@stripe/stripe-js';
import { NestedValue } from 'react-hook-form';
import { StripePaymentMethod } from '../../../../services/api/stripe/paymentMethod';
import { useApiForm } from '../../../../hooks/useApiForm';

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
      data: StripePaymentMethod;
    }
  | {
      type: StripePaymentMethodSelectionType.NEW_CARD;
      data: StripeBillingInfoChangeEvent | StripeElementChangeEvent | null;
    };

export type StripePaymentMethodSelection =
  | {
      type: StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD;
      data: StripePaymentMethod;
    }
  | {
      type: StripePaymentMethodSelectionType.NEW_CARD;
      data: {
        name: string;
        cardErrors: Record<string, any>;
        cardMissingFields: Record<string, boolean>;
      };
    };

export type PaymentFormFields = { paymentMethod: NestedValue<StripePaymentMethodSelection> };

const usePaymentMethodApiForm = <T extends PaymentFormFields>() => useApiForm<T>();
export type PaymentMethodApiFormControls = ReturnType<typeof usePaymentMethodApiForm>;
