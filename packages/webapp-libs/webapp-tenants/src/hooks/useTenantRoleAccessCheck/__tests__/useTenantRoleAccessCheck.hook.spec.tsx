import { TenantUserRole } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';

import { tenantFactory } from '../../../tests/factories/tenant';
import { renderHook } from '../../../tests/utils/rendering';
import { useTenantRoleAccessCheck } from '../useTenantRoleAccessCheck.hook';

const render = ({ role, allowedRoles }: { role: TenantUserRole; allowedRoles: TenantUserRole | TenantUserRole[] }) => {
  const apolloMocks = [
    fillCommonQueryWithUser(currentUserFactory({ tenants: [tenantFactory({ membership: { role } })] })),
  ];
  return renderHook(() => useTenantRoleAccessCheck(allowedRoles), {
    apolloMocks,
  });
};

describe('useTenantRoleAccessCheck: Hook', () => {
  describe('user doesnt have allowed role', () => {
    it('should not allow user', async () => {
      const { result, waitForApolloMocks } = render({
        role: TenantUserRole.MEMBER,
        allowedRoles: TenantUserRole.ADMIN,
      });
      await waitForApolloMocks();
      expect(result.current.isAllowed).toEqual(false);
    });
  });

  describe('user have allowed role', () => {
    it('should allow user', async () => {
      const { result, waitForApolloMocks } = render({
        role: TenantUserRole.ADMIN,
        allowedRoles: [TenantUserRole.ADMIN, TenantUserRole.OWNER],
      });
      await waitForApolloMocks();
      expect(result.current.isAllowed).toEqual(true);
    });
  });
});
