import { FormattedMessage } from 'react-intl';

import { useActiveSubscriptionDetails } from '../activeSubscriptionContext/activeSubscriptionContext.hooks';
import { PaymentMethodContent } from './paymentMethod.content';
import { SubscriptionsContent } from './subscriptions.content';
import { Container, Header, Section, Subheader } from './subscriptions.styles';
import { TransactionsHistoryContent } from './transactionsHistory.content';

export const Subscriptions = () => {
  const { allPaymentMethods, activeSubscription } = useActiveSubscriptionDetails();

  return (
    <Container>
      <Section>
        <Header>
          <FormattedMessage defaultMessage="Subscriptions" id="My subscription / Header" />
        </Header>

        <SubscriptionsContent activeSubscription={activeSubscription} />
      </Section>

      <Section>
        <Header>
          <FormattedMessage defaultMessage="Payments" id="My subscription / Payments header" />
        </Header>

        <Subheader>
          <FormattedMessage defaultMessage="Payment method" id="My subscription / Payment method header" />
        </Subheader>

        <PaymentMethodContent allPaymentMethods={allPaymentMethods} />
      </Section>

      <Section>
        <Header>
          <FormattedMessage defaultMessage="History" id="My subscription / History header" />
        </Header>

        <TransactionsHistoryContent />
      </Section>
    </Container>
  );
};
