import { ApolloProvider as Provider } from '@apollo/client';
import { apolloClient, apolloEmitter } from '@sb/webapp-api-client';
import { useLocales } from '@sb/webapp-core/hooks';
import { ToastEmitterActions } from '@sb/webapp-core/toast/toastProvider/toastProvider.types';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { ReactNode, useEffect } from 'react';

export const ApolloProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const {
    locales: { language },
  } = useLocales();

  useEffect(() => {
    apolloEmitter.addEventListener(ToastEmitterActions.ADD_TOAST, toast);

    return () => {
      apolloEmitter.removeEventListener(ToastEmitterActions.ADD_TOAST, toast);
    };
  }, [toast]);

  useEffect(() => {
    localStorage.setItem('LOCALES_LANGUAGE', language || '');
  }, [language]);

  return <Provider client={apolloClient}>{children}</Provider>;
};
