import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Tabs, TabsList, TabsTrigger } from '@sb/webapp-core/components/tabs';
import { FormattedMessage } from 'react-intl';
import { Link, Outlet, useLocation } from 'react-router-dom';

import { RoutesConfig } from '../../config/routes';
import { useGenerateTenantPath } from '../../hooks';
import { useCurrentTenant } from '../../providers';

export const TenantSettings = () => {
  const location = useLocation();
  const generateTenantPath = useGenerateTenantPath();
  const { data: currentTenant } = useCurrentTenant();

  const isOrganizationType = currentTenant?.type === 'organization'

  return (
    <PageLayout>
      <PageHeadline
        header={<FormattedMessage defaultMessage="Organization settings" id="Tenant settings / Header" />}
        subheader={<FormattedMessage defaultMessage="Manage your organization" id="Tenant settings / Subheading" />}
      />
      <Tabs value={location.pathname}>
        <TabsList className="flex flex-col sm:flex-row h-full sm:h-10 sm:w-fit w-full">
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
          {isOrganizationType &&
            <Link to={generateTenantPath(RoutesConfig.tenant.settings.danger)} replace>
              <TabsTrigger value={generateTenantPath(RoutesConfig.tenant.settings.danger)}>
                <FormattedMessage defaultMessage="Danger" id="Tenant settings / Danger" />
              </TabsTrigger>
            </Link>
          }
        </TabsList>

        <Outlet />
      </Tabs>
    </PageLayout>
  );
};
