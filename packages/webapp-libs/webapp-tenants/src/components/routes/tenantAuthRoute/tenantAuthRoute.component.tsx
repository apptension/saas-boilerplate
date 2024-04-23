import { TenantUserRole } from '@sb/webapp-api-client';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { Navigate, Outlet } from 'react-router-dom';

import { useTenantRoleAccessCheck } from '../../../hooks';

export type TenantAuthRouteProps = {
  allowedRoles?: TenantUserRole | TenantUserRole[];
};

/**
 * Renders route only for users that has specific tenant role
 *
 * @param allowedRoles
 * @constructor
 *
 * @category Component
 *
 * @example
 * Example route configuration using `AuthRoute` component:
 * ```tsx showLineNumbers
 * <Route path="/" element={<TenantAuthRoute allowedRoles={TenantUserRole.ADMIN} />}>
 *   <Route index element={<span>Page accessible only by tenant admins</span>} />
 * </Route>
 * ```
 */
export const TenantAuthRoute = ({
  allowedRoles = [TenantUserRole.MEMBER, TenantUserRole.ADMIN, TenantUserRole.OWNER],
}: TenantAuthRouteProps) => {
  const { isAllowed } = useTenantRoleAccessCheck(allowedRoles);
  const generateLocalePath = useGenerateLocalePath();
  const fallbackUrl = generateLocalePath(RoutesConfig.notFound);

  if (!isAllowed) return <Navigate to={fallbackUrl} />;
  return <Outlet />;
};
