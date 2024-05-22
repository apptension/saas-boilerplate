import { useLocales } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useCallback } from 'react';

import { apiURL } from '../helpers';
import { OAuthProvider } from './auth.types';

export const getOauthUrl = (provider: OAuthProvider, locale = 'en') =>
  apiURL(`/auth/social/login/${provider}?next=${encodeURIComponent(window.location.href)}&locale=${locale}`);

export const useOAuthLogin = () => {
  const {
    locales: { language },
  } = useLocales();

  return useCallback(
    (provider: OAuthProvider) => {
      trackEvent('auth', 'log-in-oauth', provider);
      window.location.href = getOauthUrl(provider, language ?? undefined);
    },
    [language]
  );
};
