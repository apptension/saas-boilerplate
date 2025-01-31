import { useQuery } from '@apollo/client';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@sb/webapp-core/components/ui/table';
import { mapConnection } from '@sb/webapp-core/utils/graphql';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { FormattedMessage } from 'react-intl';

import { stripeAllChargesQuery } from '../../../routes/subscriptions/subscriptions.graphql';
import { TransactionHistoryEntry } from './transactionHistoryEntry';

export const TransactionHistory = () => {
  const { data: currentTenant } = useCurrentTenant();
  const { data } = useQuery(stripeAllChargesQuery, {
    fetchPolicy: 'cache-and-network',
    variables: {
      tenantId: currentTenant?.id ?? '',
    },
    skip: !currentTenant,
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <FormattedMessage id="Stripe / Transaction history / Date" defaultMessage="Date" />
          </TableHead>
          <TableHead>
            <FormattedMessage id="Stripe / Transaction history / Description" defaultMessage="Description" />
          </TableHead>
          <TableHead>
            <FormattedMessage id="Stripe / Transaction history / Payment method" defaultMessage="Payment method" />
          </TableHead>
          <TableHead>
            <FormattedMessage id="Stripe / Transaction history / Amount" defaultMessage="Amount" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mapConnection((entry) => {
          return <TransactionHistoryEntry key={entry.id} entry={entry} />;
        }, data?.allCharges)}
      </TableBody>
    </Table>
  );
};
