import { Separator } from '@sb/webapp-core/components/separator';
import { FormattedMessage } from 'react-intl';

import { useActiveSubscriptionDetails } from '../../components/activeSubscriptionContext';
import { PaymentMethodContent } from './paymentMethod.content';
import { SubscriptionsContent } from './subscriptions.content';
import { TransactionsHistoryContent } from './transactionsHistory.content';

export const Subscriptions = () => {
  const { allPaymentMethods, activeSubscription } = useActiveSubscriptionDetails();

  return (
    <div className="px-8 space-y-8 flex-1 lg:max-w-2xl">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">
            <FormattedMessage defaultMessage="My subscription" id="My subscription / Header" />
          </h3>

          <p className="text-sm text-muted-foreground">
            <FormattedMessage
              defaultMessage="This is an example of subscription management page"
              id="My subscription / Subheading"
            />
          </p>
        </div>
        <Separator />
        <div>
          <SubscriptionsContent activeSubscription={activeSubscription} />
        </div>
      </div>

      <Separator />

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">
            <FormattedMessage defaultMessage="Payment methods" id="My subscription / Payment methods header" />
          </h3>

          <p className="text-sm text-muted-foreground">
            <FormattedMessage
              defaultMessage="Manage you payment methods in application"
              id="My subscription / Payment methods subheader"
            />
          </p>
        </div>
        <Separator />
        <div>
          <PaymentMethodContent allPaymentMethods={allPaymentMethods} />
        </div>
      </div>

      <Separator />

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">
            <FormattedMessage defaultMessage="History" id="My subscription / History header" />
          </h3>

          <p className="text-sm text-muted-foreground">
            <FormattedMessage defaultMessage="View transaction history" id="My subscription / History subheader" />
          </p>
        </div>

        <Separator />

        <div>
          <TransactionsHistoryContent />
        </div>
      </div>
    </div>
  );
};
