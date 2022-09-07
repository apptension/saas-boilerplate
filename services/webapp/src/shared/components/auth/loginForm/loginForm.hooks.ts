import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import graphql from 'babel-plugin-relay/macro';
import { useGenerateLocalePath } from '../../../hooks/localePaths';
import { useApiForm } from '../../../hooks/useApiForm';
import { usePromiseMutation } from '../../../services/graphqlApi/usePromiseMutation';
import { useCommonQuery } from '../../../../app/providers/commonQuery';
import { RoutesConfig } from '../../../../app/config/routes';
import { LoginFormFields } from './loginForm.types';
import { loginFormMutation } from './__generated__/loginFormMutation.graphql';

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
  const { handleSubmit, setGraphQLResponseErrors } = form;

  const [commitLoginMutation] = usePromiseMutation<loginFormMutation>(
    graphql`
      mutation loginFormMutation($input: ObtainTokenMutationInput!) {
        tokenAuth(input: $input) {
          access
          refresh
        }
      }
    `
  );

  const handleLogin = handleSubmit(async (data: LoginFormFields) => {
    try {
      const { errors } = await commitLoginMutation({
        variables: {
          input: data,
        },
      });

      if (errors) {
        setGraphQLResponseErrors(errors);
      } else {
        reloadCommonQuery();
        navigate(generateLocalePath(RoutesConfig.home));
      }
    } catch {}
  });

  return { ...form, handleLogin };
};
