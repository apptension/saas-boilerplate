import { Outlet, Navigate } from 'react-router-dom';
import { RoutesConfig } from '../../../../app/config/routes';
import { useGenerateLocalePath } from '../../../hooks/localePaths';
import { useAuth } from '../../../hooks/useAuth/useAuth';

export const AnonymousRoute = () => {
  const generateLocalePath = useGenerateLocalePath();
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? <Navigate to={generateLocalePath(RoutesConfig.home)} /> : <Outlet />;
};
