import { TenantType } from '@sb/webapp-api-client/constants';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { screen } from '@testing-library/react';
import React from 'react';

import { TenantRole } from '../../../modules/auth/tenantRole.types';
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
      tenantFactory({ name: tenantName, membership: { role: TenantRole.MEMBER } }),
      tenantFactory({ name: 'Second name', type: TenantType.ORGANIZATION, membership: { role: TenantRole.MEMBER } }),
    ];
    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory(), tenants)];
    render(<Component />, { apolloMocks });
    expect(await screen.findByText(tenantName)).toBeInTheDocument();
  });

  it('should render correct tenant name when param in url', async () => {
    const tenantName = 'Test Tenant';
    const tenants = [
      tenantFactory({ name: 'Personal name', membership: { role: TenantRole.MEMBER } }),
      tenantFactory({ name: tenantName, type: TenantType.ORGANIZATION, membership: { role: TenantRole.MEMBER } }),
    ];
    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory(), tenants)];
    const routerProps = createMockRouterProps(RoutesConfig.home, { tenantId: tenants[1].id });
    console.log({ routerProps });
    render(<Component />, { apolloMocks, routerProps, TenantWrapper });
    expect(await screen.findByText(tenantName)).toBeInTheDocument();
  });
});
