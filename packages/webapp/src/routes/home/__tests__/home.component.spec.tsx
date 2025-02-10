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

    // 6 items + heading + alert
    expect(await screen.findAllByRole('heading')).toHaveLength(8);
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

    // 6 items + heading + alert
    expect(await screen.findAllByRole('heading')).toHaveLength(6);
  });
});
