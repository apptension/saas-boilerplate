import { Outlet, Navigate } from 'react-router-dom';
import { Role } from '../../../../modules/auth/auth.types';
import { useRoleAccessCheck } from '../../../hooks/useRoleAccessCheck';
import { RoutesConfig } from '../../../../app/config/routes';
import { useGenerateLocalePath } from '../../../hooks/localePaths';
import { useAuth } from '../../../hooks/useAuth/useAuth';

export type AuthRouteProps = {
  allowedRoles?: Role | Role[];
};

export const AuthRoute = ({ allowedRoles = [Role.ADMIN, Role.USER] }: AuthRouteProps) => {
  const { isLoggedIn } = useAuth();
  const { isAllowed } = useRoleAccessCheck(allowedRoles);
  const generateLocalePath = useGenerateLocalePath();
  const fallbackUrl = isLoggedIn ? generateLocalePath(RoutesConfig.notFound) : generateLocalePath(RoutesConfig.login);

  if (!isAllowed) return <Navigate to={fallbackUrl} />;
  return <Outlet />;
};
