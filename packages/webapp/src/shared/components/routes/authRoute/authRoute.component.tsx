import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { Navigate, Outlet } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import { Role } from '../../../../modules/auth/auth.types';
import { useAuth, useRoleAccessCheck } from '../../../hooks';
import { useGenerateRedirectSearchParams } from './authRoute.hook';

export type AuthRouteProps = {
  allowedRoles?: Role | Role[];
};

/**
 * Renders route only for authenticated users
 *
 * @param allowedRoles
 * @constructor
 *
 * @category Component
 *
 * @example
 * Example route configuration using `AuthRoute` component:
 * ```tsx showLineNumbers
 * <Route path="/" element={<AuthRoute allowedRoles={Role.ADMIN} />}>
 *   <Route index element={<span>Page accessible only by admins</span>} />
 * </Route>
 * ```
 */
export const AuthRoute = ({ allowedRoles = [Role.ADMIN, Role.USER] }: AuthRouteProps) => {
  const { isLoggedIn } = useAuth();
  const { isAllowed } = useRoleAccessCheck(allowedRoles);

  const generateRedirectSearchParams = useGenerateRedirectSearchParams();
  const generateLocalePath = useGenerateLocalePath();

  if (!isAllowed) {
    if (isLoggedIn) return <Navigate to={generateLocalePath(RoutesConfig.notFound)} />;

    return (
      <Navigate
        to={{
          pathname: generateLocalePath(RoutesConfig.login),
          search: generateRedirectSearchParams(),
        }}
      />
    );
  }
  return <Outlet />;
};
