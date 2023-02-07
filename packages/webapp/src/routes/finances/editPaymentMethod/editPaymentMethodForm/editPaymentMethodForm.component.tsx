import { FormattedMessage } from 'react-intl';

import { StripePaymentMethodSelector, useStripePaymentMethods } from '../../../../shared/components/finances/stripe';
import { useApiForm } from '../../../../shared/hooks/useApiForm';
import { useActiveSubscriptionDetails } from '../../activeSubscriptionContext/activeSubscriptionContext.hooks';
import {
  PaymentFormFields,
  StripePaymentMethodSelectionType,
} from '../../../../shared/components/finances/stripe/stripePaymentMethodSelector/stripePaymentMethodSelector.types';

import { Form, SubmitButton } from './editPaymentMethodForm.styles';
import { useStripeCardSetup, useStripeSetupIntent } from './editPaymentMethodForm.hooks';

type ChangePaymentFormFields = PaymentFormFields;

type EditPaymentMethodFormProps = {
  onSuccess: () => void;
  allPaymentMethods?: any;
};

export const EditPaymentMethodForm = ({ onSuccess }: EditPaymentMethodFormProps) => {
  const { allPaymentMethods } = useActiveSubscriptionDetails();

  const { createSetupIntent } = useStripeSetupIntent();
  const { confirmCardSetup } = useStripeCardSetup();

  const { updateDefaultPaymentMethod } = useStripePaymentMethods();

  const apiFormControls = useApiForm<ChangePaymentFormFields>({ mode: 'onChange' });
  const {
    handleSubmit,
    setGenericError,
    setGraphQLResponseErrors,
    form: { formState },
  } = apiFormControls;

  const setCardAsDefault = async (cardId: string) => {
    try {
      await updateDefaultPaymentMethod(cardId);
      onSuccess();
    } catch {}
  };

  const setupNewCard = async (data: ChangePaymentFormFields) => {
    const setupIntentResponse = await createSetupIntent();
    if (setupIntentResponse.errors) {
      return setGraphQLResponseErrors(setupIntentResponse.errors);
    }

    const intent = setupIntentResponse.data;
    if (!intent) {
      return;
    }

    const result = await confirmCardSetup({
      paymentMethod: data.paymentMethod,
      setupIntent: intent,
    });

    if (!result) {
      return;
    }

    if (result.error) {
      return setGenericError(result.error.message);
    }

    if (result.setupIntent?.status === 'succeeded' && result.setupIntent.payment_method) {
      await setCardAsDefault(result.setupIntent.payment_method as string);
    }
  };

  const onSubmit = async (data: ChangePaymentFormFields) => {
    if (data.paymentMethod.type === StripePaymentMethodSelectionType.NEW_CARD) {
      return setupNewCard(data);
    } else {
      if (!data.paymentMethod.data.pk) return;
      return setCardAsDefault(data.paymentMethod.data.pk);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <StripePaymentMethodSelector formControls={apiFormControls} initialValue={allPaymentMethods?.edges[0]?.node} />

      <SubmitButton disabled={!formState.isValid || formState.isSubmitting}>
        <FormattedMessage defaultMessage="Save" id="Subscription / change payment method / submit button" />
      </SubmitButton>
    </Form>
  );
};
