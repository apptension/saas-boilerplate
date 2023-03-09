import { StripeElementChangeEvent } from '@stripe/stripe-js';

import { StripePaymentMethodFragmentFragment } from '../../../../../shared/services/graphqlApi/__generated/gql/graphql';
import {
  ChangeHandlerType,
  MethodRemovedHandlerType,
  StripePaymentMethodSelectionType,
} from './stripePaymentMethodSelector.types';

export const changeHandler: ChangeHandlerType = (onChange, value) => (event) => {
  if (event.type !== StripePaymentMethodSelectionType.NEW_CARD) {
    return onChange(event);
  }

  const data =
    value.type === StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD
      ? {
          cardMissingFields: {
            cardNumber: true,
            cardExpiry: true,
            cardCvc: true,
          },
        }
      : value.data;

  if (event.data?.elementType === 'name') {
    return onChange({ type: event.type, data: { ...data, name: event.data.value } });
  }

  if (typeof event.data?.elementType === 'string') {
    const stripeFieldData = event.data as StripeElementChangeEvent;
    const fieldName = stripeFieldData.elementType;
    const cardErrors = (value?.data as any)?.cardErrors ?? {};

    return onChange({
      type: event.type,
      data: {
        ...data,
        cardErrors: { ...cardErrors, [fieldName]: stripeFieldData?.error },
        cardMissingFields: {
          ...data.cardMissingFields,
          [fieldName]: !!stripeFieldData?.empty,
        },
      },
    });
  }

  onChange({ type: event.type, data });
};

export const methodRemovedHandler: MethodRemovedHandlerType =
  (handleChange, value, paymentMethods, deletePaymentMethod) => (id: string) => {
    if (paymentMethods.length === 1) {
      handleChange({
        type: StripePaymentMethodSelectionType.NEW_CARD,
        data: null,
      });
    }

    if ((value.data as StripePaymentMethodFragmentFragment).id === id) {
      handleChange({
        type: StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD,
        data: paymentMethods.filter((method) => method.id !== id)[0],
      });
    }

    deletePaymentMethod(id);
  };
