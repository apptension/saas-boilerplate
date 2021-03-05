import React, { useEffect, useState } from 'react';

import { generatePath, useHistory, useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { PasswordResetConfirmForm } from '../../../../shared/components/auth/passwordResetConfirmForm';
import { useLocaleUrl } from '../../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../../app.constants';
import { Link } from '../../../../shared/components/link';
import { Container, Links, Header, Text } from './passwordResetConfirm.styles';

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
      <Header>
        <FormattedMessage defaultMessage="Change your password" description="Auth / Confirm reset password / heading" />
      </Header>
      <Text>
        <FormattedMessage
          defaultMessage="Set your new password."
          description="Auth / Confirm reset password / description"
        />
      </Text>

      <PasswordResetConfirmForm user={user} token={token} />

      <Links>
        <Link to={loginUrl}>
          <FormattedMessage
            defaultMessage="Go back to log in"
            description="Auth / Confirm reset password / login link"
          />
        </Link>
      </Links>
    </Container>
  );
};
