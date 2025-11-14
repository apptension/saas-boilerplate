import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { Tabs, TabsList, TabsTrigger } from '@sb/webapp-core/components/ui/tabs';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
import { CreditCard } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, Outlet, useLocation } from 'react-router-dom';

import { RoutesConfig } from '../../config/routes';
import { useActiveSubscriptionQueryLoader } from '../../hooks';

export const Subscriptions = () => {
  const intl = useIntl();
  const location = useLocation();

  const generateTenantPath = useGenerateTenantPath();
  const activeSubscriptionData = useActiveSubscriptionQueryLoader();

  return (
    <PageLayout>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Subscription plan',
          id: 'Tenant subscription plan / page title',
        })}
      />

      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage defaultMessage="Subscription plan" id="Tenant subscription plan / Header" />
            </h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage
              defaultMessage="An example of a subscription management page powered by Stripe. You can select a subscription plan, add a payment method, and view payment history."
              id="Tenant subscription plan / Subheading"
            />
          </Paragraph>
        </div>

        <Tabs value={location.pathname} className="space-y-6">
          <TabsList className="flex flex-col gap-2 sm:flex-row sm:gap-2 h-full sm:h-10 sm:w-fit w-full">
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

          <div className="mt-6">
            <Outlet context={{ ...activeSubscriptionData }} />
          </div>
        </Tabs>
      </div>
    </PageLayout>
  );
};
