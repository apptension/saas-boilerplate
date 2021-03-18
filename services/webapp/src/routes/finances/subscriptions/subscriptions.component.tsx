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
import { Container } from './subscriptions.styles';

export interface SubscriptionsProps {
  children?: ReactNode;
}

export const Subscriptions = ({ children }: SubscriptionsProps) => {
  const dispatch = useDispatch();
  const activeSubscriptionPlan = useSelector(selectActiveSubscriptionPlan);
  const activeSubscriptionRenewalDate = useSelector(selectActiveSubscriptionRenewalDate);
  const activeSubscriptionPaymentMethod = useSelector(selectActiveSubscriptionPaymentMethod);
  const { showMessage } = useSnackbar();

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
          {activeSubscriptionPlan}
        </H3>
        <H3>
          <FormattedMessage defaultMessage="Next renewal / expiry:" description="My subscription / Next renewal" />{' '}
          {activeSubscriptionRenewalDate}
        </H3>

        <Button onClick={noopClick}>
          <FormattedMessage defaultMessage="Edit subscription" description="My subscription / Edit subscription" />
        </Button>

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
          {activeSubscriptionPaymentMethod?.brand} **** {activeSubscriptionPaymentMethod?.last4}
        </H3>

        <Button onClick={noopClick}>
          <FormattedMessage
            defaultMessage="Edit payment method"
            description="My subscription / Edit payment method button"
          />
        </Button>
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
