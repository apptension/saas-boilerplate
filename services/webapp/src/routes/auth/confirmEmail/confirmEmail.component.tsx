import { useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { ROUTES } from '../../../app/config/routes';
import { useAsyncDispatch } from '../../../shared/utils/reduxSagaPromise';
import { confirmEmail } from '../../../modules/auth/auth.actions';
import { useSnackbar } from '../../../shared/components/snackbar';
import { selectIsLoggedIn } from '../../../modules/auth/auth.selectors';
import { selectIsProfileStartupCompleted } from '../../../modules/startup/startup.selectors';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';

export const ConfirmEmail = () => {
  const history = useHistory();
  const dispatch = useAsyncDispatch();
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const params = useParams<{ token: string; user: string }>();
  const [token] = useState(params.token);
  const [user] = useState(params.user);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isProfileStartupComplete = useSelector(selectIsProfileStartupCompleted);
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
    async ({ token, user }: { token: string, user: string }) => {
      try {
        const res = await dispatch(confirmEmail({ token, user }));
        await showMessage(res.isError ? errorMessage : successMessage);
      } catch {
        await showMessage(errorMessage);
      }
    },
    [dispatch, errorMessage, showMessage, successMessage]
  );

  useEffect(() => {
    if (isProfileStartupComplete) {
      const isTokenInUrl = Boolean(params.token && params.user);
      const isTokenSavedFromUrl = Boolean(user && token);

      history.push(generateLocalePath(ROUTES.login));

      if (isTokenInUrl) {
        handleEmailConfirmation(params);
      }

      if (!isTokenSavedFromUrl && !isTokenInUrl) {
        showMessage(errorMessage);
      }
    }
  }, [
    errorMessage,
    handleEmailConfirmation,
    history,
    generateLocalePath,
    params,
    showMessage,
    token,
    user,
    isProfileStartupComplete,
  ]);

  return null;
};
