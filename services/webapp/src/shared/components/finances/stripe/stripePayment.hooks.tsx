import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js';

import { useAsyncDispatch } from '../../../utils/reduxSagaPromise';
import { stripeActions } from '../../../../modules/stripe';
import { selectStripePaymentMethods } from '../../../../modules/stripe/stripe.selectors';
import { StripePaymentIntent, TestProduct } from '../../../services/api/stripe/paymentIntent';
import { StripePaymentMethodType } from '../../../services/api/stripe/paymentMethod';
import { stripe as stripeApi } from '../../../services/api';
import {
  StripePaymentMethodSelection,
  StripePaymentMethodSelectionType,
} from './stripePaymentMethodSelector/stripePaymentMethodSelector.types';

export const useStripePaymentMethods = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAsyncDispatch();
  const paymentMethods = useSelector(selectStripePaymentMethods);

  const deletePaymentMethod = async (id: string) => {
    try {
      await dispatch(stripeActions.deleteStripePaymentMethod(id));
    } catch {}
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await dispatch(stripeActions.fetchStripePaymentMethods());
      setIsLoading(false);
    })();
  }, [dispatch]);

  return { isLoading, paymentMethods, deletePaymentMethod };
};

/**
 * You should only create one payment intent per payment session
 * and update the amount when necessary.
 */
export const useStripePaymentIntent = () => {
  const [paymentIntent, setPaymentIntent] = useState<StripePaymentIntent | null>(null);

  const updateOrCreatePaymentIntent = async (product: TestProduct) => {
    if (!paymentIntent) {
      const response = await stripeApi.paymentIntent.create({ product });
      if (!response.isError) {
        setPaymentIntent(response);
      }
      return response;
    }

    const response = await stripeApi.paymentIntent.update(paymentIntent.id, { product });
    if (!response.isError) {
      setPaymentIntent(response);
    }
    return response;
  };

  return { paymentIntent, updateOrCreatePaymentIntent };
};

export const useStripePayment = () => {
  const stripe = useStripe();
  const elements = useElements();

  const confirmPayment = async ({
    paymentMethod,
    paymentIntent,
  }: {
    paymentIntent: StripePaymentIntent;
    paymentMethod: StripePaymentMethodSelection;
  }) => {
    if (!stripe) {
      return null;
    }

    if (paymentMethod.type === StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD) {
      if (paymentMethod.data.type === StripePaymentMethodType.Card) {
        return await stripe.confirmCardPayment(paymentIntent.clientSecret, {
          payment_method: paymentMethod.data.id,
        });
      }

      // Handle additional saved payment methods confirmation here

      return {
        error: { message: 'Unknown payment method used' },
        paymentIntent: null,
      };
    }

    if (paymentMethod.type === StripePaymentMethodSelectionType.NEW_CARD) {
      const card = elements?.getElement(CardNumberElement) ?? null;
      if (card) {
        return await stripe.confirmCardPayment(paymentIntent.clientSecret, {
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
      paymentIntent: null,
    };
  };

  return { confirmPayment };
};
