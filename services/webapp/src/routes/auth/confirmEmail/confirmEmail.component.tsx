import { useCallback, useEffect, useState } from 'react';

import { useHistory, useParams } from 'react-router';
import { useIntl } from 'react-intl';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { useAsyncDispatch } from '../../../shared/utils/reduxSagaPromise';
import { confirmEmail } from '../../../modules/auth/auth.actions';
import { useSnackbar } from '../../../shared/components/snackbar';

export const ConfirmEmail = () => {
  const history = useHistory();
  const dispatch = useAsyncDispatch();
  const intl = useIntl();
  const loginUrl = useLocaleUrl(ROUTES.login);
  const params = useParams<{ token: string; user: string }>();
  const [token] = useState(params.token);
  const [user] = useState(params.user);
  const { showMessage } = useSnackbar();

  const successMessage = intl.formatMessage({
    description: 'Confirm email / Success message',
    defaultMessage: 'Congratulations! Now you can log in.',
  });

  const errorMessage = intl.formatMessage({
    description: 'Confirm email / Error message',
    defaultMessage: 'Invalid token.',
  });

  const isTokenInUrl = Boolean(params.token && params.user);
  const isTokenSavedFromUrl = Boolean(user && token);

  const handleEmailConfirmation = useCallback(
    async ({ token, user }) => {
      try {
        history.push(loginUrl);
        const res = await dispatch(confirmEmail({ token, user }));
        await showMessage(res.isError ? errorMessage : successMessage);
      } catch {
        await showMessage(errorMessage);
      }
    },
    [dispatch, errorMessage, history, loginUrl, showMessage, successMessage]
  );

  useEffect(() => {
    if (isTokenInUrl) {
      handleEmailConfirmation(params);
    }

    if (!isTokenSavedFromUrl && !isTokenInUrl) {
      history.push(loginUrl);
      showMessage(errorMessage);
    }
  }, [errorMessage, handleEmailConfirmation, isTokenInUrl, isTokenSavedFromUrl, params, showMessage]);

  return null;
};
