import { useState } from 'react';
import { CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { ConnectionHandler } from 'relay-runtime';
import { StripePaymentIntent, TestProduct } from '../../../services/api/stripe/paymentIntent';
import { StripePaymentMethodType } from '../../../services/api/stripe/paymentMethod';
import { stripe as stripeApi } from '../../../services/api';
import { usePromiseMutation } from '../../../services/graphqlApi/usePromiseMutation';
import stripeDeletePaymentMethodMutationGraphql, {
  stripeDeletePaymentMethodMutation,
} from '../../../../modules/stripe/__generated__/stripeDeletePaymentMethodMutation.graphql';
import stripeUpdateDefaultPaymentMethodMutationGraphql, {
  stripeUpdateDefaultPaymentMethodMutation,
} from '../../../../modules/stripe/__generated__/stripeUpdateDefaultPaymentMethodMutation.graphql';
import {
  StripePaymentMethodSelection,
  StripePaymentMethodSelectionType,
} from './stripePaymentMethodSelector/stripePaymentMethodSelector.types';

export const useStripePaymentMethods = () => {
  const [commitDeletePaymentMethodMutation] = usePromiseMutation<stripeDeletePaymentMethodMutation>(
    stripeDeletePaymentMethodMutationGraphql
  );

  const [commitUpdateDefaultPaymentMethodMutation] = usePromiseMutation<stripeUpdateDefaultPaymentMethodMutation>(
    stripeUpdateDefaultPaymentMethodMutationGraphql
  );

  const deletePaymentMethod = async (id: string) => {
    try {
      await commitDeletePaymentMethodMutation({
        variables: {
          input: {
            id,
          },
          connections: [ConnectionHandler.getConnectionID('root', 'stripe_allPaymentMethods')],
        },
      });
    } catch {}
  };

  const updateDefaultPaymentMethod = async (id: string) => {
    try {
      await commitUpdateDefaultPaymentMethodMutation({
        variables: {
          input: {
            id,
          },
          connections: [ConnectionHandler.getConnectionID('root', 'stripe_allPaymentMethods')],
        },
      });
    } catch {}
  };

  return { deletePaymentMethod, updateDefaultPaymentMethod };
};

/**
 * This react hook is responsible for tracking whether a payment intent has already been created in the current
 * component. It uses component's state to determine if the payment intent needs to be created or updated.
 *
 * The idea is that you should not create multiple payment intents even if the customer changes a product. This allows
 * analysts to track how customers behave.
 *
 */
export const useStripePaymentIntent = () => {
  const [paymentIntent, setPaymentIntent] = useState<StripePaymentIntent | null>(null);

  /**
   * This function is responsible for creating a new payment intent and updating it if it has been created before.
   *
   * @param product This product will be passed to the payment intent create and update API endpoints. Backend should
   * handle amount and currency update based on the ID of this product.
   */
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

  /**
   *
   * @param paymentMethod
   * @param paymentIntent
   */
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
        if (!paymentMethod.data.pk)
          return {
            error: { message: 'Wrong payment method used' },
            paymentIntent: null,
          };
        return await stripe.confirmCardPayment(paymentIntent.clientSecret, {
          payment_method: paymentMethod.data.pk,
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
