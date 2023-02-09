import { useMutation } from '@apollo/client';
import { useState } from 'react';

import { TestProduct } from '../../../../modules/stripe/stripe.types';
import { useApiForm } from '../../../hooks/useApiForm';
import { StripePaymentIntentType } from '../../../services/graphqlApi/__generated/gql/graphql';
import { useStripePayment } from './stripePayment.stripe.hook';
import {
  STRIPE_CREATE_PAYMENT_INTENT_MUTATION,
  STRIPE_UPDATE_PAYMENT_INTENT_MUTATION,
} from './stripePaymentForm/stripePaymentForm.graphql';
import {
  STRIPE_DELETE_PAYMENT_METHOD_MUTATION,
  STRIPE_UPDATE_PAYMENT_METHOD_MUTATION,
} from './stripePaymentMethodSelector/stripePaymentMethodSelector.graphql';
import {
  PaymentFormFields,
  StripePaymentMethodSelection,
} from './stripePaymentMethodSelector/stripePaymentMethodSelector.types';

interface UseStripePaymentMethodsProps {
  onUpdateSuccess?: () => void;
}

export const useStripePaymentMethods = (props: UseStripePaymentMethodsProps = {}) => {
  const onUpdateSuccess = props.onUpdateSuccess;

  const [commitDeletePaymentMethodMutation] = useMutation(STRIPE_DELETE_PAYMENT_METHOD_MUTATION, {
    update(cache, { data }) {
      cache.modify({
        fields: {
          allPaymentMethods(existingConnection = { edges: [] }) {
            const deletedId = data?.deletePaymentMethod?.deletedIds?.[0];
            if (!deletedId) return existingConnection;

            const normalizedId = cache.identify({ id: deletedId, __typename: 'StripePaymentMethodType' });
            return {
              ...existingConnection,
              edges: existingConnection.edges.filter(({ node }) => node.__ref !== normalizedId),
            };
          },
        },
      });
    },
  });

  const [commitUpdateDefaultPaymentMethodMutation] = useMutation(STRIPE_UPDATE_PAYMENT_METHOD_MUTATION, {
    onCompleted: () => onUpdateSuccess?.(),
  });

  const deletePaymentMethod = (id: string) => {
    commitDeletePaymentMethodMutation({
      variables: {
        input: {
          id,
        },
      },
    });
  };

  const updateDefaultPaymentMethod = (id: string) => {
    commitUpdateDefaultPaymentMethodMutation({
      variables: {
        input: {
          id,
        },
      },
    });
  };

  return { deletePaymentMethod, updateDefaultPaymentMethod };
};

type StripePaymentFormFields = PaymentFormFields & {
  product: TestProduct;
};

export type UseStripePaymentIntentProps = (paymentIntent: StripePaymentIntentType) => void;

/**
 * This react hook is responsible for tracking whether a payment intent has already been created in the current
 * component. It uses component's state to determine if the payment intent needs to be created or updated.
 *
 * The idea is that you should not create multiple payment intents even if the customer changes a product. This allows
 * analysts to track how customers behave.
 *
 */
export const useStripePaymentIntent = (onSuccess: UseStripePaymentIntentProps) => {
  const [paymentIntent, setPaymentIntent] = useState<StripePaymentIntentType | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<StripePaymentMethodSelection | null>(null);
  const { confirmPayment } = useStripePayment();

  const apiFormControls = useApiForm<StripePaymentFormFields>({
    mode: 'onChange',
  });
  const { setGenericError, setApolloGraphQLResponseErrors, handleSubmit } = apiFormControls;

  const [commitCreatePaymentIntentMutation, { loading: createLoading }] = useMutation(
    STRIPE_CREATE_PAYMENT_INTENT_MUTATION,
    {
      onCompleted: ({ createPaymentIntent }) => {
        handleCompletedPaymentIntent(createPaymentIntent?.paymentIntent as StripePaymentIntentType);
      },
      onError: (error) => {
        setApolloGraphQLResponseErrors(error.graphQLErrors);
      },
    }
  );

  const [commitUpdatePaymentIntentMutation, { loading: updateLoading }] = useMutation(
    STRIPE_UPDATE_PAYMENT_INTENT_MUTATION,
    {
      onCompleted: ({ updatePaymentIntent }) =>
        handleCompletedPaymentIntent(updatePaymentIntent?.paymentIntent as StripePaymentIntentType),
      onError: (error) => {
        setApolloGraphQLResponseErrors(error.graphQLErrors);
      },
    }
  );

  const handleCompletedPaymentIntent = async (responsePaymentIntent: StripePaymentIntentType) => {
    if (!responsePaymentIntent || !paymentMethod) return;
    setPaymentIntent(responsePaymentIntent);

    const confirmPayload = {
      paymentMethod: paymentMethod,
      paymentIntent: responsePaymentIntent,
    };

    const result = await confirmPayment(confirmPayload);
    if (!result) return;
    if (result.error) return setGenericError(result.error.message);
    if (result.paymentIntent?.status === 'succeeded') onSuccess(responsePaymentIntent);
  };

  /**
   * This function is responsible for creating a new payment intent and updating it if it has been created before.
   *
   * @param product This product will be passed to the payment intent create and update API endpoints. Backend should
   * handle amount and currency update based on the ID of this product.
   */
  const updateOrCreatePaymentIntent = (product: TestProduct) => {
    if (!paymentIntent) {
      commitCreatePaymentIntentMutation({
        variables: {
          input: {
            product,
          },
        },
      });
      return;
    }

    commitUpdatePaymentIntentMutation({
      variables: {
        input: {
          product,
          id: paymentIntent.id,
        },
      },
    });
  };

  const onSubmit = handleSubmit(async (data: StripePaymentFormFields) => {
    setPaymentMethod(data.paymentMethod);
    updateOrCreatePaymentIntent(data.product);
  });

  return { paymentIntent, apiFormControls, onSubmit, loading: createLoading || updateLoading };
};
