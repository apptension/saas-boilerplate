import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
import { ArrowLeft, History } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { TransactionHistory as TransactionHistoryList } from '../../components/stripe/transactionHistory';
import { RoutesConfig } from '../../config/routes';

export const TransactionHistory = () => {
  const intl = useIntl();
  const generateTenantPath = useGenerateTenantPath();

  return (
    <PageLayout>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Transaction History',
          id: 'Stripe / Transaction History / page title',
        })}
      />

      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <Link
            to={generateTenantPath(RoutesConfig.subscriptions.transactionHistory.index)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <FormattedMessage defaultMessage="Back to transaction history" id="Stripe / Transaction History / Back" />
          </Link>
          <div className="flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage defaultMessage="Transaction history" id="Stripe / Transaction History / Header" />
            </h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage defaultMessage="View transaction history" id="Stripe / Transaction History / Subheader" />
          </Paragraph>
        </div>

        {/* Transaction History Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              <FormattedMessage defaultMessage="Transactions" id="Stripe / Transaction History / Card Title" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="View all your past transactions and payments"
                id="Stripe / Transaction History / Card Description"
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionHistoryList />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};
