import { useCallback } from 'react';

import { apiURL } from '../helpers';
import { OAuthProvider } from './auth.types';

export const getOauthUrl = (provider: OAuthProvider) =>
  apiURL(`/auth/social/login/${provider}?next=${encodeURIComponent(window.location.origin)}`);

export const useOAuthLogin = () => {
  return useCallback((provider: OAuthProvider) => {
    window.location.href = getOauthUrl(provider);
  }, []);
};
