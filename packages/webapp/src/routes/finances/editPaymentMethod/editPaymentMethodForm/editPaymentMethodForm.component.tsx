import { FormattedMessage } from 'react-intl';

import { StripePaymentMethodSelector, useStripePaymentMethods } from '../../../../shared/components/finances/stripe';
import {
  PaymentFormFields,
  StripePaymentMethodSelectionType,
} from '../../../../shared/components/finances/stripe/stripePaymentMethodSelector/stripePaymentMethodSelector.types';
import { SUBSCRIPTION_ACTIVE_FRAGMENT } from '../../../../shared/hooks/finances/useSubscriptionPlanDetails/useSubscriptionPlanDetails.graphql';
import { useApiForm } from '../../../../shared/hooks/useApiForm';
import { useFragment } from '../../../../shared/services/graphqlApi/__generated/gql';
import { useActiveSubscriptionDetails } from '../../activeSubscriptionContext/activeSubscriptionContext.hooks';
import { useStripeCardSetup, useStripeSetupIntent } from './editPaymentMethodForm.hooks';
import { Form, SubmitButton } from './editPaymentMethodForm.styles';

type ChangePaymentFormFields = PaymentFormFields;

type EditPaymentMethodFormProps = {
  onSuccess: () => void;
};

export const EditPaymentMethodForm = ({ onSuccess }: EditPaymentMethodFormProps) => {
  const { activeSubscription } = useActiveSubscriptionDetails();

  const { createSetupIntent } = useStripeSetupIntent();
  const { confirmCardSetup } = useStripeCardSetup();

  const { updateDefaultPaymentMethod } = useStripePaymentMethods({ onUpdateSuccess: onSuccess });

  const activeSubscriptionFragment = useFragment(SUBSCRIPTION_ACTIVE_FRAGMENT, activeSubscription);

  const apiFormControls = useApiForm<ChangePaymentFormFields>({ mode: 'onChange' });
  const {
    handleSubmit,
    setGenericError,
    setGraphQLResponseErrors,
    form: { formState },
  } = apiFormControls;

  const setCardAsDefault = (cardId: string) => {
    updateDefaultPaymentMethod(cardId);
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

    if (result.setupIntent?.status === 'succeeded' && typeof result.setupIntent.payment_method === 'string') {
      setCardAsDefault(result.setupIntent.payment_method);
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
