import { actionCreator } from '../helpers/actionCreator';
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
  UpdateProfileApiRequestData,
  UpdateProfileApiResponseData,
} from '../../shared/services/api/auth/types';
import { OAuthProvider } from './auth.types';

const { createPromiseAction, createActionRoutine, createAction } = actionCreator('AUTH');

export const signup = createPromiseAction<SignupApiRequestData, SignupApiResponseData>('SIGNUP');
export const login = createPromiseAction<LoginApiRequestData, LoginApiResponseData>('LOGIN');
export const logout = createActionRoutine<LogoutApiRequestData, LogoutApiResponseData>('LOGOUT');
export const resetProfile = createAction<void>('RESET_PROFILE');
export const oAuthLogin = createPromiseAction<OAuthProvider, void>('OAUTH_LOGIN');
export const changePassword = createPromiseAction<ChangePasswordRequestData, ChangePasswordResponseData>(
  'CHANGE_PASSWORD'
);
export const fetchProfile = createActionRoutine<MeApiRequestData, MeApiResponseData>('FETCH_PROFILE');
export const updateProfile = createPromiseAction<UpdateProfileApiRequestData, UpdateProfileApiResponseData>(
  'UPDATE_PROFILE'
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
