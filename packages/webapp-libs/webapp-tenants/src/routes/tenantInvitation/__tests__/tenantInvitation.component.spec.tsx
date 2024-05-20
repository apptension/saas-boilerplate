import { TenantUserRole } from '@sb/webapp-api-client';
import { TenantType as TenantTypeType } from '@sb/webapp-api-client/constants';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { getLocalePath, getTenantPathHelper } from '@sb/webapp-core/utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { tenantFactory } from '../../../tests/factories/tenant';
import { createMockRouterProps, render } from '../../../tests/utils/rendering';
import { TenantInvitation } from '../tenantInvitation.component';
import { acceptTenantInvitationMutation, declineTenantInvitationMutation } from '../tenantInvitation.graphql';

jest.mock('@sb/webapp-core/services/analytics');

describe('TenantInvitation: Component', () => {
  const Component = () => (
    <Routes>
      <Route path={getLocalePath(RoutesConfig.tenantInvitation)} element={<TenantInvitation />} />
      <Route path={getLocalePath(RoutesConfig.home)} element={<div>Home page mock</div>} />
      <Route path={getTenantPathHelper(RoutesConfig.home)} element={<div>Org home page mock</div>} />
    </Routes>
  );
  const routePath = RoutesConfig.tenantInvitation;

  describe('token is invalid', () => {
    it('should redirect to home', async () => {
      const routerProps = createMockRouterProps(routePath, { tenantId: '', token: 'invalid-token' });

      render(<Component />, { routerProps });

      expect(await screen.findByText(/Home page mock/i)).toBeInTheDocument();
    });
  });

  describe('token is already accepted', () => {
    it('should redirect to org home', async () => {
      const token = 'valid-token';
      const routerProps = createMockRouterProps(routePath, { tenantId: '', token });
      const targetTenant = tenantFactory({
        membership: { role: TenantUserRole.MEMBER, invitationAccepted: true, invitationToken: token },
        type: TenantTypeType.ORGANIZATION,
      });
      const apolloMocks = [
        fillCommonQueryWithUser(
          currentUserFactory({
            tenants: [tenantFactory({ membership: { role: TenantUserRole.OWNER } }), targetTenant],
          })
        ),
      ];

      render(<Component />, { routerProps, apolloMocks });

      expect(await screen.findByText(/Org home page mock/i)).toBeInTheDocument();
    });
  });

  describe('token is valid', () => {
    it('should send accept mutation on button click', async () => {
      const token = 'valid-token';
      const routerProps = createMockRouterProps(routePath, { tenantId: '', token });
      const targetTenant = tenantFactory({
        membership: { role: TenantUserRole.MEMBER, invitationAccepted: false, invitationToken: token },
        type: TenantTypeType.ORGANIZATION,
      });

      const user = currentUserFactory({
        tenants: [tenantFactory({ membership: { role: TenantUserRole.OWNER } }), targetTenant],
      });

      const variables = {
        input: { token, id: targetTenant.membership.id },
      };
      const data = {
        acceptTenantInvitation: {
          ok: true,
        },
      };
      const requestMock = composeMockedQueryResult(acceptTenantInvitationMutation, {
        variables,
        data,
      });

      const currentUserRefetchData = {
        ...user,
        tenants: [
          user.tenants![0],
          {
            ...targetTenant,
            membership: {
              ...targetTenant.membership,
              invitationAccepted: true,
            },
          },
        ],
      };
      const refetchMock = fillCommonQueryWithUser(currentUserRefetchData);

      requestMock.newData = jest.fn(() => ({
        data,
      }));

      refetchMock.newData = jest.fn(() => ({
        data: {
          currentUser: currentUserRefetchData,
        },
      }));

      const apolloMocks = [fillCommonQueryWithUser(user), requestMock, refetchMock];

      render(<Component />, { routerProps, apolloMocks });

      expect(await screen.findByText(/Accept/i)).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: /accept/i }));

      expect(requestMock.newData).toHaveBeenCalled();
      expect(refetchMock.newData).toHaveBeenCalled();

      const toast = await screen.findByTestId('toast-1');

      expect(trackEvent).toHaveBeenCalledWith('tenantInvitation', 'accept', targetTenant.id);
      expect(toast).toHaveTextContent('🎉 Invitation accepted!');
    });

    it('should send decline mutation on button click', async () => {
      const token = 'valid-token';
      const routerProps = createMockRouterProps(routePath, { tenantId: '', token });
      const targetTenant = tenantFactory({
        membership: { role: TenantUserRole.MEMBER, invitationAccepted: false, invitationToken: token },
        type: TenantTypeType.ORGANIZATION,
      });

      const user = currentUserFactory({
        tenants: [tenantFactory({ membership: { role: TenantUserRole.OWNER } }), targetTenant],
      });

      const variables = {
        input: { token, id: targetTenant.membership.id },
      };
      const data = {
        declineTenantInvitation: {
          ok: true,
        },
      };
      const requestMock = composeMockedQueryResult(declineTenantInvitationMutation, {
        variables,
        data,
      });

      const currentUserRefetchData = {
        ...user,
        tenants: [user.tenants![0]],
      };
      const refetchMock = fillCommonQueryWithUser(currentUserRefetchData);

      requestMock.newData = jest.fn(() => ({
        data,
      }));

      refetchMock.newData = jest.fn(() => ({
        data: {
          currentUser: currentUserRefetchData,
        },
      }));

      const apolloMocks = [fillCommonQueryWithUser(user), requestMock, refetchMock];

      render(<Component />, { routerProps, apolloMocks });

      expect(await screen.findByText(/Decline/i)).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: /decline/i }));

      expect(requestMock.newData).toHaveBeenCalled();
      expect(refetchMock.newData).toHaveBeenCalled();

      const toast = await screen.findByTestId('toast-1');

      expect(trackEvent).toHaveBeenCalledWith('tenantInvitation', 'decline', targetTenant.id);
      expect(toast).toHaveTextContent('🎉 Invitation declined!');
    });
  });
});
