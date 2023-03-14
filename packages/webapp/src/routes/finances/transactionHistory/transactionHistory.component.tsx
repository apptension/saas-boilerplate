import { BackButton } from '@saas-boilerplate-app/webapp-core/components/buttons';
import { FormattedMessage } from 'react-intl';

import { TransactionHistory as TransactionHistoryList } from '../../../shared/components/finances/stripe/transactionHistory';
import { Container, Header } from './transactionHistory.styles';

export const TransactionHistory = () => {
  return (
    <Container>
      <BackButton />
      <Header>
        <FormattedMessage defaultMessage="Transaction history" id="Stripe / Transaction History / Header" />
      </Header>

      <TransactionHistoryList />
    </Container>
  );
};
