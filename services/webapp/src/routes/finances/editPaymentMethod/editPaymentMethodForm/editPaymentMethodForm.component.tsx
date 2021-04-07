import React from 'react';

import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { StripePaymentMethodSelector } from '../../../../shared/components/finances/stripe';
import { useApiForm } from '../../../../shared/hooks/useApiForm';
import {
  PaymentFormFields,
  StripePaymentMethodSelectionType,
} from '../../../../shared/components/finances/stripe/stripePaymentMethodSelector/stripePaymentMethodSelector.types';
import { useAsyncDispatch } from '../../../../shared/utils/reduxSagaPromise';
import { stripeActions } from '../../../../modules/stripe';
import { useActiveSubscriptionPlanDetails } from '../../../../shared/hooks/finances/useSubscriptionPlanDetails';
import { selectActiveSubscriptionPaymentMethod } from '../../../../modules/subscription/subscription.selectors';
import { Form, SubmitButton } from './editPaymentMethodForm.styles';
import { useStripeCardSetup, useStripeSetupIntent } from './editPaymentMethodForm.hooks';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ChangePaymentFormFields extends PaymentFormFields {}

export interface EditPaymentMethodFormProps {
  onSuccess: () => void;
}

export const EditPaymentMethodForm = ({ onSuccess }: EditPaymentMethodFormProps) => {
  const dispatch = useAsyncDispatch();
  const { createSetupIntent } = useStripeSetupIntent();
  const { confirmCardSetup } = useStripeCardSetup();
  const { isLoading: isSubscriptionDataLoading } = useActiveSubscriptionPlanDetails();
  const defaultPaymentMethod = useSelector(selectActiveSubscriptionPaymentMethod);

  const apiFormControls = useApiForm<ChangePaymentFormFields>({ mode: 'onChange' });
  const { handleSubmit, setApiResponse, setGenericError, formState } = apiFormControls;

  const setupNewCard = async (data: ChangePaymentFormFields) => {
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

  const onSubmit = async (data: ChangePaymentFormFields) => {
    if (data.paymentMethod.type === StripePaymentMethodSelectionType.NEW_CARD) {
      return setupNewCard(data);
    } else {
      try {
        await dispatch(stripeActions.setDefaultStripePaymentMethod(data.paymentMethod.data.id));
        onSuccess();
      } catch {}
    }
  };

  return isSubscriptionDataLoading ? null : (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <StripePaymentMethodSelector formControls={apiFormControls} initialValue={defaultPaymentMethod} />

      <SubmitButton disabled={!formState.isValid || formState.isSubmitting}>
        <FormattedMessage defaultMessage="Save" description="Subscition / change payment method / submit button" />
      </SubmitButton>
    </Form>
  );
};
