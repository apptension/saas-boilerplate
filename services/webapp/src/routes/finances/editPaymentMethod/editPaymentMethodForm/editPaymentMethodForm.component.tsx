import React from 'react';

import { FormattedMessage } from 'react-intl';
import { StripePaymentMethodSelector } from '../../../../shared/components/finances/stripe';
import { useApiForm } from '../../../../shared/hooks/useApiForm';
import { PaymentFormFields } from '../../../../shared/components/finances/stripe/stripePaymentMethodSelector/stripePaymentMethodSelector.types';
import { Form, SubmitButton } from './editPaymentMethodForm.styles';
import { useStripeCardSetup, useStripeSetupIntent } from './editPaymentMethodForm.hooks';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ChangePaymentFormFields extends PaymentFormFields {}

export interface EditPaymentMethodFormProps {
  onSuccess: () => void;
}

export const EditPaymentMethodForm = ({ onSuccess }: EditPaymentMethodFormProps) => {
  const { createSetupIntent } = useStripeSetupIntent();
  const { confirmCardSetup } = useStripeCardSetup();

  const apiFormControls = useApiForm<ChangePaymentFormFields>({ mode: 'onChange' });
  const { handleSubmit, setApiResponse, setGenericError, formState } = apiFormControls;
  const onSubmit = async (data: ChangePaymentFormFields) => {
    const setupIntentResponse = await createSetupIntent();
    if (setupIntentResponse.isError) {
      return setApiResponse(setupIntentResponse);
    }

    const result = await confirmCardSetup({
      paymentMethod: data.paymentMethod,
      setupIntent: setupIntentResponse,
    });

    if (!result) {
      return;
    }

    if (result.error) {
      return setGenericError(result.error.message);
    }

    if (result.setupIntent?.status === 'succeeded') {
      onSuccess();
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <StripePaymentMethodSelector formControls={apiFormControls} />

      <SubmitButton disabled={!formState.isValid || formState.isSubmitting}>
        <FormattedMessage defaultMessage="Save" description="Subscition / change payment method / submit button" />
      </SubmitButton>
    </Form>
  );
};
