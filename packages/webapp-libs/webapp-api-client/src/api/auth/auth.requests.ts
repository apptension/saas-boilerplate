import { client } from '../client';
import { apiURLs } from '../helpers';
import { LogoutApiResponseData } from './auth.types';

export const AUTH_URL = apiURLs('/auth/', {
  REFRESH_TOKEN: '/token-refresh/',
  LOGOUT: '/logout/',
  ME: '/me/',
  UPDATE_PROFILE: '/me/',
  UPDATE_AVATAR: '/me/',
});

export const refreshToken = async () => {
  const res = await client.post<void>(AUTH_URL.REFRESH_TOKEN);
  return res.data;
};

export const logout = async () => {
  const res = await client.post<LogoutApiResponseData>(AUTH_URL.LOGOUT);
  return res.data;
};
