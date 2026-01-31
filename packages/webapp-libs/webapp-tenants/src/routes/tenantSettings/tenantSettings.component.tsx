import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { Tabs, TabsList, TabsTrigger } from '@sb/webapp-core/components/ui/tabs';
import { RoutesConfig as FinancesRoutesConfig } from '@sb/webapp-finances/config/routes';
import { Building2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { RoutesConfig } from '../../config/routes';
import { useGenerateTenantPath, usePermissionCheck } from '../../hooks';

export const TenantSettings = () => {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const generateTenantPath = useGenerateTenantPath();

  // Permission-based tab visibility
  const { hasPermission: canViewMembers, loading: loadingMembers } = usePermissionCheck('members.view');
  const { hasPermission: canViewRoles, loading: loadingRoles } = usePermissionCheck('org.roles.view');
  const { hasPermission: canViewSettings, loading: loadingSettings } = usePermissionCheck('org.settings.view');
  const { hasPermission: canViewBilling, loading: loadingBilling } = usePermissionCheck('billing.view');
  const { hasPermission: canViewSecurity, loading: loadingSecurity } = usePermissionCheck('security.view');
  const { hasPermission: canViewActivityLogs, loading: loadingLogs } = usePermissionCheck('security.logs.view');

  const isLoading = loadingMembers || loadingRoles || loadingSettings || loadingBilling || loadingSecurity || loadingLogs;

  // Determine the first available tab based on permissions
  const availableTabs = useMemo(() => {
    const tabs = [];
    if (canViewMembers) tabs.push({ path: RoutesConfig.tenant.settings.members, permission: 'members.view' });
    if (canViewRoles) tabs.push({ path: RoutesConfig.tenant.settings.roles, permission: 'org.roles.view' });
    if (canViewSettings) tabs.push({ path: RoutesConfig.tenant.settings.general, permission: 'org.settings.view' });
    if (canViewBilling) tabs.push({ path: FinancesRoutesConfig.subscriptions.index, permission: 'billing.view' });
    if (canViewSecurity) tabs.push({ path: RoutesConfig.tenant.settings.security, permission: 'security.view' });
    if (canViewActivityLogs) tabs.push({ path: RoutesConfig.tenant.settings.activityLogs, permission: 'security.logs.view' });
    return tabs;
  }, [canViewMembers, canViewRoles, canViewSettings, canViewBilling, canViewSecurity, canViewActivityLogs]);

  // Redirect to first available tab if current path is not accessible
  useEffect(() => {
    if (isLoading || availableTabs.length === 0) return;

    const currentPath = location.pathname;
    const isOnValidTab = availableTabs.some((tab) => generateTenantPath(tab.path) === currentPath);

    if (!isOnValidTab && availableTabs.length > 0) {
      navigate(generateTenantPath(availableTabs[0].path), { replace: true });
    }
  }, [isLoading, availableTabs, location.pathname, generateTenantPath, navigate]);

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
            {canViewMembers && (
              <Link to={generateTenantPath(RoutesConfig.tenant.settings.members)} replace>
                <TabsTrigger value={generateTenantPath(RoutesConfig.tenant.settings.members)}>
                  <FormattedMessage defaultMessage="Members" id="Tenant settings / Members" />
                </TabsTrigger>
              </Link>
            )}
            {canViewRoles && (
              <Link to={generateTenantPath(RoutesConfig.tenant.settings.roles)} replace>
                <TabsTrigger value={generateTenantPath(RoutesConfig.tenant.settings.roles)}>
                  <FormattedMessage defaultMessage="Roles" id="Tenant settings / Roles" />
                </TabsTrigger>
              </Link>
            )}
            {canViewSettings && (
              <Link to={generateTenantPath(RoutesConfig.tenant.settings.general)} replace>
                <TabsTrigger value={generateTenantPath(RoutesConfig.tenant.settings.general)}>
                  <FormattedMessage defaultMessage="General" id="Tenant settings / General" />
                </TabsTrigger>
              </Link>
            )}
            {canViewBilling && (
              <Link to={generateTenantPath(FinancesRoutesConfig.subscriptions.index)}>
                <TabsTrigger value={generateTenantPath(FinancesRoutesConfig.subscriptions.index)}>
                  <FormattedMessage defaultMessage="Subscription" id="Tenant settings / Subscription" />
                </TabsTrigger>
              </Link>
            )}
            {canViewSecurity && (
              <Link to={generateTenantPath(RoutesConfig.tenant.settings.security)} replace>
                <TabsTrigger value={generateTenantPath(RoutesConfig.tenant.settings.security)}>
                  <FormattedMessage defaultMessage="Security" id="Tenant settings / Security" />
                </TabsTrigger>
              </Link>
            )}
            {canViewActivityLogs && (
              <Link to={generateTenantPath(RoutesConfig.tenant.settings.activityLogs)} replace>
                <TabsTrigger value={generateTenantPath(RoutesConfig.tenant.settings.activityLogs)}>
                  <FormattedMessage defaultMessage="Activity Logs" id="Tenant settings / Activity Logs" />
                </TabsTrigger>
              </Link>
            )}
          </TabsList>

          <div className="mt-6">
            <Outlet />
          </div>
        </Tabs>
      </div>
    </PageLayout>
  );
};
