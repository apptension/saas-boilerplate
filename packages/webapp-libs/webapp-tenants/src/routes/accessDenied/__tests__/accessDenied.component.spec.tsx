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
import { AccessDenied } from '../accessDenied.component';

describe('AccessDenied: Component', () => {
  const Component = () => (
    <CurrentTenantRouteWrapper>
      <AccessDenied />
    </CurrentTenantRouteWrapper>
  );

  it('should render access denied message', async () => {
    const tenant = tenantFactory();
    const user = currentUserFactory({ tenants: [tenant] });
    const routerProps = createMockRouterProps(RoutesConfig.tenant.accessDenied, { tenantId: tenant.id });

    render(<Component />, {
      apolloMocks: [fillCommonQueryWithUser(user)],
      routerProps,
    });

    expect(await screen.findByRole('heading', { name: /access denied/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have permission/i)).toBeInTheDocument();
  });

  it('should navigate back when Go Back is clicked', async () => {
    const tenant = tenantFactory();
    const user = currentUserFactory({ tenants: [tenant] });
    const routerProps = createMockRouterProps(RoutesConfig.tenant.accessDenied, {
      tenantId: tenant.id,
    });

    render(<Component />, {
      apolloMocks: [fillCommonQueryWithUser(user)],
      routerProps,
    });

    const goBackButton = await screen.findByRole('button', { name: /go back/i });
    await userEvent.click(goBackButton);
  });

  it('should navigate to home when Go to Home is clicked', async () => {
    const tenant = tenantFactory();
    const user = currentUserFactory({ tenants: [tenant] });
    const routerProps = createMockRouterProps(RoutesConfig.tenant.accessDenied, {
      tenantId: tenant.id,
    });

    render(<Component />, {
      apolloMocks: [fillCommonQueryWithUser(user)],
      routerProps,
    });

    const goHomeButton = await screen.findByRole('button', { name: /go to home/i });
    await userEvent.click(goHomeButton);
  });
});
