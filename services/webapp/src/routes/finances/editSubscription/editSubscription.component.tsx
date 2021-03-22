import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { H1, Label } from '../../../theme/typography';

import { useApiForm } from '../../../shared/hooks/useApiForm';
import { useAsyncDispatch } from '../../../shared/utils/reduxSagaPromise';
import { subscriptionActions } from '../../../modules/subscription';
import { useSnackbar } from '../../../shared/components/snackbar';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { selectIsTrialEligible } from '../../../modules/subscription/subscription.selectors';
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
  const isTrialEligilbe = useSelector(selectIsTrialEligible);

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

      {isTrialEligilbe && (
        <Label>
          <FormattedMessage
            defaultMessage="Your plan will start with a trial"
            description="Change plan / Trial is available info"
          />
        </Label>
      )}
    </Container>
  );
};
