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

type ChangePaymentFormFields = PaymentFormFields;

export type EditPaymentMethodFormProps = {
  onSuccess: () => void;
};

export const EditPaymentMethodForm = ({ onSuccess }: EditPaymentMethodFormProps) => {
  const dispatch = useAsyncDispatch();
  const { createSetupIntent } = useStripeSetupIntent();
  const { confirmCardSetup } = useStripeCardSetup();
  const { isLoading: isSubscriptionDataLoading } = useActiveSubscriptionPlanDetails();
  const defaultPaymentMethod = useSelector(selectActiveSubscriptionPaymentMethod);

  const apiFormControls = useApiForm<ChangePaymentFormFields>({ mode: 'onChange' });
  const { handleSubmit, setApiResponse, setGenericError, formState } = apiFormControls;

  const setCardAsDefault = async (cardId: string) => {
    try {
      await dispatch(stripeActions.setDefaultStripePaymentMethod(cardId));
      onSuccess();
    } catch {}
  };

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

    if (result.setupIntent?.status === 'succeeded' && result.setupIntent.payment_method) {
      await setCardAsDefault(result.setupIntent.payment_method);
    }
  };

  const onSubmit = async (data: ChangePaymentFormFields) => {
    if (data.paymentMethod.type === StripePaymentMethodSelectionType.NEW_CARD) {
      return setupNewCard(data);
    } else {
      return setCardAsDefault(data.paymentMethod.data.id);
    }
  };

  return isSubscriptionDataLoading ? null : (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <StripePaymentMethodSelector formControls={apiFormControls} initialValue={defaultPaymentMethod} />

      <SubmitButton disabled={!formState.isValid || formState.isSubmitting}>
        <FormattedMessage defaultMessage="Save" description="Subscription / change payment method / submit button" />
      </SubmitButton>
    </Form>
  );
};
