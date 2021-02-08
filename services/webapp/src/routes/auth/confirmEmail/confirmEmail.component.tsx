import React, { useCallback, useEffect, useState } from 'react';

import { generatePath, useHistory, useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { renderWhenTrue } from '../../../shared/utils/rendering';
import { useAsyncDispatch } from '../../../shared/utils/reduxSagaPromise';
import { confirmEmail } from '../../../modules/auth/auth.actions';
import { H1 } from '../../../theme/typography';

enum VALIDATION_STATUS {
  PENDING,
  VALID,
  INVALID,
}

export const ConfirmEmail = () => {
  const history = useHistory();
  const dispatch = useAsyncDispatch();
  const loginUrl = useLocaleUrl(ROUTES.login);
  const params = useParams<{ token: string; user: string }>();
  const [token] = useState(params.token);
  const [user] = useState(params.user);
  const confirmRequestedUrl = useLocaleUrl(generatePath(ROUTES.confirmEmail, {}));
  const [validationStatus, setValidationStatus] = useState(VALIDATION_STATUS.PENDING);

  const isTokenInUrl = Boolean(params.token && params.user);
  const isTokenSavedFromUrl = Boolean(user && token);

  const handleEmailConfirmation = useCallback(
    async ({ token, user }) => {
      try {
        history.push(confirmRequestedUrl);
        const res = await dispatch(confirmEmail({ token, user }));
        setValidationStatus(res.isError ? VALIDATION_STATUS.INVALID : VALIDATION_STATUS.VALID);
      } catch {
        setValidationStatus(VALIDATION_STATUS.INVALID);
      }
    },
    [confirmRequestedUrl, dispatch, history]
  );

  useEffect(() => {
    if (isTokenInUrl) {
      handleEmailConfirmation(params);
    }

    if (!isTokenSavedFromUrl && !isTokenInUrl) {
      setValidationStatus(VALIDATION_STATUS.INVALID);
    }
  }, [handleEmailConfirmation, isTokenInUrl, isTokenSavedFromUrl, params]);

  const renderSuccess = () => (
    <>
      <H1>
        <FormattedMessage description={'Confirm email / Valid token'} defaultMessage={'Email confirmed successfully'} />
      </H1>
      <Link to={loginUrl}>
        <FormattedMessage description={'Confirm email / Login button'} defaultMessage={'Login'} />
      </Link>
    </>
  );

  const renderError = () => (
    <H1>
      <FormattedMessage description={'Confirm email / Invalid token'} defaultMessage={'Invalid token'} />
    </H1>
  );

  return (
    <>
      {renderWhenTrue(renderError)(validationStatus === VALIDATION_STATUS.INVALID)}
      {renderWhenTrue(renderSuccess)(validationStatus === VALIDATION_STATUS.VALID)}
    </>
  );
};
