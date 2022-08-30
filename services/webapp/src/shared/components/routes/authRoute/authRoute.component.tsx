import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsProfileStartupCompleted } from '../../../../modules/startup/startup.selectors';
import { Role } from '../../../../modules/auth/auth.types';
import { useRoleAccessCheck } from '../../../hooks/useRoleAccessCheck';
import { RoutesConfig } from '../../../../app/config/routes';
import { selectIsLoggedIn } from '../../../../modules/auth/auth.selectors';
import { useGenerateLocalePath } from '../../../hooks/localePaths';

export type AuthRouteProps = {
  allowedRoles?: Role | Role[];
};

export const AuthRoute = ({ allowedRoles = [Role.ADMIN, Role.USER] }: AuthRouteProps) => {
  const isProfileStartupCompleted = useSelector(selectIsProfileStartupCompleted);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const { isAllowed } = useRoleAccessCheck(allowedRoles);
  const generateLocalePath = useGenerateLocalePath();
  const fallbackUrl = isLoggedIn ? generateLocalePath(RoutesConfig.notFound) : generateLocalePath(RoutesConfig.login);

  if (isProfileStartupCompleted && !isAllowed) return <Navigate to={fallbackUrl} />;
  if (!isProfileStartupCompleted || !isAllowed) return null;
  return <Outlet />;
};
