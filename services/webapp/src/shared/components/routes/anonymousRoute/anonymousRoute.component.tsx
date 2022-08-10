import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Routes } from '../../../../app/config/routes';
import { selectIsLoggedIn } from '../../../../modules/auth/auth.selectors';
import { selectIsProfileStartupCompleted } from '../../../../modules/startup/startup.selectors';
import { useGenerateLocalePath } from '../../../hooks/localePaths';

export const AnonymousRoute = () => {
  const generateLocalePath = useGenerateLocalePath();
  const isProfileStartupCompleted = useSelector(selectIsProfileStartupCompleted);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  return isLoggedIn || !isProfileStartupCompleted ? <Navigate to={generateLocalePath(Routes.home)} /> : <Outlet />;
};
