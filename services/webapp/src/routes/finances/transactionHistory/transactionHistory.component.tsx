import { FormattedMessage } from 'react-intl';
import { TransactionHistory as TransactionHistoryList } from '../../../shared/components/finances/stripe/transactionHistory';
import { BackButton } from '../../../shared/components/backButton';
import { Container, Header } from './transactionHistory.styles';

export const TransactionHistory = () => {
  return (
    <Container>
      <BackButton />
      <Header>
        <FormattedMessage defaultMessage="Transaction history" description="Stripe / Transaction History / Header" />
      </Header>

      <TransactionHistoryList />
    </Container>
  );
};
