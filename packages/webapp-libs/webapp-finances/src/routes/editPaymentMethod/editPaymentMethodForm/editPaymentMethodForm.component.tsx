import { StripeSetupIntentFragmentFragment, getFragmentData } from '@sb/webapp-api-client/graphql';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { FormattedMessage } from 'react-intl';

import { useActiveSubscriptionDetails } from '../../../components/activeSubscriptionContext';
import {
  PaymentFormFields,
  StripePaymentMethodSelectionType,
  StripePaymentMethodSelector,
  useStripePaymentMethods,
} from '../../../components/stripe';
import { ErrorMessage } from '../../../components/stripe/stripePaymentForm/stripePaymentForm.styles';
import { subscriptionActiveSubscriptionFragment } from '../../../hooks';
import { useStripeCardSetup, useStripeSetupIntent } from './editPaymentMethodForm.hooks';
import { Form, SubmitButton } from './editPaymentMethodForm.styles';

type ChangePaymentFormFields = PaymentFormFields;

export type EditPaymentMethodFormProps = {
  onSuccess: () => void;
};

export const EditPaymentMethodForm = ({ onSuccess }: EditPaymentMethodFormProps) => {
  const { activeSubscription } = useActiveSubscriptionDetails();
  const { updateDefaultPaymentMethod } = useStripePaymentMethods({ onUpdateSuccess: onSuccess });

  const { handleSubmit, setGenericError, setApolloGraphQLResponseErrors, form, hasGenericErrorOnly, genericError } =
    useApiForm<ChangePaymentFormFields>({ mode: 'onChange' });

  const onCreateSetupIntentSuccess = async (setupIntent: StripeSetupIntentFragmentFragment) => {
    if (!setupIntent) return;

    const result = await confirmCardSetup({
      paymentMethod: form.getValues().paymentMethod,
      setupIntent: setupIntent,
    });

    if (!result) return;

    if (result.error) {
      return setGenericError(result.error.message);
    }

    trackEvent('subscription', 'edit-payment-method', form.getValues().paymentMethod?.type);

    if (result.setupIntent?.status === 'succeeded' && typeof result.setupIntent.payment_method === 'string') {
      await updateDefaultPaymentMethod(result.setupIntent.payment_method);
    }
  };

  const { createSetupIntent } = useStripeSetupIntent({
    onSuccess: onCreateSetupIntentSuccess,
    onError: setApolloGraphQLResponseErrors,
  });
  const { confirmCardSetup } = useStripeCardSetup();

  const activeSubscriptionFragment = getFragmentData(subscriptionActiveSubscriptionFragment, activeSubscription);

  const onSubmit = async (data: ChangePaymentFormFields) => {
    if (data.paymentMethod.type === StripePaymentMethodSelectionType.NEW_CARD) {
      return createSetupIntent();
    }

    if (!data.paymentMethod.savedPaymentMethod.pk) return;
    await updateDefaultPaymentMethod(data.paymentMethod.savedPaymentMethod.pk);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <StripePaymentMethodSelector
        control={form.control}
        defaultSavedPaymentMethodId={activeSubscriptionFragment?.defaultPaymentMethod?.id}
      />

      {hasGenericErrorOnly && <ErrorMessage>{genericError}</ErrorMessage>}

      <SubmitButton disabled={!form.formState.isValid || form.formState.isSubmitting}>
        <FormattedMessage defaultMessage="Save" id="Subscription / change payment method / submit button" />
      </SubmitButton>
    </Form>
  );
};
