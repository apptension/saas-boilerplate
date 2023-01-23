import { useCallback } from 'react';

import { getOauthUrl } from '../../shared/services/api/auth';
import { OAuthProvider } from './auth.types';

export const useOAuthLogin = () => {
  return useCallback((provider: OAuthProvider) => {
    window.location.href = getOauthUrl(provider);
  }, []);
};
