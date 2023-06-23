import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@sb/webapp-core/components/tabs';
import { FormattedMessage } from 'react-intl';

import { useActiveSubscriptionDetails } from '../../components/activeSubscriptionContext';
import { PaymentMethodContent } from './paymentMethod.content';
import { SubscriptionsContent } from './subscriptions.content';
import { TransactionsHistoryContent } from './transactionsHistory.content';

export const Subscriptions = () => {
  const { allPaymentMethods, activeSubscription } = useActiveSubscriptionDetails();

  return (
    <PageLayout>
      <PageHeadline
        header={<FormattedMessage defaultMessage="My subscription" id="My subscription / Header" />}
        subheader={
          <FormattedMessage
            defaultMessage="This is an example of subscription management page"
            id="My subscription / Subheading"
          />
        }
      />
      <Tabs defaultValue="currentSubscription">
        <TabsList className="flex flex-col sm:flex-row h-full sm:h-10 justify-start">
          <TabsTrigger value="currentSubscription">
            <FormattedMessage defaultMessage="Current subscription" id="My subscription / Current subscription" />
          </TabsTrigger>
          <TabsTrigger value="paymentMethod">
            <FormattedMessage defaultMessage="Payment methods" id="My subscription / Payment methods" />
          </TabsTrigger>
          <TabsTrigger value="transactionHistory">
            <FormattedMessage defaultMessage="Transaction history" id="My subscription / Transaction history" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="currentSubscription">
          <div className="space-y-6 pt-4">
            <PageHeadline
              header={
                <FormattedMessage
                  defaultMessage="Current subscription"
                  id="My subscription / Current subscription header"
                />
              }
              subheader={
                <FormattedMessage
                  defaultMessage="Manage your subscription"
                  id="My subscription / Current subscription subheader"
                />
              }
            />
            <SubscriptionsContent activeSubscription={activeSubscription} />
          </div>
        </TabsContent>

        <TabsContent value="paymentMethod">
          <div className="space-y-6 pt-4">
            <PageHeadline
              header={
                <FormattedMessage defaultMessage="Payment methods" id="My subscription / Payment methods header" />
              }
              subheader={
                <FormattedMessage
                  defaultMessage="Manage your payment methods in application"
                  id="My subscription / Payment methods subheader"
                />
              }
            />

            <div>
              <PaymentMethodContent allPaymentMethods={allPaymentMethods} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transactionHistory">
          <div className="space-y-6 pt-4">
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
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};
