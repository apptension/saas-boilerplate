import { ApolloProvider as Provider } from '@apollo/client';
import { apolloClient, apolloEmitter } from '@sb/webapp-api-client';
import { useLocales } from '@sb/webapp-core/hooks';
import { SnackbarEmitterActions, useSnackbar } from '@sb/webapp-core/snackbar';
import { ReactNode, useEffect } from 'react';

export const ApolloProvider = ({ children }: { children: ReactNode }) => {
  const { showMessage } = useSnackbar();
  const {
    locales: { language },
  } = useLocales();

  useEffect(() => {
    apolloEmitter.addEventListener(SnackbarEmitterActions.SNACKBAR_SHOW_MESSAGE, showMessage);

    return () => {
      apolloEmitter.removeEventListener(SnackbarEmitterActions.SNACKBAR_SHOW_MESSAGE, showMessage);
    };
  }, [showMessage]);

  useEffect(() => {
    localStorage.setItem('LOCALES_LANGUAGE', language || '');
  }, [language]);

  return <Provider client={apolloClient}>{children}</Provider>;
};
