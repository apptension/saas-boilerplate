import { TenantType } from '@sb/webapp-api-client/constants';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { tenantFactory } from '../../../tests/factories/tenant';
import {
  CurrentTenantRouteWrapper,
  createMockRouterProps,
  render,
} from '../../../tests/utils/rendering';
import { RoutesConfig } from '../../../config/routes';
import { TenantSwitchSidebar } from '../tenantSwitchSidebar.component';

describe('TenantSwitchSidebar: Component', () => {
  const orgTenant = tenantFactory({
    id: 'org-1',
    name: 'Org One',
    type: TenantType.ORGANIZATION,
    membership: { role: 'OWNER', invitationAccepted: true, invitationToken: 'token', id: 'm1' },
  });
  const user = currentUserFactory({ tenants: [orgTenant] });

  const Component = (props: { collapsed?: boolean } = {}) => (
    <CurrentTenantRouteWrapper>
      <TenantSwitchSidebar {...props} />
    </CurrentTenantRouteWrapper>
  );

  it('should render current tenant name when not collapsed', async () => {
    const apolloMocks = [fillCommonQueryWithUser(user)];
    const routerProps = createMockRouterProps(RoutesConfig.home, { tenantId: orgTenant.id });

    render(<Component />, { apolloMocks, routerProps });

    const trigger = await screen.findByRole('button');
    await userEvent.click(trigger);

    const orgOneElements = screen.getAllByText(/org one/i);
    expect(orgOneElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/organizations/i)).toBeInTheDocument();
  });

  it('should render create new organization option', async () => {
    const apolloMocks = [fillCommonQueryWithUser(user)];
    const routerProps = createMockRouterProps(RoutesConfig.home, { tenantId: orgTenant.id });

    render(<Component />, { apolloMocks, routerProps });

    const trigger = await screen.findByRole('button');
    await userEvent.click(trigger);

    expect(screen.getByText(/create new organization/i)).toBeInTheDocument();
  });

});
