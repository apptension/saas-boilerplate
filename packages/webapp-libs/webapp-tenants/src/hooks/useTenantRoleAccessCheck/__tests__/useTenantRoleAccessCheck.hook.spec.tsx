import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';

import { TenantRole } from '../../../modules/auth/tenantRole.types';
import { tenantFactory } from '../../../tests/factories/tenant';
import { renderHook } from '../../../tests/utils/rendering';
import { useTenantRoleAccessCheck } from '../useTenantRoleAccessCheck.hook';

const render = ({ role, allowedRoles }: { role: TenantRole; allowedRoles: TenantRole | TenantRole[] }) => {
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
      const { result, waitForApolloMocks } = render({ role: TenantRole.MEMBER, allowedRoles: TenantRole.ADMIN });
      await waitForApolloMocks();
      expect(result.current.isAllowed).toEqual(false);
    });
  });

  describe('user have allowed role', () => {
    it('should allow user', async () => {
      const { result, waitForApolloMocks } = render({
        role: TenantRole.ADMIN,
        allowedRoles: [TenantRole.ADMIN, TenantRole.OWNER],
      });
      await waitForApolloMocks();
      expect(result.current.isAllowed).toEqual(true);
    });
  });
});
