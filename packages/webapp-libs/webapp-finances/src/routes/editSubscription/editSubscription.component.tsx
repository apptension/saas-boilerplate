import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { reportError } from '@sb/webapp-core/utils/reportError';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { RoutesConfig } from '../../config/routes';
import { useEditSubscription } from './editSubscription.hook';
import { SubscriptionPlans } from './subscriptionPlans';

export const EditSubscription = () => {
  const intl = useIntl();
  const generateTenantPath = useGenerateTenantPath();
  const { selectPlan, loading } = useEditSubscription();

  return (
    <PageLayout>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Choose a Plan',
          id: 'Change plan / page title',
        })}
      />

      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <Link
            to={generateTenantPath(RoutesConfig.subscriptions.index)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <FormattedMessage defaultMessage="Back to subscription" id="Change plan / Back" />
          </Link>
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage defaultMessage="Plans" id="Change plan / Heading" />
            </h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage defaultMessage="Choose a plan" id="Change plan / Subheading" />
          </Paragraph>
        </div>

        {/* Plans Grid */}
        <SubscriptionPlans
          onPlanSelection={(id) => {
            selectPlan(id).catch(reportError);
          }}
          loading={loading}
        />
      </div>
    </PageLayout>
  );
};
