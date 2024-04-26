import { TenantType, TenantUserRole } from '@sb/webapp-api-client';
import { TenantType as TenantTypeType } from '@sb/webapp-api-client/constants';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { useParams } from 'react-router-dom';

import { tenantFactory } from '../../../tests/factories/tenant';
import { CustomRenderOptions, createMockRouterProps, renderHook } from '../../../tests/utils/rendering';
import { useCurrentTenantRole } from '../useCurrentTenantRole.hook';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({ tenantId: undefined }),
}));

const render = ({ tenants }: { tenants: TenantType[] }, opts: CustomRenderOptions = {}) => {
  const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants }))];
  return renderHook(() => useCurrentTenantRole(), {
    apolloMocks,
    ...opts,
  });
};

describe('useCurrentTenantRole: Hook', () => {
  describe('user is not logged in', () => {
    it('should return null', async () => {
      const tenants: TenantType[] = [];
      const { result, waitForApolloMocks } = render({ tenants });
      await waitForApolloMocks();
      expect(result.current).toEqual(null);
    });
  });
  describe('user is member of single tenant', () => {
    it('should return OWNER role', async () => {
      const role = TenantUserRole.OWNER;
      const tenants = [tenantFactory({ membership: { role } })];
      const { result, waitForApolloMocks } = render({ tenants });
      await waitForApolloMocks();
      expect(result.current).toEqual(role);
    });
  });

  describe('user is member of two tenants', () => {
    const tenants = [
      tenantFactory({ membership: { role: TenantUserRole.OWNER } }),
      tenantFactory({
        id: 'fake-tenant-id',
        membership: { role: TenantUserRole.MEMBER },
        type: TenantTypeType.ORGANIZATION,
      }),
    ];

    it('should return the proper role for the owned tenant', async () => {
      const { result, waitForApolloMocks } = render({ tenants });
      await waitForApolloMocks();
      expect(result.current).toEqual(TenantUserRole.OWNER);
    });

    it('should return the proper role for the second tenant', async () => {
      const mockedRouterParams = useParams as jest.Mock;
      mockedRouterParams.mockReturnValue({ tenantId: 'fake-tenant-id' });

      const routerProps = createMockRouterProps(RoutesConfig.home, { tenantId: tenants[1].id });
      const { result, waitForApolloMocks } = render({ tenants }, { routerProps });
      await waitForApolloMocks();
      expect(result.current).toEqual(TenantUserRole.MEMBER);
    });
  });
});
