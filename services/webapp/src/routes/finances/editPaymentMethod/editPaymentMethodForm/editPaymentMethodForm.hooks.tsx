import { useState } from 'react';
import { CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { StripeSetupIntent } from '../../../../shared/services/api/stripe/setupIntent/types';
import { stripe as stripeApi } from '../../../../shared/services/api';
import {
  StripePaymentMethodSelection,
  StripePaymentMethodSelectionType,
} from '../../../../shared/components/finances/stripe/stripePaymentMethodSelector/stripePaymentMethodSelector.types';
import { StripePaymentMethodType } from '../../../../shared/services/api/stripe/paymentMethod';

export const useStripeSetupIntent = () => {
  const [setupIntent, setSetupIntent] = useState<StripeSetupIntent | null>(null);

  const createSetupIntent = async () => {
    if (!setupIntent) {
      const response = await stripeApi.setupIntent.create();
      if (!response.isError) {
        setSetupIntent(response);
      }
      return response;
    }

    return { ...setupIntent, isError: false };
  };

  return { setupIntent, createSetupIntent };
};

export const useStripeCardSetup = () => {
  const stripe = useStripe();
  const elements = useElements();

  const confirmCardSetup = async ({
    paymentMethod,
    setupIntent,
  }: {
    setupIntent: StripeSetupIntent;
    paymentMethod: StripePaymentMethodSelection;
  }) => {
    if (!stripe) {
      return null;
    }

    if (paymentMethod.type === StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD) {
      if (paymentMethod.data.type === StripePaymentMethodType.Card) {
        return await stripe.confirmCardSetup(setupIntent.clientSecret, {
          payment_method: paymentMethod.data.id,
        });
      }

      // Handle additional saved payment methods confirmation here

      return {
        error: { message: 'Unknown payment method used' },
        setupIntent: null,
      };
    }

    if (paymentMethod.type === StripePaymentMethodSelectionType.NEW_CARD) {
      const card = elements?.getElement(CardNumberElement) ?? null;
      if (card) {
        return await stripe.confirmCardSetup(setupIntent.clientSecret, {
          payment_method: {
            card,
            billing_details: { name: paymentMethod.data?.name },
          },
        });
      }
    }

    // Handle additional elements payment confirmation here

    return {
      error: { message: 'No payment  method selected' },
      setupIntent: null,
    };
  };

  return { confirmCardSetup };
};
