import { FormattedMessage } from 'react-intl';
import { Container, HeaderCell, Entry, HeaderRow } from './transactionHistory.styles';
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
        return <Entry key={entry.id} entry={entry} />;
      })}
    </Container>
  );
};
