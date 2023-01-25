import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';

import { authSingupMutation } from '../../../../modules/auth/auth.mutations';
import { useApiForm } from '../../../hooks/useApiForm';
import { useCommonQuery } from '../../../../app/providers/commonQuery';
import { useGenerateLocalePath } from '../../../hooks/localePaths';
import { RoutesConfig } from '../../../../app/config/routes';

import { SignupFormFields } from './signupForm.types';

export const useSignupForm = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();
  const { reload: reloadCommonQuery } = useCommonQuery();

  const form = useApiForm<SignupFormFields>({
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
  const [commitSignupMutation, { error, loading }] = useMutation(authSingupMutation);

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
      if (error) {
        setApolloGraphQLResponseErrors(error.graphQLErrors);
      } else {
        reloadCommonQuery();
        navigate(generateLocalePath(RoutesConfig.home));
      }
    } catch (error) {
      setApolloGraphQLResponseErrors(error.graphQLErrors);
    }
  });

  return { ...form, loading, handleSignup };
};
