import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Tabs, TabsList, TabsTrigger } from '@sb/webapp-core/components/ui/tabs';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
import { FormattedMessage } from 'react-intl';
import { Link, Outlet, useLocation } from 'react-router-dom';

import { RoutesConfig } from '../../config/routes';
import { useActiveSubscriptionQueryLoader } from '../../hooks';

export const Subscriptions = () => {
  const location = useLocation();

  const generateTenantPath = useGenerateTenantPath();
  const activeSubscriptionData = useActiveSubscriptionQueryLoader();

  return (
    <PageLayout>
      <PageHeadline
        header={<FormattedMessage defaultMessage="Subscription plan" id="Tenant subscription plan / Header" />}
        subheader={
          <FormattedMessage
            defaultMessage="An example of a subscription management page powered by Stripe. You can select a subscription plan, add a payment method, and view payment history."
            id="Tenant subscription plan / Subheading"
          />
        }
      />
      <Tabs value={location.pathname}>
        <TabsList className="flex flex-col sm:flex-row h-full sm:h-10 sm:w-fit w-full">
          <Link to={generateTenantPath(RoutesConfig.subscriptions.index)} replace>
            <TabsTrigger value={generateTenantPath(RoutesConfig.subscriptions.index)}>
              <FormattedMessage defaultMessage="Current subscription" id="My subscription / Current subscription" />
            </TabsTrigger>
          </Link>
          <Link to={generateTenantPath(RoutesConfig.subscriptions.paymentMethods.index)} replace>
            <TabsTrigger value={generateTenantPath(RoutesConfig.subscriptions.paymentMethods.index)}>
              <FormattedMessage defaultMessage="Payment methods" id="My subscription / Payment methods" />
            </TabsTrigger>
          </Link>
          <Link to={generateTenantPath(RoutesConfig.subscriptions.transactionHistory.index)} replace>
            <TabsTrigger value={generateTenantPath(RoutesConfig.subscriptions.transactionHistory.index)}>
              <FormattedMessage defaultMessage="Transaction history" id="My subscription / Transaction history" />
            </TabsTrigger>
          </Link>
        </TabsList>

        <Outlet context={{ ...activeSubscriptionData }} />
      </Tabs>
    </PageLayout>
  );
};
