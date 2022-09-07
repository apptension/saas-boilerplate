import { actionCreator } from '../helpers/actionCreator';
import {
  ChangePasswordRequestData,
  ChangePasswordResponseData,
  ConfirmEmailRequestData,
  ConfirmEmailResponseData,
  ConfirmPasswordResetRequestData,
  ConfirmPasswordResetResponseData,
  LogoutApiRequestData,
  LogoutApiResponseData,
  RequestPasswordResetRequestData,
  RequestPasswordResetResponseData,
} from '../../shared/services/api/auth/types';
import { OAuthProvider } from './auth.types';

const { createPromiseAction, createAction } = actionCreator('AUTH');

export const logout = createPromiseAction<LogoutApiRequestData, LogoutApiResponseData>('LOGOUT');
export const resetProfile = createAction<void>('RESET_PROFILE');
export const oAuthLogin = createPromiseAction<OAuthProvider, void>('OAUTH_LOGIN');
export const changePassword = createPromiseAction<ChangePasswordRequestData, ChangePasswordResponseData>(
  'CHANGE_PASSWORD'
);
export const confirmEmail = createPromiseAction<ConfirmEmailRequestData, ConfirmEmailResponseData>('CONFIRM_EMAIL');
export const requestPasswordReset = createPromiseAction<
  RequestPasswordResetRequestData,
  RequestPasswordResetResponseData
>('REQUEST_PASSWORD_RESET');
export const confirmPasswordReset = createPromiseAction<
  ConfirmPasswordResetRequestData,
  ConfirmPasswordResetResponseData
>('CONFIRM_PASSWORD_RESET');
