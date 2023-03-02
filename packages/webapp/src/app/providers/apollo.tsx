import { ApolloProvider as Provider } from '@apollo/client';
import { ReactNode, useEffect } from 'react';

import { useLocales, useSnackbar } from '../../shared/hooks';
import { client, emitter } from '../../shared/services/graphqlApi/apolloClient';
import { SnackbarEmitterActions } from './snackbarProvider';

export const ApolloProvider = ({ children }: { children: ReactNode }) => {
  const { showMessage } = useSnackbar();
  const {
    locales: { language },
  } = useLocales();

  useEffect(() => {
    emitter.addEventListener(SnackbarEmitterActions.SNACKBAR_SHOW_MESSAGE, showMessage);

    return () => {
      emitter.removeEventListener(SnackbarEmitterActions.SNACKBAR_SHOW_MESSAGE, showMessage);
    };
  }, [showMessage]);

  useEffect(() => {
    localStorage.setItem('LOCALES_LANGUAGE', language || '');
  }, [language]);

  return <Provider client={client}>{children}</Provider>;
};
