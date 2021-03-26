import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { useAsyncDispatch } from '../../../shared/utils/reduxSagaPromise';
import { subscriptionActions } from '../../../modules/subscription';
import { useSnackbar } from '../../../shared/components/snackbar';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { SubscriptionPlanName } from '../../../shared/services/api/subscription/types';
import { BackButton } from '../../../shared/components/backButton/backButton.component';
import { useAvailableSubscriptionPlans } from './editSubscription.hooks';
import { Container, Plans, Header, Subheader, PlanItem } from './editSubscription.styles';

export const EditSubscription = () => {
  const intl = useIntl();
  const { showMessage } = useSnackbar();
  const { plans } = useAvailableSubscriptionPlans();
  const history = useHistory();
  const successUrl = useLocaleUrl(ROUTES.subscriptions.index);
  const dispatch = useAsyncDispatch();

  const successMessage = intl.formatMessage({
    description: 'Change plan / Success message',
    defaultMessage: 'Plan changed successfully',
  });

  const failMessage = intl.formatMessage({
    description: 'Change plan / Fail message',
    defaultMessage: 'You need first to add a payment method. Go back and set it there',
  });

  const selectPlan = async (plan: string) => {
    const res = await dispatch(
      subscriptionActions.updateSubscriptionPlan({
        price: plan,
      })
    );

    if (!res.isError) {
      await showMessage(successMessage);
      history.push(successUrl);
    } else {
      await showMessage(failMessage);
    }
  };

  return (
    <Container>
      <BackButton />
      <Header>
        <FormattedMessage defaultMessage="Plans" description="Change plan / Heading" />
      </Header>

      <Subheader>
        <FormattedMessage defaultMessage="Choose a plan" description="Change plan / Subheading" />
      </Subheader>

      <Plans>
        {plans.map((plan) => (
          <PlanItem key={plan.id} plan={plan} onSelect={() => selectPlan(plan.id)} />
        ))}
      </Plans>
    </Container>
  );
};
