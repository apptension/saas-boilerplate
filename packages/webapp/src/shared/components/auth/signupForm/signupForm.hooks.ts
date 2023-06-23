import { useMutation } from '@apollo/client';
import { UseApiFormArgs, useApiForm } from '@sb/webapp-api-client/hooks';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import { authSingupMutation } from './signUpForm.graphql';
import { SignupFormFields } from './signupForm.types';

export const useSignupForm = (args?: UseApiFormArgs<SignupFormFields>) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();
  const { reload: reloadCommonQuery } = useCommonQuery();

  const form = useApiForm<SignupFormFields>({
    ...args,
    errorMessages: {
      email: {
        unique: intl.formatMessage({
          defaultMessage: 'The email address is already taken',
          id: 'Auth / Signup / email unique',
        }),
      },
      password: {
        password_too_common: intl.formatMessage({
          defaultMessage: 'The password is too common.',
          id: 'Auth / Signup / password too common',
        }),
        password_entirely_numeric: intl.formatMessage({
          defaultMessage: "The password can't be entirely numeric.",
          id: 'Auth / Signup / password entirely numeric',
        }),
      },
    },
  });

  const { handleSubmit, setApolloGraphQLResponseErrors } = form;
  const [commitSignupMutation, { loading }] = useMutation(authSingupMutation, {
    onCompleted: () => {
      trackEvent('auth', 'sign-up');

      reloadCommonQuery();
      navigate(generateLocalePath(RoutesConfig.home));
    },
    onError: (error) => {
      setApolloGraphQLResponseErrors(error.graphQLErrors);
    },
  });

  const handleSignup = handleSubmit(async (data: SignupFormFields) => {
    await commitSignupMutation({
      variables: {
        input: {
          email: data.email,
          password: data.password,
        },
      },
    });
  });

  return { ...form, loading, handleSignup };
};
