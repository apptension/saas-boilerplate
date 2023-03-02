import { useMutation } from '@apollo/client';
import { useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router';

import { RoutesConfig } from '../../../app/config/routes';
import { useAuth, useGenerateLocalePath, useSnackbar } from '../../../shared/hooks';
import { reportError } from '../../../shared/utils/reportError';
import { authConfirmUserEmailMutation } from './confirmEmail.graphql';

export const ConfirmEmail = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const params = useParams<{ token: string; user: string }>();
  const { isLoggedIn } = useAuth();
  const { showMessage } = useSnackbar();
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

  const [commitConfirmUserEmailMutation] = useMutation(authConfirmUserEmailMutation, {
    onCompleted: () => {
      showMessage(successMessage);
      navigate(generateLocalePath(RoutesConfig.login));
    },
    onError: () => {
      showMessage(errorMessage);
      navigate(generateLocalePath(RoutesConfig.login));
    },
  });

  const handleEmailConfirmation = useCallback(
    async ({ token, user }: { token: string; user: string }) => {
      await commitConfirmUserEmailMutation({
        variables: {
          input: {
            user,
            token,
          },
        },
      });
    },
    [commitConfirmUserEmailMutation]
  );

  useEffect(() => {
    if (params?.token && params?.user) {
      handleEmailConfirmation({ token: params.token, user: params.user }).catch(reportError);
    }
  }, [handleEmailConfirmation, params]);

  return null;
};
