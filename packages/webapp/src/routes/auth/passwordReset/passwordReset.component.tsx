import { Route, Routes } from 'react-router-dom';
import { RoutesConfig } from '../../../app/config/routes';
import { asyncComponent } from '../../../shared/utils/asyncComponent';

// @ts-ignore
const PasswordResetRequest = asyncComponent(() => import('./passwordResetRequest'));
// @ts-ignore
const PasswordResetConfirm = asyncComponent(() => import('./passwordResetConfirm'));

export const PasswordReset = () => {
  return (
    <Routes>
      <Route index element={<PasswordResetRequest />} />
      <Route path={`${RoutesConfig.passwordReset.getRelativeUrl('confirm')}`} element={<PasswordResetConfirm />} />
    </Routes>
  );
};
