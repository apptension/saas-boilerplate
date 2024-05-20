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

const personalTenantName = 'Test Tenant';
const organizationTenantName = 'Organization Tenant';
const organizationPendingTenantName = 'Organization Pending Tenant';

const personalTenant = tenantFactory({
  name: personalTenantName,
  type: TenantType.PERSONAL,
  membership: { role: TenantUserRole.OWNER },
});
const organizationTenant = tenantFactory({
  name: organizationTenantName,
  type: TenantType.ORGANIZATION,
  membership: { role: TenantUserRole.MEMBER, invitationAccepted: true },
});
const organizationPendingTenant = tenantFactory({
  name: organizationPendingTenantName,
  type: TenantType.ORGANIZATION,
  membership: { role: TenantUserRole.MEMBER, invitationAccepted: false },
});

const tenants = [personalTenant, organizationTenant, organizationPendingTenant];
const getApolloMocks = () => [fillCommonQueryWithUser(currentUserFactory({ tenants }))];

describe('TenantSwitch: Component', () => {
  const Component = () => <TenantSwitch />;

  it('should render current tenant name', async () => {
    render(<Component />, { apolloMocks: getApolloMocks() });

    expect(await screen.findByText(personalTenantName)).toBeInTheDocument();
    expect(screen.getByTestId('tenant-settings-btn')).toBeInTheDocument();
  });

  it('should render correct tenant name when param in url', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.home, { tenantId: organizationTenant.id });
    render(<Component />, { apolloMocks: getApolloMocks(), routerProps, TenantWrapper });

    expect(await screen.findByText(organizationTenantName)).toBeInTheDocument();
    expect(screen.queryByTestId('tenant-settings-btn')).not.toBeInTheDocument();
  });

  it('should not render organization and invitation labels if only personal tenant', async () => {
    render(<Component />, {
      apolloMocks: [fillCommonQueryWithUser(currentUserFactory({ tenants: [personalTenant] }))],
    });
    expect(await screen.findByText(personalTenantName)).toBeInTheDocument();

    const currentTenantButton = await screen.findByText(personalTenantName);
    await userEvent.click(currentTenantButton);

    expect(screen.queryByText(/organizations/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/invitations/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('tenant-invitation-pending-btn')).not.toBeInTheDocument();
  });

  it('should handle invitation tenant click', async () => {
    render(<Component />, { apolloMocks: getApolloMocks(), TenantWrapper });

    const currentTenantButton = await screen.findByText(personalTenantName);
    await userEvent.click(currentTenantButton);

    expect(await screen.findByText(/invitations/i)).toBeInTheDocument();
    const invitationTenantButton = await screen.findByText(organizationPendingTenantName);

    await userEvent.click(invitationTenantButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      `/en/tenant-invitation/${organizationPendingTenant.membership.invitationToken}`
    );
  });

  it('should handle tenant change', async () => {
    render(<Component />, { apolloMocks: getApolloMocks(), TenantWrapper });

    const currentTenantButton = await screen.findByText(personalTenantName);
    await userEvent.click(currentTenantButton);

    expect(await screen.findByText(/organizations/i)).toBeInTheDocument();
    const invitationTenantButton = await screen.findByText(organizationTenantName);

    await userEvent.click(invitationTenantButton);

    expect(mockNavigate).toHaveBeenCalledWith(`/en/${organizationTenant.id}`);
  });

  it('should handle create new tenant click', async () => {
    render(<Component />, { apolloMocks: getApolloMocks() });

    const currentTenantButton = await screen.findByText(personalTenantName);
    await userEvent.click(currentTenantButton);

    const newTenantButton = await screen.findByText(/create new organization/i);
    await userEvent.click(newTenantButton);

    expect(mockNavigate).toHaveBeenCalledWith(`/en/add-tenant`);
  });

  it('should handle settings click', async () => {
    render(<Component />, { apolloMocks: getApolloMocks() });

    const settingsButton = await screen.findByTestId('tenant-settings-btn');
    await userEvent.click(settingsButton);

    expect(mockNavigate).toHaveBeenCalledWith(`/en/${personalTenant.id}/tenant/settings/members`);
  });

  it('should handle invitation pending badge click', async () => {
    render(<Component />, { apolloMocks: getApolloMocks() });

    const invitationPendingButton = await screen.findByTestId('tenant-invitation-pending-btn');
    await userEvent.click(invitationPendingButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      `/en/tenant-invitation/${organizationPendingTenant.membership.invitationToken}`
    );
  });
});
