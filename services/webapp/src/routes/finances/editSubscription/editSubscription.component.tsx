import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { H1 } from '../../../theme/typography';

import { useApiForm } from '../../../shared/hooks/useApiForm';
import { useAsyncDispatch } from '../../../shared/utils/reduxSagaPromise';
import { subscriptionActions } from '../../../modules/subscription';
import { useSnackbar } from '../../../shared/components/snackbar';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { useSubscriptionPlanDetails } from '../../../shared/hooks/finances/useSubscriptionPlanDetails';
import { useAvailableSubscriptionPlans } from './editSubscription.hooks';
import { Container, SubmitButton, Form, ErrorMessage } from './editSubscription.styles';
import { SubscriptionPlanItem } from './subscriptionPlanItem';

interface ChangePlanFormData {
  plan: string;
}

export const EditSubscription = () => {
  const intl = useIntl();
  const { showMessage } = useSnackbar();
  const { plans } = useAvailableSubscriptionPlans();
  const history = useHistory();
  const successUrl = useLocaleUrl(ROUTES.subscriptions.index);
  const { register, handleSubmit, formState, setApiResponse, genericError, errors } = useApiForm<ChangePlanFormData>({
    mode: 'onChange',
  });
  const dispatch = useAsyncDispatch();
  const formError = genericError ?? errors.plan;

  const successMessage = intl.formatMessage({
    description: 'Change plan / Sucess message',
    defaultMessage: 'Plan changed successfully',
  });

  const onSubmit = async (formData: ChangePlanFormData) => {
    try {
      const res = await dispatch(
        subscriptionActions.updateSubscriptionPlan({
          price: formData.plan,
        })
      );
      setApiResponse(res);

      if (!res.isError) {
        await showMessage(successMessage);
        history.push(successUrl);
      }
    } catch {}
  };

  return (
    <Container>
      <H1>Choose a plan</H1>

      <Form onSubmit={handleSubmit(onSubmit)}>
        {plans.map((plan) => (
          <SubscriptionPlanItem
            key={plan.id}
            value={plan.id}
            name="plan"
            plan={plan}
            ref={register({
              required: {
                value: true,
                message: intl.formatMessage({
                  defaultMessage: 'Plan is required',
                  description: 'Change plan  / Plan required',
                }),
              },
            })}
          />
        ))}

        {formError && <ErrorMessage>{genericError}</ErrorMessage>}

        <SubmitButton disabled={!formState.isValid || formState.isSubmitting}>
          <FormattedMessage defaultMessage="Change plan" description="Change plan / Submit button" />
        </SubmitButton>
      </Form>
    </Container>
  );
};
