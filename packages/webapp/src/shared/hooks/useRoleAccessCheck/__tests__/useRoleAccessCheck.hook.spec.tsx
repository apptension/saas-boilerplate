import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';

import { Role } from '../../../../modules/auth/auth.types';
import { renderHook } from '../../../../tests/utils/rendering';
import { useRoleAccessCheck } from '../useRoleAccessCheck.hook';

const render = ({ userRoles, allowedRoles }: { userRoles: Role[]; allowedRoles: Role | Role[] }) => {
  const apolloMocks = [
    fillCommonQueryWithUser(
      currentUserFactory({
        roles: userRoles,
      })
    ),
  ];
  return renderHook(() => useRoleAccessCheck(allowedRoles), {
    apolloMocks,
  });
};

describe('useRoleAccessCheck: Hook', () => {
  describe('user doesnt have any allowed role', () => {
    it('should not allow user', async () => {
      const { result, waitForApolloMocks } = render({ userRoles: [], allowedRoles: Role.ADMIN });
      await waitForApolloMocks();
      expect(result.current.isAllowed).toEqual(false);
    });
  });

  describe('user have some allowed roles', () => {
    it('should allow user', async () => {
      const { result, waitForApolloMocks } = render({ userRoles: [Role.USER], allowedRoles: [Role.ADMIN, Role.USER] });
      await waitForApolloMocks();
      expect(result.current.isAllowed).toEqual(true);
    });
  });

  describe('user have all allowed roles', () => {
    it('should allow user', async () => {
      const { result, waitForApolloMocks } = render({
        userRoles: [Role.ADMIN, Role.USER],
        allowedRoles: [Role.ADMIN, Role.USER],
      });
      await waitForApolloMocks();
      expect(result.current.isAllowed).toEqual(true);
    });
  });
});
