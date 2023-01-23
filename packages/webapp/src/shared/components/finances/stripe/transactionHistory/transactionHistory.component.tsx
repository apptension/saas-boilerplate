import { FormattedMessage } from 'react-intl';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import stripeAllChargesQueryGraphql, {
  stripeAllChargesQuery,
} from '../../../../../modules/stripe/__generated__/stripeAllChargesQuery.graphql';
import { mapConnection } from '../../../../utils/graphql';
import { Container, HeaderCell, Entry, HeaderRow } from './transactionHistory.styles';

export type TransactionHistoryProps = {
  transactionHistoryQueryRef: PreloadedQuery<stripeAllChargesQuery>;
};

export const TransactionHistory = ({ transactionHistoryQueryRef }: TransactionHistoryProps) => {
  const data = usePreloadedQuery(stripeAllChargesQueryGraphql, transactionHistoryQueryRef);

  return (
    <Container>
      <HeaderRow>
        <HeaderCell>
          <FormattedMessage id="Stripe / Transaction history / Date" defaultMessage="Date" />
        </HeaderCell>
        <HeaderCell>
          <FormattedMessage id="Stripe / Transaction history / Description" defaultMessage="Description" />
        </HeaderCell>
        <HeaderCell>
          <FormattedMessage id="Stripe / Transaction history / Payment method" defaultMessage="Payment method" />
        </HeaderCell>
        <HeaderCell>
          <FormattedMessage id="Stripe / Transaction history / Amount" defaultMessage="Amount" />
        </HeaderCell>
      </HeaderRow>

      {mapConnection((entry) => {
        return <Entry key={entry.id} entry={entry} />;
      }, data.allCharges)}
    </Container>
  );
};
