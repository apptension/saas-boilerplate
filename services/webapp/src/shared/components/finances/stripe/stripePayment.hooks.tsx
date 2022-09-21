import { useState } from 'react';
import { CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { ConnectionHandler, readInlineData } from 'relay-runtime';
import { StripePaymentMethodType } from '../../../services/api/stripe/paymentMethod';
import { usePromiseMutation } from '../../../services/graphqlApi/usePromiseMutation';
import stripeDeletePaymentMethodMutationGraphql, {
  stripeDeletePaymentMethodMutation,
} from '../../../../modules/stripe/__generated__/stripeDeletePaymentMethodMutation.graphql';
import stripeUpdateDefaultPaymentMethodMutationGraphql, {
  stripeUpdateDefaultPaymentMethodMutation,
} from '../../../../modules/stripe/__generated__/stripeUpdateDefaultPaymentMethodMutation.graphql';
import stripeCreatePaymentIntentMutationGraphql, {
  stripeCreatePaymentIntentMutation,
} from '../../../../modules/stripe/__generated__/stripeCreatePaymentIntentMutation.graphql';
import stripePaymentIntentFragmentGraphql, {
  stripePaymentIntentFragment$data,
  stripePaymentIntentFragment$key,
} from '../../../../modules/stripe/__generated__/stripePaymentIntentFragment.graphql';
import stripeUpdatePaymentIntentMutationGraphql, {
  stripeUpdatePaymentIntentMutation,
} from '../../../../modules/stripe/__generated__/stripeUpdatePaymentIntentMutation.graphql';
import { TestProduct } from '../../../../modules/stripe/stripe.types';
import {
  StripePaymentMethodSelection,
  StripePaymentMethodSelectionType,
} from './stripePaymentMethodSelector/stripePaymentMethodSelector.types';
import { UpdateOrCreatePaymentIntentResult } from './stripePayment.types';

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
  const [paymentIntent, setPaymentIntent] = useState<stripePaymentIntentFragment$data | null>(null);

  const [commitCreatePaymentIntentMutation] = usePromiseMutation<stripeCreatePaymentIntentMutation>(
    stripeCreatePaymentIntentMutationGraphql
  );

  const [commitUpdatePaymentIntentMutation] = usePromiseMutation<stripeUpdatePaymentIntentMutation>(
    stripeUpdatePaymentIntentMutationGraphql
  );

  const readPaymentIntentData = (fragmentRef: stripePaymentIntentFragment$key | null) => {
    return readInlineData<stripePaymentIntentFragment$key>(
      // @ts-ignore
      stripePaymentIntentFragmentGraphql,
      fragmentRef
    );
  };

  /**
   * This function is responsible for creating a new payment intent and updating it if it has been created before.
   *
   * @param product This product will be passed to the payment intent create and update API endpoints. Backend should
   * handle amount and currency update based on the ID of this product.
   */
  const updateOrCreatePaymentIntent = async (
    product: TestProduct
  ): Promise<UpdateOrCreatePaymentIntentResult | undefined> => {
    try {
      if (!paymentIntent) {
        const result = await commitCreatePaymentIntentMutation({
          variables: {
            input: {
              product,
            },
          },
        });
        const { errors, response } = result;
        if (!errors) {
          const paymentIntent = readPaymentIntentData(response.createPaymentIntent?.paymentIntent ?? null);
          setPaymentIntent(paymentIntent);
          return { ...result, paymentIntent };
        }
        return result;
      }

      const result = await commitUpdatePaymentIntentMutation({
        variables: {
          input: {
            product,
            id: paymentIntent.id,
          },
        },
      });
      const { errors, response } = result;
      if (!errors) {
        const paymentIntent = readPaymentIntentData(response.updatePaymentIntent?.paymentIntent ?? null);
        setPaymentIntent(paymentIntent);
        return { ...result, paymentIntent };
      }
      return result;
    } catch {}
    return;
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
    paymentIntent: stripePaymentIntentFragment$data;
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
