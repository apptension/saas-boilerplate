import { useMutation } from '@apollo/client';
import { invalidateApolloStore } from '@sb/webapp-api-client';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useIntl } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import { authSinginMutation } from './loginForm.graphql';
import { LoginFormFields } from './loginForm.types';

export const useLoginForm = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();
  const { reload: reloadCommonQuery } = useCommonQuery();
  const { search } = useLocation();

  const form = useApiForm<LoginFormFields>({
    errorMessages: {
      nonFieldErrors: {
        no_active_account: intl.formatMessage({
          defaultMessage: 'Incorrect authentication credentials.',
          id: 'Login form / error / no active account',
        }),
        authentication_failed: intl.formatMessage({
          defaultMessage: 'Incorrect authentication credentials.',
          id: 'Login form / error / authentication failed',
        }),
      },
    },
  });
  const { handleSubmit, setApolloGraphQLResponseErrors } = form;

  const [commitLoginMutation, { loading }] = useMutation(authSinginMutation, {
    onCompleted: ({ tokenAuth }) => {
      if (tokenAuth?.otpAuthToken) {
        return navigate({
          pathname: generateLocalePath(RoutesConfig.validateOtp),
          search: search || undefined,
        });
      }

      reloadCommonQuery();

      trackEvent('auth', 'log-in');
    },
    onError: (error) => {
      setApolloGraphQLResponseErrors(error.graphQLErrors);
    },
  });

  const handleLogin = handleSubmit(async (data: LoginFormFields) => {
    await commitLoginMutation({
      variables: {
        input: data,
      },
    });
    invalidateApolloStore();
  });

  return { ...form, loading, handleLogin };
};
