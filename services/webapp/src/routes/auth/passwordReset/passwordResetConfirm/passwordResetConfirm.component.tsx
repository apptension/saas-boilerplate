import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';

import { PasswordResetConfirmForm } from '../../../../shared/components/auth/passwordResetConfirmForm';
import { useGenerateLocalePath } from '../../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../../app.constants';
import { Link } from '../../../../shared/components/link';
import { Container, Header, Links, Text } from './passwordResetConfirm.styles';

export const PasswordResetConfirm = () => {
  const history = useHistory();
  const params = useParams<{ token: string; user: string }>();
  const [token] = useState(params.token);
  const [user] = useState(params.user);
  const generateLocalePath = useGenerateLocalePath();

  const isTokenInUrl = params.token && params.user;
  const isTokenSavedFromUrl = user && token;

  useEffect(() => {
    if (isTokenInUrl) {
      history.push(generateLocalePath(ROUTES.passwordReset.confirm));
    }

    if (!isTokenInUrl && !isTokenSavedFromUrl) {
      history.push(generateLocalePath(ROUTES.login));
    }
  }, [history, isTokenInUrl, isTokenSavedFromUrl, generateLocalePath]);

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
        <Link to={generateLocalePath(ROUTES.login)}>
          <FormattedMessage
            defaultMessage="Go back to log in"
            description="Auth / Confirm reset password / login link"
          />
        </Link>
      </Links>
    </Container>
  );
};
