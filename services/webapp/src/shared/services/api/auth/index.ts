import { client } from '../client';
import {
  SignupApiRequestData,
  LoginApiRequestData,
  LoginApiResponseData,
  SignupApiResponseData,
  MeApiResponseData,
  ChangePasswordResponseData,
  ChangePasswordRequestData,
  ConfirmEmailRequestData,
  ConfirmEmailResponseData,
  RequestPasswordResetRequestData,
  RequestPasswordResetResponseData,
  ConfirmPasswordResetRequestData,
  ConfirmPasswordResetResponseData,
} from './types';

export const AUTH_URL = '/auth';
export const AUTH_SIGNUP_URL = AUTH_URL + `/signup/`;
export const AUTH_LOGIN_URL = AUTH_URL + `/token/`;
export const AUTH_ME_URL = AUTH_URL + `/me/`;
export const AUTH_CHANGE_PASSWORD_URL = AUTH_URL + `/change-password/`;
export const AUTH_CONFIRM_EMAIL_URL = AUTH_URL + `/confirm/`;
export const AUTH_REQUEST_PASSWORD_RESET_URL = `/password-reset/`;
export const AUTH_CONFIRM_PASSWORD_RESET_URL = `/password-reset/confirm/`;

export const signup = async (creds: SignupApiRequestData) => {
  const res = await client.post<SignupApiResponseData>(AUTH_SIGNUP_URL, creds);
  return res.data;
};

export const login = async (creds: LoginApiRequestData) => {
  const res = await client.post<LoginApiResponseData>(AUTH_LOGIN_URL, creds);
  return res.data;
};

export const me = async () => {
  const res = await client.get<MeApiResponseData>(AUTH_ME_URL);
  return res.data;
};

export const changePassword = async (data: ChangePasswordRequestData) => {
  const res = await client.post<ChangePasswordResponseData>(AUTH_CHANGE_PASSWORD_URL, data);
  return res.data;
};

export const confirmEmail = async (data: ConfirmEmailRequestData) => {
  const res = await client.post<ConfirmEmailResponseData>(AUTH_CONFIRM_EMAIL_URL, data);
  return res.data;
};

export const requestPasswordReset = async (data: RequestPasswordResetRequestData) => {
  const res = await client.post<RequestPasswordResetResponseData>(AUTH_REQUEST_PASSWORD_RESET_URL, data);
  return res.data;
};

export const confirmPasswordReset = async (data: ConfirmPasswordResetRequestData) => {
  const res = await client.post<ConfirmPasswordResetResponseData>(AUTH_CONFIRM_PASSWORD_RESET_URL, data);
  return res.data;
};
