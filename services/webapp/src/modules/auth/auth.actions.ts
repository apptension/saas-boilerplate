import { actionCreator } from '../helpers';
import {
  ChangePasswordRequestData,
  ChangePasswordResponseData,
  ConfirmEmailRequestData,
  ConfirmEmailResponseData,
  ConfirmPasswordResetRequestData,
  ConfirmPasswordResetResponseData,
  LoginApiRequestData,
  LoginApiResponseData,
  LogoutApiRequestData,
  LogoutApiResponseData,
  MeApiRequestData,
  MeApiResponseData,
  RequestPasswordResetRequestData,
  RequestPasswordResetResponseData,
  SignupApiRequestData,
  SignupApiResponseData,
} from '../../shared/services/api/auth/types';

const { createPromiseAction } = actionCreator('AUTH');

export const signup = createPromiseAction<SignupApiRequestData, SignupApiResponseData>('SIGNUP');
export const login = createPromiseAction<LoginApiRequestData, LoginApiResponseData>('LOGIN');
export const logout = createPromiseAction<LogoutApiRequestData, LogoutApiResponseData>('LOGOUT');
export const changePassword = createPromiseAction<ChangePasswordRequestData, ChangePasswordResponseData>(
  'CHANGE_PASSWORD'
);
export const fetchProfile = createPromiseAction<MeApiRequestData, MeApiResponseData>('FETCH_PROFILE');
export const confirmEmail = createPromiseAction<ConfirmEmailRequestData, ConfirmEmailResponseData>('CONFIRM_EMAIL');
export const requestPasswordReset = createPromiseAction<
  RequestPasswordResetRequestData,
  RequestPasswordResetResponseData
>('REQUEST_PASSWORD_RESET');
export const confirmPasswordReset = createPromiseAction<
  ConfirmPasswordResetRequestData,
  ConfirmPasswordResetResponseData
>('CONFIRM_PASSWORD_RESET');
