import { useMutation } from '@apollo/client/react';
import { extractGraphQLErrors } from '@sb/webapp-api-client/api';
import { UseApiFormArgs, useApiForm } from '@sb/webapp-api-client/hooks';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import { triggerWelcomeModal } from '../../welcomeModal';
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
          defaultMessage: 'This password is too common. Please choose a more unique password.',
          id: 'Auth / Signup / password too common',
        }),
        password_entirely_numeric: intl.formatMessage({
          defaultMessage: "The password can't be entirely numeric.",
          id: 'Auth / Signup / password entirely numeric',
        }),
        password_too_short: intl.formatMessage({
          defaultMessage: 'Password must be at least 8 characters long.',
          id: 'Auth / Signup / password too short backend',
        }),
        password_too_similar: intl.formatMessage({
          defaultMessage: 'The password is too similar to your personal information.',
          id: 'Auth / Signup / password too similar',
        }),
      },
    },
  });

  const { handleSubmit, setApolloGraphQLResponseErrors } = form;
  const [commitSignupMutation, { loading }] = useMutation(authSingupMutation, {
    onCompleted: () => {
      trackEvent('auth', 'sign-up');

      // Trigger the welcome modal to show on dashboard
      triggerWelcomeModal();

      reloadCommonQuery();
      navigate(generateLocalePath(RoutesConfig.home));
    },
    onError: (error) => {
      const graphQLErrors = extractGraphQLErrors(error);
      if (graphQLErrors) {
        setApolloGraphQLResponseErrors(graphQLErrors);
      }
    },
  });

  const handleSignup = handleSubmit(async (data: SignupFormFields) => {
    try {
      await commitSignupMutation({
        variables: {
          input: {
            email: data.email,
            password: data.password,
          },
        },
      });
    } catch {
      // Error is handled by onError callback
      // This catch prevents unhandled promise rejection
    }
  });

  return { ...form, loading, handleSignup };
};
