import { Route, Routes as RouterRoutes } from 'react-router-dom';
import { Routes } from '../../../app/config/routes';
import { asyncComponent } from '../../../shared/utils/asyncComponent';

// @ts-ignore
const PasswordResetRequest = asyncComponent(() => import('./passwordResetRequest'), 'PasswordResetRequest');
// @ts-ignore
const PasswordResetConfirm = asyncComponent(() => import('./passwordResetConfirm'), 'PasswordResetConfirm');

export const PasswordReset = () => {
  return (
    <RouterRoutes>
      <Route index element={<PasswordResetRequest />} />
      <Route path={`${Routes.passwordReset.getRelativeUrl('confirm')}`} element={<PasswordResetConfirm />} />
    </RouterRoutes>
  );
};
