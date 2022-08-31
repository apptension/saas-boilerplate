import { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { selectActiveSubscriptionPaymentMethod } from '../../../modules/subscription/subscription.selectors';
import { RoutesConfig } from '../../../app/config/routes';
import { useActiveSubscriptionQueryLoader } from '../../../shared/hooks/finances/useSubscriptionPlanDetails';
import { useTransactionHistory } from '../../../shared/components/finances/stripe/transactionHistory/transactionHistory.hooks';
import { StripePaymentMethodInfo } from '../../../shared/components/finances/stripe/stripePaymentMethodInfo';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { Container, Header, Link, Row, RowValue, Section, Subheader } from './subscriptions.styles';
import { SubscriptionsContent } from './subscriptions.content';

export const Subscriptions = () => {
  const generateLocalePath = useGenerateLocalePath();

  const activeSubscriptionPaymentMethod = useSelector(selectActiveSubscriptionPaymentMethod);
  const transactionsHistory = useTransactionHistory();
  const activeSubscriptionDetailsQueryRef = useActiveSubscriptionQueryLoader();

  return (
    <Container>
      <Section>
        <Header>
          <FormattedMessage defaultMessage="Subscriptions" id="My subscription / Header" />
        </Header>

        {activeSubscriptionDetailsQueryRef && (
          <Suspense fallback={null}>
            <SubscriptionsContent activeSubscriptionQueryRef={activeSubscriptionDetailsQueryRef} />
          </Suspense>
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
