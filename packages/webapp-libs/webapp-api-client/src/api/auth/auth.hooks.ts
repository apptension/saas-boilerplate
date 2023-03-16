import { useLocales } from '@sb/webapp-core/hooks';
import { useCallback } from 'react';

import { apiURL } from '../helpers';
import { OAuthProvider } from './auth.types';

export const getOauthUrl = (provider: OAuthProvider, locale?: string) =>
  apiURL(`/auth/social/login/${provider}?next=${encodeURIComponent(window.location.origin)}&locale=${locale ?? 'en'}`);

export const useOAuthLogin = () => {
  const {
    locales: { language },
  } = useLocales();

  return useCallback(
    (provider: OAuthProvider) => {
      window.location.href = getOauthUrl(provider, language);
    },
    [language]
  );
};
