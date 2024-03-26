import { TenantType, TenantUserRole } from '@sb/webapp-api-client';
import { TenantType as TenantTypeType } from '@sb/webapp-api-client/constants';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';

import { tenantFactory } from '../../../tests/factories/tenant';
import { renderHook } from '../../../tests/utils/rendering';
import { useTenants } from '../useTenants.hook';

const render = ({ tenants }: { tenants: TenantType[] }) => {
  const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants }))];
  return renderHook(() => useTenants(), {
    apolloMocks,
  });
};

describe('useTenants: Hook', () => {
  describe('user is not logged in', () => {
    it('should return empty tenants', async () => {
      const tenants: TenantType[] = [];
      const { result, waitForApolloMocks } = render({ tenants });
      await waitForApolloMocks();
      expect(result.current.length).toEqual(0);
    });
  });
  describe('user is member of single tenant', () => {
    it('should return single tenant', async () => {
      const tenants = [tenantFactory({ membership: { role: TenantUserRole.OWNER } })];
      const { result, waitForApolloMocks } = render({ tenants });
      await waitForApolloMocks();
      expect(result.current.length).toEqual(tenants.length);
      expect(result.current[0]?.id).not.toBe(null);
      expect(result.current[0]?.id).toEqual(tenants[0].id);
    });
  });

  describe('user is member of two tenants', () => {
    it('should return two tenants', async () => {
      const tenants = [
        tenantFactory({ membership: { role: TenantUserRole.OWNER } }),
        tenantFactory({ membership: { role: TenantUserRole.MEMBER }, type: TenantTypeType.ORGANIZATION }),
      ];

      const { result, waitForApolloMocks } = render({ tenants });
      await waitForApolloMocks();
      expect(result.current.length).toEqual(tenants.length);
      expect(result.current[0]?.id).not.toBe(null);
      expect(result.current[0]?.id).toEqual(tenants[0].id);
      expect(result.current[1]?.id).not.toBe(null);
      expect(result.current[1]?.id).toEqual(tenants[1].id);
    });
  });
});
