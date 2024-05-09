import { TenantUserRole } from '@sb/webapp-api-client';
import { ReactNode } from 'react';

import { useTenantRoleAccessCheck } from '../../hooks';

export type RoleAccessProps = {
  children: ReactNode;
  allowedRoles?: TenantUserRole | TenantUserRole[];
};

export const TenantRoleAccess = ({ children, allowedRoles }: RoleAccessProps) => {
  const { isAllowed } = useTenantRoleAccessCheck(allowedRoles);
  return <>{isAllowed ? children : null}</>;
};
