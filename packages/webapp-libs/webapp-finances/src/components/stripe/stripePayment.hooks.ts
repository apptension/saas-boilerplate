import { BaseMutationOptions, useMutation } from '@apollo/client';
import { ApolloError } from '@apollo/client/errors';
import { StripePaymentIntentType } from '@sb/webapp-api-client/graphql';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { GraphQLError } from 'graphql';
import { useState } from 'react';

import { TestProduct } from '../../types';
import { useStripePayment } from './stripePayment.stripe.hook';
import {
  stripeCreatePaymentIntentMutation,
  stripeUpdatePaymentIntentMutation,
} from './stripePaymentForm/stripePaymentForm.graphql';
import {
  stripeDeletePaymentMethodMutation,
  stripeSubscriptionQuery,
  stripeUpdateDefaultPaymentMethodMutation,
} from './stripePaymentMethodSelector/stripePaymentMethodSelector.graphql';
import { PaymentFormFields } from './stripePaymentMethodSelector/stripePaymentMethodSelector.types';

interface UseStripePaymentMethodsProps {
  onUpdateSuccess?: () => void;
}

export const useStripePaymentMethods = ({ onUpdateSuccess }: UseStripePaymentMethodsProps = {}) => {
  const { data: currentTenant } = useCurrentTenant();
  const [commitDeletePaymentMethodMutation] = useMutation(stripeDeletePaymentMethodMutation, {
    update(cache, { data }) {
      const deletedId = data?.deletePaymentMethod?.deletedIds?.[0];
      const normalizedId = cache.identify({ id: deletedId, __typename: 'StripePaymentMethodType' });
      cache.evict({ id: normalizedId });
      cache.gc();
    },
  });

  const [commitUpdateDefaultPaymentMethodMutation] = useMutation(stripeUpdateDefaultPaymentMethodMutation, {
    onCompleted: () => onUpdateSuccess?.(),
    update(cache, { data }) {
      const newPaymentMethod = data?.updateDefaultPaymentMethod?.paymentMethodEdge?.node;
      if (!newPaymentMethod) return;

      const normalizedId = cache.identify({ id: newPaymentMethod.id, __typename: 'StripePaymentMethodType' });
      const { allPaymentMethods } = cache.readQuery({ query: stripeSubscriptionQuery }) ?? {};
      const isAlreadyInConnection = allPaymentMethods?.edges?.some((edge) => edge?.node?.id === newPaymentMethod.id);

      if (isAlreadyInConnection) return;

      cache.modify({
        fields: {
          allPaymentMethods(existingConnection) {
            return {
              ...existingConnection,
              edges: [...(existingConnection?.edges ?? []), { node: { __ref: normalizedId } }],
            };
          },
        },
      });
    },
  });

  const deletePaymentMethod = async (id: string) => {
    if (!currentTenant) return;

    return await commitDeletePaymentMethodMutation({
      variables: { input: { id, tenantId: currentTenant.id } },
    });
  };

  const updateDefaultPaymentMethod = async (id: string) => {
    if (!currentTenant) return;

    return await commitUpdateDefaultPaymentMethodMutation({
      variables: { input: { id, tenantId: currentTenant.id } },
    });
  };

  return { deletePaymentMethod, updateDefaultPaymentMethod };
};

interface StripePaymentFormFields extends PaymentFormFields {
  product: TestProduct;
}

export const useStripePaymentIntent = (onError: (error: ApolloError, clientOptions?: BaseMutationOptions) => void) => {
  const { data: currentTenant } = useCurrentTenant();
  const [paymentIntent, setPaymentIntent] = useState<StripePaymentIntentType | undefined | null>(null);

  const [commitCreatePaymentIntentMutation, { loading: createLoading }] = useMutation(
    stripeCreatePaymentIntentMutation,
    { onError }
  );

  const [commitUpdatePaymentIntentMutation, { loading: updateLoading }] = useMutation(
    stripeUpdatePaymentIntentMutation,
    { onError }
  );

  /**
   * This function is responsible for creating a new payment intent and updating it if it has been created before.
   *
   * @param product This product will be passed to the payment intent create and update API endpoints. Backend should
   * handle amount and currency update based on the ID of this product.
   */
  const updateOrCreatePaymentIntent = async (
    product: TestProduct
  ): Promise<{ errors?: readonly GraphQLError[]; paymentIntent?: StripePaymentIntentType | null }> => {
    if (!currentTenant) return {};
    if (!paymentIntent) {
      const { data, errors } = await commitCreatePaymentIntentMutation({
        variables: {
          input: {
            product,
            tenantId: currentTenant.id,
          },
        },
      });
      if (errors) {
        return { errors };
      }
      setPaymentIntent(data?.createPaymentIntent?.paymentIntent);
      return { paymentIntent: data?.createPaymentIntent?.paymentIntent };
    }

    const { data, errors } = await commitUpdatePaymentIntentMutation({
      variables: {
        input: {
          product,
          id: paymentIntent.id,
          tenantId: currentTenant.id,
        },
      },
    });

    if (errors) {
      return { errors };
    }

    return { paymentIntent: data?.updatePaymentIntent?.paymentIntent };
  };

  return { updateOrCreatePaymentIntent, loading: createLoading || updateLoading };
};

/**
 * This react hook is responsible for tracking whether a payment intent has already been created in the current
 * component. It uses component's state to determine if the payment intent needs to be created or updated.
 *
 * The idea is that you should not create multiple payment intents even if the customer changes a product. This allows
 * analysts to track how customers behave.
 *
 */
export const useStripePaymentForm = (onSuccess: (paymentIntent: StripePaymentIntentType) => void) => {
  const { confirmPayment } = useStripePayment();

  const { updateOrCreatePaymentIntent, loading } = useStripePaymentIntent((error) => {
    setApolloGraphQLResponseErrors(error.graphQLErrors);
  });

  const apiFormControls = useApiForm<StripePaymentFormFields>({
    mode: 'onChange',
  });
  const { setGenericError, setApolloGraphQLResponseErrors, handleSubmit } = apiFormControls;

  const onSubmit = handleSubmit(async (data: StripePaymentFormFields) => {
    const { paymentIntent } = await updateOrCreatePaymentIntent(data.product);
    if (!paymentIntent) return;

    const confirmResult = await confirmPayment({
      paymentMethod: data.paymentMethod,
      paymentIntent: paymentIntent,
    });
    if (!confirmResult) return;
    if (confirmResult.error) return setGenericError(confirmResult.error.message);

    trackEvent('payment', 'make-payment', confirmResult.paymentIntent.status);

    if (confirmResult.paymentIntent?.status === 'succeeded') onSuccess(paymentIntent);
  });

  return { apiFormControls, onSubmit, loading };
};
