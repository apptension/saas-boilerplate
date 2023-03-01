import { Outlet, Navigate } from 'react-router-dom';
import { RoutesConfig } from '../../../../app/config/routes';
import { useGenerateLocalePath , useAuth } from '../../../hooks/';

export const AnonymousRoute = () => {
  const generateLocalePath = useGenerateLocalePath();
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? <Navigate to={generateLocalePath(RoutesConfig.home)} /> : <Outlet />;
};
