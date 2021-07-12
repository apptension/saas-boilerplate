import { client } from '../client';
import { OAuthProvider } from '../../../../modules/auth/auth.types';
import { apiURL, apiURLs } from '../helpers';
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
  LogoutApiResponseData,
  UpdateProfileApiResponseData,
  UpdateProfileApiRequestData,
  UpdateAvatarApiRequestData,
  UpdateAvatarApiResponseData,
} from './types';

export const AUTH_URL = apiURLs('/auth/', {
  SIGN_UP: '/signup/',
  LOGIN: '/token/',
  REFRESH_TOKEN: '/token-refresh/',
  LOGOUT: '/logout/',
  ME: '/me/',
  UPDATE_PROFILE: '/me/',
  UPDATE_AVATAR: '/me/',
  CHANGE_PASSWORD: '/change-password/',
  CONFIRM_EMAIL: '/confirm/',
});

export const AUTH_PASSWORD_RESET_URL = apiURLs(`/password-reset/`, {
  REQUEST: '',
  CONFIRM: '/confirm/',
});

export const getOauthUrl = (provider: OAuthProvider) =>
  apiURL(`/auth/social/login/${provider}?next=${encodeURIComponent(window.location.origin)}`);

export const signup = async (creds: SignupApiRequestData) => {
  const res = await client.post<SignupApiResponseData>(AUTH_URL.SIGN_UP, creds);
  return res.data;
};

export const login = async (creds: LoginApiRequestData) => {
  const res = await client.post<LoginApiResponseData>(AUTH_URL.LOGIN, creds);
  return res.data;
};

export const refreshToken = async () => {
  const res = await client.post<void>(AUTH_URL.REFRESH_TOKEN);
  return res.data;
};

export const logout = async () => {
  const res = await client.post<LogoutApiResponseData>(AUTH_URL.LOGOUT);
  return res.data;
};

export const me = async () => {
  const res = await client.get<MeApiResponseData>(AUTH_URL.ME);
  return res.data;
};

export const updateProfile = async (data: UpdateProfileApiRequestData) => {
  const res = await client.put<UpdateProfileApiResponseData>(AUTH_URL.UPDATE_PROFILE, data);
  return res.data;
};

export const updateAvatar = async (data: UpdateAvatarApiRequestData) => {
  const formData = new FormData();
  if (data.avatar) {
    formData.append('avatar', data.avatar);
  }
  const res = await client.put<UpdateAvatarApiResponseData>(AUTH_URL.UPDATE_AVATAR, formData);
  return res.data;
};

export const changePassword = async (data: ChangePasswordRequestData) => {
  const res = await client.post<ChangePasswordResponseData>(AUTH_URL.CHANGE_PASSWORD, data);
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
