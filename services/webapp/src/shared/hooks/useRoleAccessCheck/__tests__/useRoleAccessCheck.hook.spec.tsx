import { RelayMockEnvironment } from 'relay-test-utils';

import { useRoleAccessCheck } from '../useRoleAccessCheck.hook';
import { Role } from '../../../../modules/auth/auth.types';
import { renderHook } from '../../../../tests/utils/rendering';
import { currentUserFactory } from '../../../../mocks/factories';
import { fillCommonQueryWithUser } from '../../../utils/commonQuery';

const render = ({ userRoles, allowedRoles }: { userRoles: Role[]; allowedRoles: Role | Role[] }) => {
  const relayEnvironment = (env: RelayMockEnvironment) =>
    fillCommonQueryWithUser(
      env,
      currentUserFactory({
        roles: userRoles,
      })
    );
  return renderHook(() => useRoleAccessCheck(allowedRoles), {
    relayEnvironment,
  });
};

describe('useRoleAccessCheck: Hook', () => {
  describe('user doesnt have any allowed role', () => {
    it('should not allow user', () => {
      const { result } = render({ userRoles: [], allowedRoles: Role.ADMIN });
      expect(result.current.isAllowed).toEqual(false);
    });
  });

  describe('user have some allowed roles', () => {
    it('should allow user', () => {
      const { result } = render({ userRoles: [Role.USER], allowedRoles: [Role.ADMIN, Role.USER] });
      expect(result.current.isAllowed).toEqual(true);
    });
  });

  describe('user have all allowed roles', () => {
    it('should allow user', () => {
      const { result } = render({ userRoles: [Role.ADMIN, Role.USER], allowedRoles: [Role.ADMIN, Role.USER] });
      expect(result.current.isAllowed).toEqual(true);
    });
  });
});
