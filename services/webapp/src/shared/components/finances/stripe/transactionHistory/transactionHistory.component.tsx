import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { StripePaymentMethodInfo } from '../stripePaymentMethodInfo';
import { Date } from '../../../date';
import {
  Container,
  HeaderCell,
  HeaderRow,
  Entry,
  Amount,
  Card,
  TransactionDate,
  Details,
} from './transactionHistory.styles';
import { useTransactionHistory } from './transactionHistory.hooks';

export const TransactionHistory = () => {
  const transactionsHistory = useTransactionHistory();

  return (
    <Container>
      <HeaderRow>
        <HeaderCell>
          <FormattedMessage description="Stripe / Transaction history / Date" defaultMessage="Date" />
        </HeaderCell>
        <HeaderCell>
          <FormattedMessage description="Stripe / Transaction history / Description" defaultMessage="Description" />
        </HeaderCell>
        <HeaderCell>
          <FormattedMessage
            description="Stripe / Transaction history / Payment method"
            defaultMessage="Payment method"
          />
        </HeaderCell>
        <HeaderCell>
          <FormattedMessage description="Stripe / Transaction history / Amount" defaultMessage="Amount" />
        </HeaderCell>
      </HeaderRow>

      {transactionsHistory.map((entry) => {
        return (
          <Entry key={entry.id}>
            <TransactionDate>
              <Date value={entry.date} />
            </TransactionDate>
            <Details>TODO</Details>
            <Card>
              <StripePaymentMethodInfo method={entry.paymentMethod} />
            </Card>
            <Amount>{entry.amount} USD</Amount>
          </Entry>
        );
      })}
    </Container>
  );
};
