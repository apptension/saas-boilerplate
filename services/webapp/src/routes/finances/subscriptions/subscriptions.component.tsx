import React from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import {
  selectActiveSubscriptionCancelDate,
  selectActiveSubscriptionNextPlan,
  selectActiveSubscriptionPaymentMethod,
  selectActiveSubscriptionRenewalDate,
  selectIsSubscriptionCanceled,
  selectIsTrialActive,
  selectTrialEnd,
} from '../../../modules/subscription/subscription.selectors';
import { useGenerateLocalePath } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import {
  useActiveSubscriptionPlanDetails,
  useSubscriptionPlanDetails,
} from '../../../shared/hooks/finances/useSubscriptionPlanDetails';
import { ButtonVariant } from '../../../shared/components/button';
import { useTransactionHistory } from '../../../shared/components/finances/stripe/transactionHistory/transactionHistory.hooks';
import { StripePaymentMethodInfo } from '../../../shared/components/finances/stripe/stripePaymentMethodInfo';
import { Date } from '../../../shared/components/date';
import { Container, Header, Link, Row, RowValue, Section, Subheader } from './subscriptions.styles';

export const Subscriptions = () => {
  const generateLocalePath = useGenerateLocalePath();

  const activeSubscriptionPlan = useActiveSubscriptionPlanDetails();
  const nextSubscriptionPlan = useSelector(selectActiveSubscriptionNextPlan);
  const nextSubscriptionPlanDetails = useSubscriptionPlanDetails(nextSubscriptionPlan);
  const activeSubscriptionRenewalDate = useSelector(selectActiveSubscriptionRenewalDate);
  const activeSubscriptionExpiryDate = useSelector(selectActiveSubscriptionCancelDate);
  const activeSubscriptionPaymentMethod = useSelector(selectActiveSubscriptionPaymentMethod);
  const isTrialActive = useSelector(selectIsTrialActive);
  const trialEnd = useSelector(selectTrialEnd);
  const isCancelled = useSelector(selectIsSubscriptionCanceled);
  const transactionsHistory = useTransactionHistory();

  return (
    <Container>
      <Section>
        <Header>
          <FormattedMessage defaultMessage="Subscriptions" description="My subscription / Header" />
        </Header>

        <Subheader>
          <FormattedMessage defaultMessage="Current plan:" description="My subscription / Active plan" />
          <RowValue>{activeSubscriptionPlan?.name}</RowValue>
        </Subheader>

        {activeSubscriptionRenewalDate && (
          <Row>
            <FormattedMessage defaultMessage="Next renewal:" description="My subscription / Next renewal" />
            <RowValue>
              <Date value={activeSubscriptionRenewalDate} />
            </RowValue>
          </Row>
        )}

        {!activeSubscriptionRenewalDate && activeSubscriptionExpiryDate && (
          <Row>
            <FormattedMessage defaultMessage="Expiry date:" description="My subscription / Expiry date" />
            <RowValue>
              <Date value={activeSubscriptionExpiryDate} />
            </RowValue>
          </Row>
        )}

        {nextSubscriptionPlanDetails && (
          <Row>
            <FormattedMessage defaultMessage="Next billing plan:" description="My subscription / Next plan" />
            <RowValue>{nextSubscriptionPlanDetails?.name}</RowValue>
          </Row>
        )}

        {isTrialActive && trialEnd && (
          <>
            <Subheader>
              <FormattedMessage defaultMessage="Free trial info" description="My subscription / Trial header" />
            </Subheader>
            <Row>
              <FormattedMessage defaultMessage="Expiry date:" description="My subscription / Trial expiry date" />
              <RowValue>
                <Date value={trialEnd} />
              </RowValue>
            </Row>
          </>
        )}

        <Link to={generateLocalePath(ROUTES.subscriptions.changePlan)}>
          <FormattedMessage defaultMessage="Edit subscription" description="My subscription / Edit subscription" />
        </Link>

        {activeSubscriptionPlan && !activeSubscriptionPlan.isFree && !isCancelled && (
          <Link to={generateLocalePath(ROUTES.subscriptions.cancel)} variant={ButtonVariant.SECONDARY}>
            <FormattedMessage
              defaultMessage="Cancel subscription"
              description="My subscription / Cancel subscription"
            />
          </Link>
        )}
      </Section>

      <Section>
        <Header>
          <FormattedMessage defaultMessage="Payments" description="My subscription / Payments header" />
        </Header>

        <Subheader>
          <FormattedMessage defaultMessage="Payment method" description="My subscription / Payment method header" />
        </Subheader>
        <Row>
          <FormattedMessage defaultMessage="Current method:" description="My subscription / Current method" />
          <RowValue>
            <StripePaymentMethodInfo method={activeSubscriptionPaymentMethod} />
          </RowValue>
        </Row>

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
      </Section>

      <Section>
        <Header>
          <FormattedMessage defaultMessage="History" description="My subscription / History header" />
        </Header>

        {transactionsHistory.length > 0 ? (
          <Link to={ROUTES.finances.history}>
            <FormattedMessage
              defaultMessage="View transaction history"
              description="My subscription / View history button"
            />
          </Link>
        ) : (
          <Row>
            <FormattedMessage
              defaultMessage="You don't have any history to show"
              description="My subscription / No transaction history"
            />
          </Row>
        )}
      </Section>
    </Container>
  );
};
