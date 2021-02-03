import React, { useEffect, useState } from 'react';

import { generatePath, useHistory, useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { PasswordResetConfirmForm } from '../../../../shared/components/auth/passwordResetConfirmForm';
import { useLocaleUrl } from '../../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../../app.constants';
import { H1 } from '../../../../theme/typography';
import { Container } from './passwordResetConfirm.styles';

export const PasswordResetConfirm = () => {
  const history = useHistory();
  const params = useParams<{ token: string; user: string }>();
  const [token] = useState(params.token);
  const [user] = useState(params.user);
  const resetConfirmUrl = useLocaleUrl(generatePath(ROUTES.passwordReset.confirm, {}));
  const loginUrl = useLocaleUrl(ROUTES.login);

  const isTokenInUrl = params.token && params.user;
  const isTokenSavedFromUrl = user && token;

  useEffect(() => {
    if (isTokenInUrl) {
      history.push(resetConfirmUrl);
    }

    if (!isTokenInUrl && !isTokenSavedFromUrl) {
      history.push(loginUrl);
    }
  }, [history, isTokenInUrl, isTokenSavedFromUrl, loginUrl, resetConfirmUrl]);

  return (
    <Container>
      <H1>
        <FormattedMessage
          defaultMessage="Confirm reset password"
          description="Auth / confirm reset password / heading"
        />
      </H1>
      <PasswordResetConfirmForm user={user} token={token} />
    </Container>
  );
};
