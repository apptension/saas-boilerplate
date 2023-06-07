import { StripePaymentMethodType } from '@sb/webapp-api-client/api/stripe/paymentMethod';
import { StripePaymentIntentType } from '@sb/webapp-api-client/graphql';
import { CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useIntl } from 'react-intl';

import {
  StripePaymentMethodSelection,
  StripePaymentMethodSelectionType,
} from './stripePaymentMethodSelector/stripePaymentMethodSelector.types';

interface ConfirmPaymentProps {
  paymentIntent: StripePaymentIntentType;
  paymentMethod: StripePaymentMethodSelection;
}

export const useStripePayment = () => {
  const stripe = useStripe();
  const elements = useElements();
  const intl = useIntl();

  const confirmPayment = async ({ paymentMethod, paymentIntent }: ConfirmPaymentProps) => {
    if (!stripe) return null;

    if (paymentMethod.type === StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD) {
      if (!paymentMethod.savedPaymentMethod.pk) {
        return {
          error: {
            message: intl.formatMessage({
              defaultMessage: 'Wrong payment method used',
              id: 'Stripe / Confirm payment / Wrong payment method',
            }),
          },
          paymentIntent: null,
        };
      }

      if (paymentMethod.savedPaymentMethod.type === StripePaymentMethodType.Card.toString()) {
        return await stripe.confirmCardPayment(paymentIntent.clientSecret, {
          payment_method: paymentMethod.savedPaymentMethod.pk,
        });
      }

      // Handle additional saved payment methods confirmation here
      return {
        error: {
          message: intl.formatMessage({
            defaultMessage: 'Unknown payment method used',
            id: 'Stripe / Confirm payment / Unknown payment method',
          }),
        },
        paymentIntent: null,
      };
    }

    if (paymentMethod.type === StripePaymentMethodSelectionType.NEW_CARD) {
      const card = elements?.getElement(CardNumberElement) ?? null;
      if (card) {
        return await stripe.confirmCardPayment(paymentIntent.clientSecret, {
          payment_method: {
            card,
            billing_details: { name: paymentMethod.newCard?.name },
          },
        });
      }
    }

    // Handle additional elements payment confirmation here
    return {
      error: {
        message: intl.formatMessage({
          defaultMessage: 'No payment method selected',
          id: 'Stripe / Confirm payment / No payment method',
        }),
      },

      paymentIntent: null,
    };
  };

  return { confirmPayment };
};
