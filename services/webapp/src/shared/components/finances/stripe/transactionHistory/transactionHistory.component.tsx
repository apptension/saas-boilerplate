import React from 'react';

import { useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { selectStripeTransactionHistory } from '../../../../../modules/stripe/stripe.selectors';
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

export const TransactionHistory = () => {
  const { locale } = useIntl();
  const transactionsHistory = useSelector(selectStripeTransactionHistory);

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
        const cardDetails = [
          entry.paymentMethod.billingDetails.name,
          entry.paymentMethod.card.brand,
          '****',
          entry.paymentMethod.card.last4,
        ].join(' ');

        return (
          <Entry key={entry.id}>
            <TransactionDate>{new Date(entry.date).toLocaleDateString(locale)}</TransactionDate>
            <Details>TODO</Details>
            <Card>{cardDetails}</Card>
            <Amount>{entry.amount} USD</Amount>
          </Entry>
        );
      })}
    </Container>
  );
};
