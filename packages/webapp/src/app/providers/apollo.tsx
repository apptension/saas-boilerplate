import { ApolloProvider as Provider } from '@apollo/client';
import { useLocales } from '@saas-boilerplate-app/webapp-core/hooks';
import { SnackbarEmitterActions, useSnackbar } from '@saas-boilerplate-app/webapp-core/snackbar';
import { ReactNode, useEffect } from 'react';

import { client, emitter } from '../../shared/services/graphqlApi/apolloClient';

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
