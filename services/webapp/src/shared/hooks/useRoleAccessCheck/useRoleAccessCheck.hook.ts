import { useSelector } from 'react-redux';
import { Role } from '../../../modules/auth/auth.types';
import { selectProfileRoles } from '../../../modules/auth/auth.selectors';

export const useRoleAccessCheck = (allowedRole: Role | Role[] = [Role.ADMIN, Role.USER]) => {
  const userRoles = useSelector(selectProfileRoles);
  const allowedRolesArray = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
  return {
    isAllowed: allowedRolesArray.some((role) => userRoles.includes(role)),
  };
};
