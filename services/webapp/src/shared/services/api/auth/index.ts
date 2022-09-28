import { client } from '../client';
import { OAuthProvider } from '../../../../modules/auth/auth.types';
import { apiURL, apiURLs } from '../helpers';
import { LogoutApiResponseData } from './types';

export const AUTH_URL = apiURLs('/auth/', {
  REFRESH_TOKEN: '/token-refresh/',
  LOGOUT: '/logout/',
  ME: '/me/',
  UPDATE_PROFILE: '/me/',
  UPDATE_AVATAR: '/me/',
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
