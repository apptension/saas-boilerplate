import { useMutation } from '@apollo/client';
import { CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { GraphQLError } from 'graphql';

import {
  StripePaymentMethodSelection,
  StripePaymentMethodSelectionType,
} from '../../../../shared/components/finances/stripe/stripePaymentMethodSelector/stripePaymentMethodSelector.types';
import { StripePaymentMethodType } from '../../../../shared/services/api/stripe/paymentMethod';
import { StripeSetupIntentFragmentFragment } from '../../../../shared/services/graphqlApi/__generated/gql/graphql';
import { stripeCreateSetupIntentMutation } from './editPaymentMethodForm.graphql';

interface UseStripeSetupIntentProps {
  onSuccess: (data: StripeSetupIntentFragmentFragment) => void;
  onError: (error: readonly GraphQLError[]) => void;
}

export const useStripeSetupIntent = ({ onSuccess, onError }: UseStripeSetupIntentProps) => {
  const [commitCreateSetupIntentMutation, { data }] = useMutation(stripeCreateSetupIntentMutation, {
    onCompleted: (data) => onSuccess(data.createSetupIntent?.setupIntent as StripeSetupIntentFragmentFragment),
    onError: (error) => onError(error.graphQLErrors),
  });

  const createSetupIntent = () => {
    if (!data?.createSetupIntent?.setupIntent) commitCreateSetupIntentMutation({ variables: { input: {} } });
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
      if (paymentMethod.data.type === (StripePaymentMethodType.Card as string)) {
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
