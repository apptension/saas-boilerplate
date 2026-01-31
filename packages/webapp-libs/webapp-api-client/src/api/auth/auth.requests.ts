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

interface RefreshTokenResponse {
  access?: string;
  refresh?: string;
}

export const refreshToken = async () => {
  // For Safari/mobile: pass refresh token from localStorage in request body
  // because Safari blocks third-party cookies (ITP)
  // Backend accepts refresh token from either cookie or request body
  let refreshTokenValue: string | null = null;
  try {
    refreshTokenValue = localStorage.getItem('refresh_token');
  } catch {
    // Ignore storage errors
  }
  
  const res = await client.post<RefreshTokenResponse>(
    AUTH_URL.REFRESH_TOKEN,
    refreshTokenValue ? { refresh: refreshTokenValue } : undefined
  );
  
  // Store new tokens in localStorage for Safari/mobile fallback
  // When cookies are blocked, this ensures the Authorization header has fresh tokens
  if (res.data?.access) {
    try {
      localStorage.setItem('token', res.data.access);
      if (res.data.refresh) {
        localStorage.setItem('refresh_token', res.data.refresh);
      }
    } catch {
      // Ignore storage errors (e.g., private browsing mode)
    }
  }
  
  return res.data;
};

export const logout = async () => {
  // For Safari/mobile: pass refresh token from localStorage in request body
  // because Safari blocks third-party cookies (ITP)
  // Backend accepts refresh token from either cookie or request body
  let refreshTokenValue: string | null = null;
  try {
    refreshTokenValue = localStorage.getItem('refresh_token');
  } catch {
    // Ignore storage errors
  }
  
  const res = await client.post<LogoutApiResponseData>(
    AUTH_URL.LOGOUT,
    refreshTokenValue ? { refresh: refreshTokenValue } : undefined
  );
  return res.data;
};
