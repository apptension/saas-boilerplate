import { renderHook } from '@testing-library/react-hooks';
import { useRoleAccessCheck } from '../useRoleAccessCheck.hook';
import { Role } from '../../../../modules/auth/auth.types';
import { ProvidersWrapper } from '../../../utils/testUtils';
import { prepareState } from '../../../../mocks/store';
import { userProfileFactory } from '../../../../mocks/factories';

const render = ({ userRoles, allowedRoles }: { userRoles: Role[]; allowedRoles: Role | Role[] }) => {
  const store = prepareState((state) => {
    state.auth.profile = userProfileFactory({
      email: 'user@mail.com',
      roles: userRoles,
    });
  });
  return renderHook(() => useRoleAccessCheck(allowedRoles), {
    wrapper: ({ children }) => <ProvidersWrapper context={{ store }}>{children}</ProvidersWrapper>,
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
