import { StripeSetupIntentFragmentFragment, getFragmentData } from '@sb/webapp-api-client/graphql';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { Button } from '@sb/webapp-core/components/buttons';
import { Form } from '@sb/webapp-core/components/forms';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { reportError } from '@sb/webapp-core/utils/reportError';
import { FormattedMessage } from 'react-intl';

import { useActiveSubscriptionDetails } from '../../../components/activeSubscriptionContext';
import {
  PaymentFormFields,
  StripePaymentMethodSelectionType,
  StripePaymentMethodSelector,
  useStripePaymentMethods,
} from '../../../components/stripe';
import { subscriptionActiveSubscriptionFragment } from '../../../hooks';
import { useStripeCardSetup, useStripeSetupIntent } from './editPaymentMethodForm.hooks';

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
    form,
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

  const activeSubscriptionFragment = getFragmentData(subscriptionActiveSubscriptionFragment, activeSubscription);

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
    <Form {...form}>
      <form
        noValidate
        onSubmit={(e) => {
          handleSubmit(onSubmit)(e).catch(reportError);
        }}
        className="space-y-8"
      >
        <StripePaymentMethodSelector
          formControls={apiFormControls}
          initialValueId={activeSubscriptionFragment?.defaultPaymentMethod?.id}
        />

        <Button disabled={!formState.isValid || formState.isSubmitting} className="mt-2" type="submit">
          <FormattedMessage defaultMessage="Save" id="Subscription / change payment method / submit button" />
        </Button>
      </form>
    </Form>
  );
};
