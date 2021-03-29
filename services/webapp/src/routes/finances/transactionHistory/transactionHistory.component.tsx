import React, { ReactNode } from 'react';

import { FormattedMessage } from 'react-intl';
import { TransactionHistory as TransactionHistoryList } from '../../../shared/components/finances/stripe/transactionHistory';
import { BackButton } from '../../../shared/components/backButton/backButton.component';
import { Container, Header } from './transactionHistory.styles';

export interface TransactionHistoryProps {
  children?: ReactNode;
}

export const TransactionHistory = ({ children }: TransactionHistoryProps) => {
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
