import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useIntl } from 'react-intl';
import { RoutesConfig } from '../../../app/config/routes';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { reportError } from '../../../shared/utils/reportError';
import { useAuth } from '../../../shared/hooks/useAuth/useAuth';
import { usePromiseMutation } from '../../../shared/services/graphqlApi/usePromiseMutation';
import authConfirmUserEmailMutationGraphql, {
  authConfirmUserEmailMutation,
} from '../../../modules/auth/__generated__/authConfirmUserEmailMutation.graphql';
import { useSnackbar } from '../../../modules/snackbar';

export const ConfirmEmail = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const params = useParams<{ token: string; user: string }>();
  const { isLoggedIn } = useAuth();
  const { showMessage } = useSnackbar();
  const [commitConfirmUserEmailMutation] = usePromiseMutation<authConfirmUserEmailMutation>(
    authConfirmUserEmailMutationGraphql
  );

  const loggedOutSuccessMessage = intl.formatMessage({
    id: 'ConfirmEmail.LoggedOutSuccessMessage',
    defaultMessage: 'Congratulations! Now you can log in.',
  });

  const loggedInSuccessMessage = intl.formatMessage({
    id: 'ConfirmEmail.LoggedInSuccessMessage',
    defaultMessage: 'Congratulations! Your email has been confirmed.',
  });

  const successMessage = isLoggedIn ? loggedInSuccessMessage : loggedOutSuccessMessage;

  const errorMessage = intl.formatMessage({
    id: 'ConfirmEmail.ErrorMessage',
    defaultMessage: 'Invalid token.',
  });

  const handleEmailConfirmation = useCallback(
    async ({ token, user }: { token: string; user: string }) => {
      try {
        const { errors } = await commitConfirmUserEmailMutation({
          variables: {
            input: {
              user,
              token,
            },
          },
        });
        await showMessage(errors ? errorMessage : successMessage);
      } catch {
        await showMessage(errorMessage);
      }

      navigate(generateLocalePath(RoutesConfig.login));
    },
    [commitConfirmUserEmailMutation, errorMessage, showMessage, successMessage, generateLocalePath, navigate]
  );

  useEffect(() => {
    if (params?.token && params?.user) {
      handleEmailConfirmation({ token: params.token, user: params.user }).catch(reportError);
    }
  }, [handleEmailConfirmation, params]);

  return null;
};
