import { useMutation } from '@apollo/client/react';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useIntl } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import { emailPattern } from '../../../constants';
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
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const { handleSubmit, setApolloGraphQLResponseErrors } = form;

  const [commitLoginMutation, { loading }] = useMutation(authSinginMutation, {
    onCompleted: async ({ tokenAuth }) => {
      if (tokenAuth?.otpAuthToken) {
        return navigate({
          pathname: generateLocalePath(RoutesConfig.validateOtp),
          search: search || undefined,
        });
      }

      trackEvent('auth', 'log-in');

      // Reload the common query to get fresh user data
      await reloadCommonQuery();

      // Get redirect URL from search params, or default to home
      const searchParams = new URLSearchParams(search);
      const redirect = searchParams.get('redirect');

      // Navigate to the redirect URL or home page
      navigate(redirect ?? generateLocalePath(RoutesConfig.home));
    },
    onError: (error: any) => {
      if (error?.graphQLErrors) {
        setApolloGraphQLResponseErrors(error.graphQLErrors);
      }
    },
  });

  const handleLogin = handleSubmit(async (data: LoginFormFields) => {
    try {
      await commitLoginMutation({
        variables: {
          input: data,
        },
      });
    } catch (error) {
      // Error is handled by onError callback
      // This catch prevents unhandled promise rejection
    }
  });

  return { ...form, loading, handleLogin };
};
