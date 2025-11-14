import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { Tabs, TabsList, TabsTrigger } from '@sb/webapp-core/components/ui/tabs';
import { RoutesConfig as FinancesRoutesConfig } from '@sb/webapp-finances/config/routes';
import { Building2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, Outlet, useLocation } from 'react-router-dom';

import { RoutesConfig } from '../../config/routes';
import { useGenerateTenantPath } from '../../hooks';

export const TenantSettings = () => {
  const intl = useIntl();
  const location = useLocation();
  const generateTenantPath = useGenerateTenantPath();

  return (
    <PageLayout>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Organization Settings',
          id: 'Tenant settings / page title',
        })}
      />

      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage defaultMessage="Organization settings" id="Tenant settings / Header" />
            </h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage defaultMessage="Manage your organization" id="Tenant settings / Subheading" />
          </Paragraph>
        </div>

        <Tabs value={location.pathname} className="space-y-6">
          <TabsList className="flex flex-col gap-2 sm:flex-row sm:gap-2 h-full sm:h-10 sm:w-fit w-full">
            <Link to={generateTenantPath(RoutesConfig.tenant.settings.members)} replace>
              <TabsTrigger value={generateTenantPath(RoutesConfig.tenant.settings.members)}>
                <FormattedMessage defaultMessage="Members" id="Tenant settings / Members" />
              </TabsTrigger>
            </Link>
            <Link to={generateTenantPath(RoutesConfig.tenant.settings.general)} replace>
              <TabsTrigger value={generateTenantPath(RoutesConfig.tenant.settings.general)}>
                <FormattedMessage defaultMessage="General" id="Tenant settings / General" />
              </TabsTrigger>
            </Link>
            <Link to={generateTenantPath(FinancesRoutesConfig.subscriptions.index)}>
              <TabsTrigger value={generateTenantPath(FinancesRoutesConfig.subscriptions.index)}>
                <FormattedMessage defaultMessage="Subscription" id="Tenant settings / Subscription" />
              </TabsTrigger>
            </Link>
          </TabsList>

          <div className="mt-6">
            <Outlet />
          </div>
        </Tabs>
      </div>
    </PageLayout>
  );
};
