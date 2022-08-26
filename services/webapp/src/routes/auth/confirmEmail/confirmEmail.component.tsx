import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useIntl } from 'react-intl';
import { RoutesConfig } from '../../../app/config/routes';
import { useAsyncDispatch } from '../../../shared/utils/reduxSagaPromise';
import { confirmEmail } from '../../../modules/auth/auth.actions';
import { useSnackbar } from '../../../shared/components/snackbar';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { reportError } from '../../../shared/utils/reportError';
import { useAuth } from '../../../shared/hooks/useAuth/useAuth';

export const ConfirmEmail = () => {
  const navigate = useNavigate();
  const dispatch = useAsyncDispatch();
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const params = useParams<{ token: string; user: string }>();
  const { isLoggedIn } = useAuth();
  const { showMessage } = useSnackbar();

  const loggedOutSuccessMessage = intl.formatMessage({
    description: 'Confirm email / Logged out success message',
    defaultMessage: 'Congratulations! Now you can log in.',
  });

  const loggedInSuccessMessage = intl.formatMessage({
    description: 'Confirm email / Logged in success message',
    defaultMessage: 'Congratulations! Your email has been confirmed.',
  });

  const successMessage = isLoggedIn ? loggedInSuccessMessage : loggedOutSuccessMessage;

  const errorMessage = intl.formatMessage({
    description: 'Confirm email / Error message',
    defaultMessage: 'Invalid token.',
  });

  const handleEmailConfirmation = useCallback(
    async ({ token, user }: { token: string; user: string }) => {
      try {
        const res = await dispatch(confirmEmail({ token, user }));
        await showMessage(res.isError ? errorMessage : successMessage);
      } catch {
        await showMessage(errorMessage);
      }

      navigate(generateLocalePath(RoutesConfig.login));
    },
    [dispatch, errorMessage, showMessage, successMessage, generateLocalePath, navigate]
  );

  useEffect(() => {
    if (params?.token && params?.user) {
      handleEmailConfirmation({ token: params.token, user: params.user }).catch(reportError);
    }
  }, [handleEmailConfirmation, params]);

  return null;
};
