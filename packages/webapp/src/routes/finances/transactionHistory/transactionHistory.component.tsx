import { Suspense } from 'react';
import { FormattedMessage } from 'react-intl';
import { TransactionHistory as TransactionHistoryList } from '../../../shared/components/finances/stripe/transactionHistory';
import { BackButton } from '../../../shared/components/backButton';
import { useTransactionsHistoryQuery } from '../../../shared/components/finances/stripe/transactionHistory/transactionHistory.hooks';
import { Container, Header } from './transactionHistory.styles';

export const TransactionHistory = () => {
  const { transactionsHistoryQueryRef } = useTransactionsHistoryQuery();
  return (
    <Container>
      <BackButton />
      <Header>
        <FormattedMessage defaultMessage="Transaction history" id="Stripe / Transaction History / Header" />
      </Header>

      {transactionsHistoryQueryRef && (
        <Suspense fallback={null}>
          <TransactionHistoryList transactionHistoryQueryRef={transactionsHistoryQueryRef} />
        </Suspense>
      )}
    </Container>
  );
};
