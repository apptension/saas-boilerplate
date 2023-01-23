import { Suspense } from 'react';
import { FormattedMessage } from 'react-intl';
import { useTransactionsHistoryQuery } from '../../../shared/components/finances/stripe/transactionHistory/transactionHistory.hooks';
import { useActiveSubscriptionDetailsQueryRef } from '../activeSubscriptionContext/activeSubscriptionContext.hooks';
import { Container, Header, Section, Subheader } from './subscriptions.styles';
import { SubscriptionsContent } from './subscriptions.content';
import { PaymentMethodContent } from './paymentMethod.content';
import { TransactionsHistoryContent } from './transactionsHistory.content';

export const Subscriptions = () => {
  const activeSubscriptionDetailsQueryRefContext = useActiveSubscriptionDetailsQueryRef();
  const { transactionsHistoryQueryRef } = useTransactionsHistoryQuery();

  return (
    <Container>
      <Section>
        <Header>
          <FormattedMessage defaultMessage="Subscriptions" id="My subscription / Header" />
        </Header>

        {activeSubscriptionDetailsQueryRefContext && activeSubscriptionDetailsQueryRefContext.ref && (
          <Suspense fallback={null}>
            <SubscriptionsContent activeSubscriptionQueryRef={activeSubscriptionDetailsQueryRefContext.ref} />
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

        {activeSubscriptionDetailsQueryRefContext && activeSubscriptionDetailsQueryRefContext.ref && (
          <Suspense fallback={null}>
            <PaymentMethodContent activeSubscriptionQueryRef={activeSubscriptionDetailsQueryRefContext.ref} />
          </Suspense>
        )}
      </Section>

      <Section>
        <Header>
          <FormattedMessage defaultMessage="History" id="My subscription / History header" />
        </Header>

        {transactionsHistoryQueryRef && (
          <Suspense fallback={null}>
            <TransactionsHistoryContent transactionHistoryQueryRef={transactionsHistoryQueryRef} />
          </Suspense>
        )}
      </Section>
    </Container>
  );
};
