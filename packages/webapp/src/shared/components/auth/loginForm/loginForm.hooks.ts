import { useIntl } from 'react-intl';
import { ApolloError, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

import { useGenerateLocalePath } from '../../../hooks/localePaths';
import { useApiForm } from '../../../hooks/useApiForm';

import { useCommonQuery } from '../../../../app/providers/commonQuery';
import { RoutesConfig } from '../../../../app/config/routes';
import { LoginFormFields } from './loginForm.types';

import { authSinginMutation } from './loginForm.graphql';

export const useLoginForm = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();
  const { reload: reloadCommonQuery } = useCommonQuery();

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
    onCompleted: () => {
      reloadCommonQuery();
      navigate(generateLocalePath(RoutesConfig.home));
    },
    onError: (error) => {
      if (error instanceof ApolloError) setApolloGraphQLResponseErrors(error.graphQLErrors);
    },
  });

  const handleLogin = handleSubmit((data: LoginFormFields) => {
    commitLoginMutation({
      variables: {
        input: data,
      },
    });
  });

  return { ...form, loading, handleLogin };
};
