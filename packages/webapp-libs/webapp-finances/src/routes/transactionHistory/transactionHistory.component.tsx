import { BackButton } from '@sb/webapp-core/components/buttons';
import { Separator } from '@sb/webapp-core/components/separator';
import { FormattedMessage } from 'react-intl';

import { TransactionHistory as TransactionHistoryList } from '../../components/stripe/transactionHistory';

export const TransactionHistory = () => {
  return (
    <div className="px-8 space-y-8 flex-1 lg:max-w-2xl">
      <div>
        <BackButton className="float-right" />
        <h3 className="text-lg font-medium">
          <FormattedMessage defaultMessage="Transaction history" id="Stripe / Transaction History / Header" />
        </h3>

        <p className="text-sm text-muted-foreground">
          <FormattedMessage defaultMessage="View transaction history" id="Stripe / Transaction History / Subheader" />
        </p>
      </div>

      <Separator />

      <TransactionHistoryList />
    </div>
  );
};
