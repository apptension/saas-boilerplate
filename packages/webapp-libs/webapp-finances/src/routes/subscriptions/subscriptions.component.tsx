import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Separator } from '@sb/webapp-core/components/separator';
import { FormattedMessage } from 'react-intl';

import { useActiveSubscriptionDetails } from '../../components/activeSubscriptionContext';
import { PaymentMethodContent } from './paymentMethod.content';
import { SubscriptionsContent } from './subscriptions.content';
import { TransactionsHistoryContent } from './transactionsHistory.content';

export const Subscriptions = () => {
  const { allPaymentMethods, activeSubscription } = useActiveSubscriptionDetails();

  return (
    <PageLayout>
      <div className="space-y-6">
        <PageHeadline
          header={<FormattedMessage defaultMessage="My subscription" id="My subscription / Header" />}
          subheader={
            <FormattedMessage
              defaultMessage="This is an example of subscription management page"
              id="My subscription / Subheading"
            />
          }
        />
        <div>
          <SubscriptionsContent activeSubscription={activeSubscription} />
        </div>
      </div>

      <Separator />

      <div className="space-y-6">
        <PageHeadline
          header={<FormattedMessage defaultMessage="Payment methods" id="My subscription / Payment methods header" />}
          subheader={
            <FormattedMessage
              defaultMessage="Manage you payment methods in application"
              id="My subscription / Payment methods subheader"
            />
          }
        />

        <div>
          <PaymentMethodContent allPaymentMethods={allPaymentMethods} />
        </div>
      </div>

      <Separator />

      <div className="space-y-6">
        <PageHeadline
          header={<FormattedMessage defaultMessage="History" id="My subscription / History header" />}
          subheader={
            <FormattedMessage defaultMessage="View transaction history" id="My subscription / History subheader" />
          }
        />

        <div>
          <TransactionsHistoryContent />
        </div>
      </div>
    </PageLayout>
  );
};
