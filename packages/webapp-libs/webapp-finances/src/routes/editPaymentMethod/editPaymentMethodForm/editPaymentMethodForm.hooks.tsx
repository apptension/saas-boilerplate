import { useMutation } from '@apollo/client';
import { StripePaymentMethodType } from '@sb/webapp-api-client/api/stripe/paymentMethod';
import { StripeSetupIntentFragmentFragment } from '@sb/webapp-api-client/graphql';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { GraphQLError } from 'graphql';

import { StripePaymentMethodSelection, StripePaymentMethodSelectionType } from '../../../components/stripe';
import { stripeCreateSetupIntentMutation } from './editPaymentMethodForm.graphql';

interface UseStripeSetupIntentProps {
  onSuccess: (data: StripeSetupIntentFragmentFragment) => void;
  onError: (error: readonly GraphQLError[]) => void;
}

export const useStripeSetupIntent = ({ onSuccess, onError }: UseStripeSetupIntentProps) => {
  const { data: currentTenant } = useCurrentTenant();
  const [commitCreateSetupIntentMutation, { data }] = useMutation(stripeCreateSetupIntentMutation, {
    onCompleted: (data) => onSuccess(data.createSetupIntent?.setupIntent as StripeSetupIntentFragmentFragment),
    onError: (error) => onError(error.graphQLErrors),
  });

  const createSetupIntent = async () => {
    if (!currentTenant) return;

    if (!data?.createSetupIntent?.setupIntent) {
      await commitCreateSetupIntentMutation({
        variables: { input: { tenantId: currentTenant.id } },
      });
    }
  };

  return { createSetupIntent };
};

interface ConfirmCardSetupProps {
  setupIntent: StripeSetupIntentFragmentFragment;
  paymentMethod: StripePaymentMethodSelection;
}

export const useStripeCardSetup = () => {
  const stripe = useStripe();
  const elements = useElements();

  const confirmCardSetup = async ({ paymentMethod, setupIntent }: ConfirmCardSetupProps) => {
    if (!stripe) {
      return null;
    }

    if (paymentMethod.type === StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD) {
      if (paymentMethod.savedPaymentMethod.type === StripePaymentMethodType.Card.toString()) {
        return await stripe.confirmCardSetup(setupIntent.clientSecret, {
          payment_method: paymentMethod.savedPaymentMethod.id,
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
            billing_details: { name: paymentMethod.newCard?.name },
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
