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
import { RoutesConfig } from '../../../app/config/routes';
import {
  useActiveSubscriptionPlanDetails,
  useSubscriptionPlanDetails,
} from '../../../shared/hooks/finances/useSubscriptionPlanDetails';
import { ButtonVariant } from '../../../shared/components/forms/button';
import { useTransactionHistory } from '../../../shared/components/finances/stripe/transactionHistory/transactionHistory.hooks';
import { StripePaymentMethodInfo } from '../../../shared/components/finances/stripe/stripePaymentMethodInfo';
import { FormattedDate } from '../../../shared/components/dateTime/formattedDate';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
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
          <FormattedMessage defaultMessage="Subscriptions" id="My subscription / Header" />
        </Header>

        <Subheader>
          <FormattedMessage defaultMessage="Current plan:" id="My subscription / Active plan" />
          <RowValue>{activeSubscriptionPlan?.name}</RowValue>
        </Subheader>

        {activeSubscriptionRenewalDate && (
          <Row>
            <FormattedMessage defaultMessage="Next renewal:" id="My subscription / Next renewal" />
            <RowValue>
              <FormattedDate value={activeSubscriptionRenewalDate} />
            </RowValue>
          </Row>
        )}

        {!activeSubscriptionRenewalDate && activeSubscriptionExpiryDate && (
          <Row>
            <FormattedMessage defaultMessage="Expiry date:" id="My subscription / Expiry date" />
            <RowValue>
              <FormattedDate value={activeSubscriptionExpiryDate} />
            </RowValue>
          </Row>
        )}

        {nextSubscriptionPlanDetails && (
          <Row>
            <FormattedMessage defaultMessage="Next billing plan:" id="My subscription / Next plan" />
            <RowValue>{nextSubscriptionPlanDetails?.name}</RowValue>
          </Row>
        )}

        {isTrialActive && trialEnd && (
          <>
            <Subheader>
              <FormattedMessage defaultMessage="Free trial info" id="My subscription / Trial header" />
            </Subheader>
            <Row>
              <FormattedMessage defaultMessage="Expiry date:" id="My subscription / Trial expiry date" />
              <RowValue>
                <FormattedDate value={trialEnd} />
              </RowValue>
            </Row>
          </>
        )}

        <Link to={generateLocalePath(RoutesConfig.subscriptions.changePlan)}>
          <FormattedMessage defaultMessage="Edit subscription" id="My subscription / Edit subscription" />
        </Link>

        {activeSubscriptionPlan && !activeSubscriptionPlan.isFree && !isCancelled && (
          <Link to={generateLocalePath(RoutesConfig.subscriptions.cancel)} variant={ButtonVariant.SECONDARY}>
            <FormattedMessage
              defaultMessage="Cancel subscription"
              id="My subscription / Cancel subscription"
            />
          </Link>
        )}
      </Section>

      <Section>
        <Header>
          <FormattedMessage defaultMessage="Payments" id="My subscription / Payments header" />
        </Header>

        <Subheader>
          <FormattedMessage defaultMessage="Payment method" id="My subscription / Payment method header" />
        </Subheader>
        <Row>
          <FormattedMessage defaultMessage="Current method:" id="My subscription / Current method" />
          <RowValue>
            <StripePaymentMethodInfo method={activeSubscriptionPaymentMethod} />
          </RowValue>
        </Row>

        <Link to={generateLocalePath(RoutesConfig.subscriptions.paymentMethod)}>
          {activeSubscriptionPaymentMethod ? (
            <FormattedMessage
              defaultMessage="Edit payment method"
              id="My subscription / Edit payment method button"
            />
          ) : (
            <FormattedMessage
              defaultMessage="Add payment method"
              id="My subscription / Add payment method button"
            />
          )}
        </Link>
      </Section>

      <Section>
        <Header>
          <FormattedMessage defaultMessage="History" id="My subscription / History header" />
        </Header>

        {transactionsHistory.length > 0 ? (
          <Link to={generateLocalePath(RoutesConfig.finances.history)}>
            <FormattedMessage
              defaultMessage="View transaction history"
              id="My subscription / View history button"
            />
          </Link>
        ) : (
          <Row>
            <FormattedMessage
              defaultMessage="You don't have any history to show"
              id="My subscription / No transaction history"
            />
          </Row>
        )}
      </Section>
    </Container>
  );
};
