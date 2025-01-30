import { TenantType } from '@sb/webapp-api-client';
import { TenantType as TenantTypeType } from '@sb/webapp-api-client/constants';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { useParams } from 'react-router-dom';

import { tenantFactory } from '../../../tests/factories/tenant';
import { CustomRenderOptions, createMockRouterProps, renderHook } from '../../../tests/utils/rendering';
import { useCurrentTenantMembership } from '../useCurrentTenantMembership.hook';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({ tenantId: undefined }),
}));

const render = ({ tenants }: { tenants: TenantType[] }, opts: CustomRenderOptions = {}) => {
  const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants }))];
  return renderHook(() => useCurrentTenantMembership(), {
    apolloMocks,
    ...opts,
  });
};

describe('useCurrentTenantMembership: Hook', () => {
  describe('user is not logged in', () => {
    it('should return undefined', async () => {
      const tenants: TenantType[] = [];
      const { result, waitForApolloMocks } = render({ tenants });
      await waitForApolloMocks();
      expect(result.current).toEqual({ currentMembership: undefined });
    });
  });
  describe('user is member of single tenant', () => {
    it('should return membership', async () => {
      const tenants = [tenantFactory()];
      const { result, waitForApolloMocks } = render({ tenants });
      await waitForApolloMocks();
      expect(result.current).toEqual({ currentMembership: tenants[0].membership });
    });
  });

  describe('user is member of two tenants', () => {
    const tenants = [
      tenantFactory(),
      tenantFactory({
        id: 'fake-tenant-id',
        type: TenantTypeType.ORGANIZATION,
      }),
    ];

    it('should return the membership for the owned tenant', async () => {
      const { result, waitForApolloMocks } = render({ tenants });
      await waitForApolloMocks();
      expect(result.current).toEqual({ currentMembership: tenants[0].membership });
    });

    it('should return the membership for the second tenant', async () => {
      const mockedRouterParams = useParams as jest.Mock;
      mockedRouterParams.mockReturnValue({ tenantId: 'fake-tenant-id' });

      const routerProps = createMockRouterProps(RoutesConfig.home, { tenantId: tenants[1].id });
      const { result, waitForApolloMocks } = render({ tenants }, { routerProps });
      await waitForApolloMocks();
      expect(result.current).toEqual({ currentMembership: tenants[1].membership });
    });
  });
});
