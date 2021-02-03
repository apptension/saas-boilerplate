import React, { useCallback, useEffect, useState } from 'react';

import { generatePath, useHistory, useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { renderWhenTrue } from '../../../shared/utils/rendering';
import { useAsyncDispatch } from '../../../shared/utils/reduxSagaPromise';
import { confirmEmail } from '../../../modules/auth/auth.actions';

export const ConfirmEmail = () => {
  const history = useHistory();
  const dispatch = useAsyncDispatch();
  const params = useParams<{ token: string; user: string }>();
  const [token] = useState(params.token);
  const [user] = useState(params.user);
  const confirmRequestedUrl = useLocaleUrl(generatePath(ROUTES.confirmEmail, {}));
  const [validationError, setValidationError] = useState(false);

  const isTokenInUrl = Boolean(params.token && params.user);
  const isTokenSavedFromUrl = Boolean(user && token);

  const handleEmailConfirmation = useCallback(
    async ({ token, user }) => {
      try {
        history.push(confirmRequestedUrl);
        const res = await dispatch(confirmEmail({ token, user }));

        if (res.isError) {
          setValidationError(true);
        }
      } catch (ex) {
        setValidationError(true);
      }
    },
    [confirmRequestedUrl, dispatch, history]
  );

  useEffect(() => {
    if (isTokenInUrl) {
      handleEmailConfirmation(params);
    }

    if (!isTokenSavedFromUrl && !isTokenInUrl) {
      setValidationError(true);
    }
  }, [handleEmailConfirmation, isTokenInUrl, isTokenSavedFromUrl, params]);

  return renderWhenTrue(() => (
    <h1>
      <FormattedMessage description={'Confirm email / Invalid token'} defaultMessage={'Invalid token'} />
    </h1>
  ))(validationError);
};
