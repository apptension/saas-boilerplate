import { TenantUserRole } from '@sb/webapp-api-client';
import { TenantType } from '@sb/webapp-api-client/constants';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { tenantFactory } from '../../../tests/factories/tenant';
import {
  CurrentTenantRouteWrapper as TenantWrapper,
  createMockRouterProps,
  render,
} from '../../../tests/utils/rendering';
import { TenantSwitch } from '../tenantSwitch.component';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  return {
    ...jest.requireActual<NodeModule>('react-router-dom'),
    useNavigate: () => mockNavigate,
  };
});

describe('TenantSwitch: Component', () => {
  const Component = () => <TenantSwitch />;

  it('should render current tenant name', async () => {
    const tenantName = 'Test Tenant';
    const tenants = [
      tenantFactory({ name: tenantName, membership: { role: TenantUserRole.OWNER } }),
      tenantFactory({
        name: 'Second name',
        type: TenantType.ORGANIZATION,
        membership: { role: TenantUserRole.MEMBER },
      }),
    ];
    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants }))];
    render(<Component />, { apolloMocks });
    expect(await screen.findByText(tenantName)).toBeInTheDocument();
    expect(screen.getByTestId('tenant-settings-btn')).toBeInTheDocument();
  });

  it('should render correct tenant name when param in url', async () => {
    const tenantName = 'Test Tenant';
    const tenants = [
      tenantFactory({ name: 'Personal name', membership: { role: TenantUserRole.OWNER } }),
      tenantFactory({ name: tenantName, type: TenantType.ORGANIZATION, membership: { role: TenantUserRole.MEMBER } }),
    ];
    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants }))];
    const routerProps = createMockRouterProps(RoutesConfig.home, { tenantId: tenants[1].id });
    render(<Component />, { apolloMocks, routerProps, TenantWrapper });
    expect(await screen.findByText(tenantName)).toBeInTheDocument();
    expect(screen.queryByTestId('tenant-settings-btn')).not.toBeInTheDocument();
  });

  it('should not render organisation or invitation if not tenants', async () => {
    const tenantName = 'Test Tenant';
    const tenants = [tenantFactory({ name: tenantName, membership: { role: TenantUserRole.OWNER } })];
    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants }))];
    render(<Component />, { apolloMocks });
    expect(await screen.findByText(tenantName)).toBeInTheDocument();
    expect(screen.queryByText(/organizations/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/invitations/i)).not.toBeInTheDocument();
  });

  it('should handle invitation tenant click', async () => {
    const currentTenantName = 'Personal name';
    const tenantName = 'Test Tenant';
    const tenants = [
      tenantFactory({ name: currentTenantName, membership: { role: TenantUserRole.OWNER } }),
      tenantFactory({
        name: tenantName,
        type: TenantType.ORGANIZATION,
        membership: { role: TenantUserRole.MEMBER, invitationAccepted: false },
      }),
    ];
    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants }))];
    render(<Component />, { apolloMocks, TenantWrapper });

    const currentTenantButton = await screen.findByText(currentTenantName);
    await userEvent.click(currentTenantButton);

    expect(await screen.findByText(/invitations/i)).toBeInTheDocument();
    const invitationTenantButton = await screen.findByText(tenantName);

    await userEvent.click(invitationTenantButton);

    expect(mockNavigate).toHaveBeenCalledWith(`/en/tenant-invitation/${tenants[1].membership.invitationToken}`);
  });

  it('should handle tenant change', async () => {
    const currentTenantName = 'Personal name';
    const tenantName = 'Test Tenant';
    const tenants = [
      tenantFactory({ name: currentTenantName, membership: { role: TenantUserRole.OWNER } }),
      tenantFactory({
        name: tenantName,
        type: TenantType.ORGANIZATION,
        membership: { role: TenantUserRole.MEMBER, invitationAccepted: true },
      }),
    ];
    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants }))];
    render(<Component />, { apolloMocks, TenantWrapper });

    const currentTenantButton = await screen.findByText(currentTenantName);
    await userEvent.click(currentTenantButton);

    expect(await screen.findByText(/organizations/i)).toBeInTheDocument();
    const invitationTenantButton = await screen.findByText(tenantName);

    await userEvent.click(invitationTenantButton);

    expect(mockNavigate).toHaveBeenCalledWith(`/en/${tenants[1].id}`);
  });

  it('should handle settings click', async () => {
    const tenantName = 'Test Tenant';
    const tenants = [tenantFactory({ name: tenantName, membership: { role: TenantUserRole.OWNER } })];
    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants }))];
    render(<Component />, { apolloMocks });

    const currentTenantButton = await screen.findByText(tenantName);
    await userEvent.click(currentTenantButton);

    const newTenantButton = await screen.findByText(/create new tenant/i);
    await userEvent.click(newTenantButton);

    expect(mockNavigate).toHaveBeenCalledWith(`/en/add-tenant`);
  });

  it('should handle settings click', async () => {
    const tenantName = 'Test Tenant';
    const tenants = [tenantFactory({ name: tenantName, membership: { role: TenantUserRole.OWNER } })];
    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants }))];
    render(<Component />, { apolloMocks });

    const settingsButton = await screen.findByTestId('tenant-settings-btn');
    await userEvent.click(settingsButton);

    expect(mockNavigate).toHaveBeenCalledWith(`/en/${tenants[0].id}/tenant/settings/members`);
  });

  it('should handle invitation pending badge click', async () => {
    const tenants = [
      tenantFactory({ membership: { role: TenantUserRole.OWNER } }),
      tenantFactory({
        type: TenantType.ORGANIZATION,
        membership: { role: TenantUserRole.MEMBER, invitationAccepted: false },
      }),
    ];
    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants }))];
    render(<Component />, { apolloMocks });

    const invitationPendingButton = await screen.findByTestId('tenant-invitation-pending-btn');
    await userEvent.click(invitationPendingButton);

    expect(mockNavigate).toHaveBeenCalledWith(`/en/tenant-invitation/${tenants[1].membership.invitationToken}`);
  });
});
