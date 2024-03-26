import { TenantUserRole } from '@sb/webapp-api-client';
import { TenantType } from '@sb/webapp-api-client/constants';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { screen } from '@testing-library/react';
import React from 'react';

import { tenantFactory } from '../../../tests/factories/tenant';
import {
  CurrentTenantRouteWrapper as TenantWrapper,
  createMockRouterProps,
  render,
} from '../../../tests/utils/rendering';
import { TenantSwitch } from '../tenantSwitch.component';

describe('TenantSwitch: Component', () => {
  const Component = () => <TenantSwitch />;

  it('should render current tenant name', async () => {
    const tenantName = 'Test Tenant';
    const tenants = [
      tenantFactory({ name: tenantName, membership: { role: TenantUserRole.MEMBER } }),
      tenantFactory({
        name: 'Second name',
        type: TenantType.ORGANIZATION,
        membership: { role: TenantUserRole.MEMBER },
      }),
    ];
    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants }))];
    render(<Component />, { apolloMocks });
    expect(await screen.findByText(tenantName)).toBeInTheDocument();
  });

  it('should render correct tenant name when param in url', async () => {
    const tenantName = 'Test Tenant';
    const tenants = [
      tenantFactory({ name: 'Personal name', membership: { role: TenantUserRole.MEMBER } }),
      tenantFactory({ name: tenantName, type: TenantType.ORGANIZATION, membership: { role: TenantUserRole.MEMBER } }),
    ];
    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants }))];
    const routerProps = createMockRouterProps(RoutesConfig.home, { tenantId: tenants[1].id });
    render(<Component />, { apolloMocks, routerProps, TenantWrapper });
    expect(await screen.findByText(tenantName)).toBeInTheDocument();
  });
});
