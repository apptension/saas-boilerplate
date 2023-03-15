import { useAuth } from '../';
import { Role } from '../../../modules/auth/auth.types';

export const useRoleAccessCheck = (allowedRole: Role | Role[] = [Role.ADMIN, Role.USER]) => {
  const { currentUser } = useAuth();
  const userRoles = currentUser?.roles || [];
  const allowedRolesArray = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
  return {
    isAllowed: allowedRolesArray.some((role) => userRoles.includes(role)),
  };
};
