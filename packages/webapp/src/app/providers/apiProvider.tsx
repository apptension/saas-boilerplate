import { ApiClientEvents, apiEmitter } from '@sb/webapp-api-client';
import { useLocales } from '@sb/webapp-core/hooks';
import { FC, PropsWithChildren, useCallback, useEffect } from 'react';
import { generatePath, useNavigate } from 'react-router';

import { RoutesConfig } from '../config/routes';

export const ApiProvider: FC<PropsWithChildren> = ({ children }) => {
  const {
    locales: { language },
  } = useLocales();
  const navigate = useNavigate();

  const navigateToLogout = useCallback(() => {
    navigate(generatePath(RoutesConfig.getLocalePath([RoutesConfig.logout]), { lang: language }));
  }, [navigate, language]);

  useEffect(() => {
    apiEmitter.addEventListener(ApiClientEvents.FORCE_LOGOUT_REQUESTED, navigateToLogout);
    return () => {
      apiEmitter.removeEventListener(ApiClientEvents.FORCE_LOGOUT_REQUESTED, navigateToLogout);
    };
  }, [navigateToLogout]);

  useEffect(() => {
    localStorage.setItem('LOCALES_LANGUAGE', language || '');
  }, [language]);

  return <>{children}</>;
};
