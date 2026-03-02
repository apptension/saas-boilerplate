import { Role, TenantUserRole } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { CurrentTenantProvider } from '@sb/webapp-tenants/providers';
import { tenantFactory } from '@sb/webapp-tenants/tests/factories/tenant';
import { screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { Home } from '../home.component';

describe('Home: Component', () => {
  const Component = () => (
    <CurrentTenantProvider>
      <Home />
    </CurrentTenantProvider>
  );

  it('should display headline', async () => {
    render(<Component />);
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });

  it('should display dashboard items for owner', async () => {
    const tenants = [
      tenantFactory({
        membership: { role: TenantUserRole.OWNER },
      }),
    ];
    const currentUser = currentUserFactory({
      roles: [Role.USER],
      tenants,
    });

    const apolloMocks = [fillCommonQueryWithUser(currentUser)];

    render(<Component />, { apolloMocks });

    // Check for main heading
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    // Check for "Available Features" heading
    expect(await screen.findByText('Available Features')).toBeInTheDocument();
    // Check for feature cards (owner should see all 6)
    // Note: Some text like "Documents", "CRUD Items" appears in both stat cards and feature cards
    expect(await screen.findByText('Payments')).toBeInTheDocument();
    expect(await screen.findByText('Subscriptions')).toBeInTheDocument();
    expect(await screen.findByText('Open AI integration')).toBeInTheDocument();
    expect(await screen.findByText('Content items')).toBeInTheDocument();
    const documentsElements = await screen.findAllByText('Documents');
    expect(documentsElements.length).toBeGreaterThan(0);
    const crudElements = await screen.findAllByText(/^CRUD/);
    expect(crudElements.length).toBeGreaterThan(0);
  });

  it('should display dashboard items for member', async () => {
    const tenants = [
      tenantFactory({
        membership: { role: TenantUserRole.MEMBER },
      }),
    ];
    const currentUser = currentUserFactory({
      roles: [Role.USER],
      tenants,
    });

    const apolloMocks = [fillCommonQueryWithUser(currentUser)];

    render(<Component />, { apolloMocks });

    // Check for main heading
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    // Check for "Available Features" heading
    expect(await screen.findByText('Available Features')).toBeInTheDocument();
    // Check for feature cards (member should see 4, without Payments and Subscriptions)
    expect(screen.queryByText('Payments')).not.toBeInTheDocument();
    expect(screen.queryByText('Subscriptions')).not.toBeInTheDocument();
    expect(await screen.findByText('Open AI integration')).toBeInTheDocument();
    expect(await screen.findByText('Content items')).toBeInTheDocument();
    // Note: "Documents" and "CRUD" text appears in both stat cards and feature cards
    const documentsElements = await screen.findAllByText('Documents');
    expect(documentsElements.length).toBeGreaterThan(0);
    const crudElements = await screen.findAllByText(/^CRUD/);
    expect(crudElements.length).toBeGreaterThan(0);
  });
});
