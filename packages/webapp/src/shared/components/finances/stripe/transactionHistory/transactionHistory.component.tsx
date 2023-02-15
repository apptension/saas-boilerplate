import { useQuery } from '@apollo/client';
import { FormattedMessage } from 'react-intl';

import { stripeAllChargesQuery } from '../../../../../routes/finances/subscriptions/subscriptions.graphql';
import { mapConnection } from '../../../../utils/graphql';
import { Container, Entry, HeaderCell, HeaderRow } from './transactionHistory.styles';

export const TransactionHistory = () => {
  const { data } = useQuery(stripeAllChargesQuery);

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
      }, data?.allCharges)}
    </Container>
  );
};
