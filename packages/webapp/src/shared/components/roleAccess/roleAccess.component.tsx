import { ReactNode } from 'react';

import { Role } from '../../../modules/auth/auth.types';
import { useRoleAccessCheck } from '../../hooks';

export type RoleAccessProps = {
  children: ReactNode;
  allowedRoles?: Role | Role[];
};

export const RoleAccess = ({ children, allowedRoles }: RoleAccessProps) => {
  const { isAllowed } = useRoleAccessCheck(allowedRoles);
  return <>{isAllowed ? children : null}</>;
};
