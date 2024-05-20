import { Role, TenantUserRole } from '@sb/webapp-api-client';
import { TenantType } from '@sb/webapp-api-client/constants';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { tenantFactory } from '../../../../tests/factories/tenant';
import {
  PLACEHOLDER_CONTENT,
  PLACEHOLDER_TEST_ID,
  CurrentTenantRouteWrapper as TenantWrapper,
  createMockRouterProps,
  render,
} from '../../../../tests/utils/rendering';
import { TenantAuthRoute, TenantAuthRouteProps } from '../tenantAuthRoute.component';

describe('TenantAuthRoute: Component', () => {
  const defaultProps: TenantAuthRouteProps = {};

  const Component = (props: Partial<TenantAuthRouteProps>) => (
    <Routes>
      <Route element={<TenantAuthRoute {...defaultProps} {...props} />}>
        <Route index element={PLACEHOLDER_CONTENT} />
      </Route>
    </Routes>
  );
  const tenants = [
    tenantFactory({
      type: TenantType.PERSONAL,
      membership: { role: TenantUserRole.OWNER },
    }),
    tenantFactory({
      membership: { role: TenantUserRole.ADMIN },
    }),
  ];
  const currentUser = currentUserFactory({
    roles: [Role.USER],
    tenants,
  });

  describe('no allowedRoles prop is specified', () => {
    it('should render content', async () => {
      const apolloMocks = [fillCommonQueryWithUser(currentUser)];
      render(<Component />, { apolloMocks, TenantWrapper });
      expect(await screen.findByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
    });
  });

  describe('user has required role', () => {
    it('should render content', async () => {
      const apolloMocks = [fillCommonQueryWithUser(currentUser)];
      const routerProps = createMockRouterProps(RoutesConfig.home, { tenantId: tenants[1].id });
      render(<Component allowedRoles={TenantUserRole.ADMIN} />, {
        apolloMocks,
        routerProps,
        TenantWrapper,
      });
      expect(await screen.findByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
    });
  });

  describe('user doesnt have required role', () => {
    it('should redirect to not found page', async () => {
      const apolloMocks = [fillCommonQueryWithUser(currentUser)];
      const routerProps = createMockRouterProps(RoutesConfig.home, { tenantId: tenants[1].id });
      render(<Component allowedRoles={TenantUserRole.OWNER} />, {
        apolloMocks,
        routerProps,
        TenantWrapper,
      });
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });
  });
});
