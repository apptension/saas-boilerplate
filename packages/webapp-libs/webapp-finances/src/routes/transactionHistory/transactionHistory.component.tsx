import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { FormattedMessage } from 'react-intl';

import { TransactionHistory as TransactionHistoryList } from '../../components/stripe/transactionHistory';

export const TransactionHistory = () => {
  return (
    <PageLayout>
      <PageHeadline
        hasBackButton
        header={<FormattedMessage defaultMessage="Transaction history" id="Stripe / Transaction History / Header" />}
        subheader={
          <FormattedMessage defaultMessage="View transaction history" id="Stripe / Transaction History / Subheader" />
        }
      />

      <TransactionHistoryList />
    </PageLayout>
  );
};
