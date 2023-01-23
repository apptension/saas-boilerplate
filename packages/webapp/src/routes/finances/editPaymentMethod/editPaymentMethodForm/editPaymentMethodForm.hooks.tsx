import { useState } from 'react';
import { CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { PayloadError, readInlineData } from 'relay-runtime';
import {
  StripePaymentMethodSelection,
  StripePaymentMethodSelectionType,
} from '../../../../shared/components/finances/stripe/stripePaymentMethodSelector/stripePaymentMethodSelector.types';
import { StripePaymentMethodType } from '../../../../shared/services/api/stripe/paymentMethod';
import { usePromiseMutation } from '../../../../shared/services/graphqlApi/usePromiseMutation';
import stripeCreateSetupIntentMutationGraphql, {
  stripeCreateSetupIntentMutation,
} from '../../../../modules/stripe/__generated__/stripeCreateSetupIntentMutation.graphql';
import stripeSetupIntentFragmentGraphql, {
  stripeSetupIntentFragment$data,
  stripeSetupIntentFragment$key,
} from '../../../../modules/stripe/__generated__/stripeSetupIntentFragment.graphql';

export const useStripeSetupIntent = () => {
  const [setupIntent, setSetupIntent] = useState<{
    data: stripeSetupIntentFragment$data | null;
    errors: PayloadError[] | null;
  } | null>(null);
  const [commitCreateSetupIntentMutation] = usePromiseMutation<stripeCreateSetupIntentMutation>(
    stripeCreateSetupIntentMutationGraphql
  );

  const createSetupIntent = async () => {
    if (!setupIntent) {
      const { response, errors } = await commitCreateSetupIntentMutation({ variables: { input: {} } });

      if (!errors) {
        const intent = readInlineData<stripeSetupIntentFragment$key>(
          // @ts-ignore
          stripeSetupIntentFragmentGraphql,
          response.createSetupIntent?.setupIntent ?? null
        );

        const result = { data: intent, errors };
        setSetupIntent(result);
        return result;
      }
      return { data: null, errors };
    }

    return setupIntent;
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
    setupIntent: stripeSetupIntentFragment$data;
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
