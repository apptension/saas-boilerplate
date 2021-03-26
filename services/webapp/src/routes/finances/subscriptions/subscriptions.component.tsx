import React from 'react';

import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import {
  selectActiveSubscriptionCancelDate,
  selectActiveSubscriptionPaymentMethod,
  selectActiveSubscriptionRenewalDate,
  selectIsTrialActive,
  selectTrialEnd,
} from '../../../modules/subscription/subscription.selectors';
import { H1, H2, H3 } from '../../../theme/typography';
import { useSnackbar } from '../../../shared/components/snackbar';
import { Button } from '../../../shared/components/button';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { Link } from '../../../shared/components/link';
import { useActiveSubscriptionPlanDetails } from '../../../shared/hooks/finances/useSubscriptionPlanDetails';
import { Container, Links } from './subscriptions.styles';

export const Subscriptions = () => {
  const changePlanUrl = useLocaleUrl(ROUTES.subscriptions.changePlan);
  const cancelSubscriptionUrl = useLocaleUrl(ROUTES.subscriptions.cancel);

  const activeSubscriptionPlan = useActiveSubscriptionPlanDetails();
  const activeSubscriptionRenewalDate = useSelector(selectActiveSubscriptionRenewalDate);
  const activeSubscriptionExpiryDate = useSelector(selectActiveSubscriptionCancelDate);
  const activeSubscriptionPaymentMethod = useSelector(selectActiveSubscriptionPaymentMethod);
  const isTrialActive = useSelector(selectIsTrialActive);
  const trialEnd = useSelector(selectTrialEnd);

  const { showMessage } = useSnackbar();

  const noopClick = () => showMessage('Unsupported');

  return (
    <Container>
      <H1>Subscriptions component</H1>

      <section>
        <H2>
          <FormattedMessage defaultMessage="Current plan info" description="My subscription / Current plan header" />
        </H2>

        <H3>
          <FormattedMessage defaultMessage="Active plan:" description="My subscription / Active plan" />{' '}
          {activeSubscriptionPlan && (
            <>
              {activeSubscriptionPlan?.name} [{activeSubscriptionPlan?.price} zł]
            </>
          )}
        </H3>

        {activeSubscriptionRenewalDate && (
          <H3>
            <FormattedMessage defaultMessage="Next renewal:" description="My subscription / Next renewal" />{' '}
            {activeSubscriptionRenewalDate}
          </H3>
        )}

        {!activeSubscriptionRenewalDate && activeSubscriptionExpiryDate && (
          <H3>
            <FormattedMessage
              defaultMessage="Your subscription will expire at:"
              description="My subscription / Expiry date"
            />{' '}
            {activeSubscriptionExpiryDate}
          </H3>
        )}

        {isTrialActive && (
          <H3>
            <FormattedMessage defaultMessage="Your trial ends at " description="My subscription / Trial ends at" />{' '}
            {trialEnd}
          </H3>
        )}

        <Links>
          <Link to={changePlanUrl}>
            <FormattedMessage defaultMessage="Edit subscription" description="My subscription / Edit subscription" />
          </Link>

          {activeSubscriptionPlan && !activeSubscriptionPlan.isFree && !activeSubscriptionExpiryDate && (
            <Link to={cancelSubscriptionUrl}>
              <FormattedMessage
                defaultMessage="Cancel subscription"
                description="My subscription / Cancel subscription"
              />
            </Link>
          )}
        </Links>
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

        <Links>
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
        </Links>
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
