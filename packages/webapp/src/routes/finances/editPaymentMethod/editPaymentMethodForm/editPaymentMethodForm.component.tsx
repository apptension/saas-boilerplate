import { StripeSetupIntentFragmentFragment, useFragment } from '@sb/webapp-api-client/graphql';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { FormattedMessage } from 'react-intl';

import { StripePaymentMethodSelector, useStripePaymentMethods } from '../../../../shared/components/finances/stripe';
import {
  PaymentFormFields,
  StripePaymentMethodSelectionType,
} from '../../../../shared/components/finances/stripe/stripePaymentMethodSelector/stripePaymentMethodSelector.types';
import { useActiveSubscriptionDetails } from '../../activeSubscriptionContext/activeSubscriptionContext.hooks';
import { subscriptionActiveFragment } from '../../hooks/useSubscriptionPlanDetails/useSubscriptionPlanDetails.graphql';
import { useStripeCardSetup, useStripeSetupIntent } from './editPaymentMethodForm.hooks';
import { Form, SubmitButton } from './editPaymentMethodForm.styles';

type ChangePaymentFormFields = PaymentFormFields;

export type EditPaymentMethodFormProps = {
  onSuccess: () => void;
};

export const EditPaymentMethodForm = ({ onSuccess }: EditPaymentMethodFormProps) => {
  const { activeSubscription } = useActiveSubscriptionDetails();

  const apiFormControls = useApiForm<ChangePaymentFormFields>({ mode: 'onChange' });
  const {
    handleSubmit,
    setGenericError,
    setApolloGraphQLResponseErrors,
    form: { formState, getValues },
  } = apiFormControls;

  const onCreateSetupIntentSuccess = async (setupIntent: StripeSetupIntentFragmentFragment) => {
    if (!setupIntent) return;

    const result = await confirmCardSetup({
      paymentMethod: getValues().paymentMethod,
      setupIntent: setupIntent,
    });

    if (!result) return;

    if (result.error) {
      return setGenericError(result.error.message);
    }

    trackEvent('subscription', 'edit-payment-method', getValues().paymentMethod?.type);

    if (result.setupIntent?.status === 'succeeded' && typeof result.setupIntent.payment_method === 'string') {
      setCardAsDefault(result.setupIntent.payment_method);
    }
  };

  const { createSetupIntent } = useStripeSetupIntent({
    onSuccess: onCreateSetupIntentSuccess,
    onError: setApolloGraphQLResponseErrors,
  });
  const { confirmCardSetup } = useStripeCardSetup();
  const { updateDefaultPaymentMethod } = useStripePaymentMethods({ onUpdateSuccess: onSuccess });

  const activeSubscriptionFragment = useFragment(subscriptionActiveFragment, activeSubscription);

  const setCardAsDefault = (cardId: string) => {
    updateDefaultPaymentMethod(cardId);
  };

  const onSubmit = async (data: ChangePaymentFormFields) => {
    if (data.paymentMethod.type === StripePaymentMethodSelectionType.NEW_CARD) {
      return createSetupIntent();
    }

    if (!data.paymentMethod.data.pk) return;
    return setCardAsDefault(data.paymentMethod.data.pk);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <StripePaymentMethodSelector
        formControls={apiFormControls}
        initialValueId={activeSubscriptionFragment?.defaultPaymentMethod?.id}
      />

      <SubmitButton disabled={!formState.isValid || formState.isSubmitting}>
        <FormattedMessage defaultMessage="Save" id="Subscription / change payment method / submit button" />
      </SubmitButton>
    </Form>
  );
};
