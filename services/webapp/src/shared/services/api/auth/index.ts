import { client } from '../client';
import { OAuthProvider } from '../../../../modules/auth/auth.types';
import { apiURL, apiURLs } from '../helpers';
import {
  ConfirmEmailRequestData,
  ConfirmEmailResponseData,
  RequestPasswordResetRequestData,
  RequestPasswordResetResponseData,
  ConfirmPasswordResetRequestData,
  ConfirmPasswordResetResponseData,
  LogoutApiResponseData,
} from './types';

export const AUTH_URL = apiURLs('/auth/', {
  REFRESH_TOKEN: '/token-refresh/',
  LOGOUT: '/logout/',
  ME: '/me/',
  UPDATE_PROFILE: '/me/',
  UPDATE_AVATAR: '/me/',
  CONFIRM_EMAIL: '/confirm/',
});

export const AUTH_PASSWORD_RESET_URL = apiURLs(`/password-reset/`, {
  REQUEST: '',
  CONFIRM: '/confirm/',
});

export const getOauthUrl = (provider: OAuthProvider) =>
  apiURL(`/auth/social/login/${provider}?next=${encodeURIComponent(window.location.origin)}`);

export const refreshToken = async () => {
  const res = await client.post<void>(AUTH_URL.REFRESH_TOKEN);
  return res.data;
};

export const logout = async () => {
  const res = await client.post<LogoutApiResponseData>(AUTH_URL.LOGOUT);
  return res.data;
};

export const confirmEmail = async (data: ConfirmEmailRequestData) => {
  const res = await client.post<ConfirmEmailResponseData>(AUTH_URL.CONFIRM_EMAIL, data);
  return res.data;
};

export const requestPasswordReset = async (data: RequestPasswordResetRequestData) => {
  const res = await client.post<RequestPasswordResetResponseData>(AUTH_PASSWORD_RESET_URL.REQUEST, data);
  return res.data;
};

export const confirmPasswordReset = async (data: ConfirmPasswordResetRequestData) => {
  const res = await client.post<ConfirmPasswordResetResponseData>(AUTH_PASSWORD_RESET_URL.CONFIRM, data);
  return res.data;
};
