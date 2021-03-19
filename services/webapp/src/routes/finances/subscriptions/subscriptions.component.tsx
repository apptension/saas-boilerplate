import React, { ReactNode, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { subscriptionActions } from '../../../modules/subscription';
import {
  selectActiveSubscriptionPaymentMethod,
  selectActiveSubscriptionPlan,
  selectActiveSubscriptionRenewalDate,
} from '../../../modules/subscription/subscription.selectors';
import { H1, H2, H3 } from '../../../theme/typography';
import { useSnackbar } from '../../../shared/components/snackbar';
import { Button } from '../../../shared/components/button';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { Link } from '../../../shared/components/link';
import { useSubscriptionPlanDetails } from '../../../shared/hooks/finances/useSubscriptionPlanDetails';
import { Container } from './subscriptions.styles';

export const Subscriptions = () => {
  const dispatch = useDispatch();
  const changePlanUrl = useLocaleUrl(ROUTES.subscriptions.changePlan);
  const activeSubscriptionPlan = useSelector(selectActiveSubscriptionPlan);
  const activeSubscriptionRenewalDate = useSelector(selectActiveSubscriptionRenewalDate);
  const activeSubscriptionPaymentMethod = useSelector(selectActiveSubscriptionPaymentMethod);
  const { showMessage } = useSnackbar();
  const activeSubscriptionPlanName = useSubscriptionPlanDetails(activeSubscriptionPlan)?.name;

  const noopClick = () => showMessage('Unsupported');

  useEffect(() => {
    dispatch(subscriptionActions.fetchActiveSubscription());
  }, [dispatch]);

  return (
    <Container>
      <H1>Subscriptions component</H1>

      <section>
        <H2>
          <FormattedMessage defaultMessage="Current plan info" description="My subscription / Current plan header" />
        </H2>

        <H3>
          <FormattedMessage defaultMessage="Active plan:" description="My subscription / Active plan" />{' '}
          {activeSubscriptionPlan && activeSubscriptionPlanName}
        </H3>
        <H3>
          <FormattedMessage defaultMessage="Next renewal / expiry:" description="My subscription / Next renewal" />{' '}
          {activeSubscriptionRenewalDate}
        </H3>

        <Link to={changePlanUrl}>
          <FormattedMessage defaultMessage="Edit subscription" description="My subscription / Edit subscription" />
        </Link>

        <Button onClick={noopClick}>
          <FormattedMessage defaultMessage="Cancel subscription" description="My subscription / Cancel subscription" />
        </Button>
      </section>

      <section>
        <H2>
          <FormattedMessage defaultMessage="Payments" description="My subscription / Payments header" />
        </H2>

        <H3>
          <FormattedMessage
            defaultMessage="Current payment method:"
            description="My subscription / Current payment method"
          />{' '}
          {activeSubscriptionPaymentMethod?.billingDetails?.name &&
            `${activeSubscriptionPaymentMethod?.billingDetails?.name} `}
          {activeSubscriptionPaymentMethod?.card.brand} **** {activeSubscriptionPaymentMethod?.card.last4}
        </H3>

        <Link to={ROUTES.subscriptions.paymentMethod}>
          {activeSubscriptionPaymentMethod ? (
            <FormattedMessage
              defaultMessage="Edit payment method"
              description="My subscription / Edit payment method button"
            />
          ) : (
            <FormattedMessage
              defaultMessage="Add payment method"
              description="My subscription / Add payment method button"
            />
          )}
        </Link>
      </section>

      <section>
        <H2>
          <FormattedMessage defaultMessage="History" description="My subscription / History header" />
        </H2>

        <Button onClick={noopClick}>
          <FormattedMessage
            defaultMessage="View transaction history"
            description="My subscription / View history button"
          />
        </Button>
      </section>
    </Container>
  );
};
