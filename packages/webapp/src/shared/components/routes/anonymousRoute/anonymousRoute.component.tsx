import { Navigate, Outlet } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import { useAuth, useGenerateLocalePath } from '../../../hooks';

export const AnonymousRoute = () => {
  const generateLocalePath = useGenerateLocalePath();
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? <Navigate to={generateLocalePath(RoutesConfig.home)} /> : <Outlet />;
};
