import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { LoginForm } from '../../../shared/components/auth/loginForm';
import { H1 } from '../../../theme/typography';
import { ROUTES } from '../../app.constants';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { Container } from './login.styles';

export const Login = () => {
  const resetPasswordUrl = useLocaleUrl(ROUTES.passwordReset.index);
  const signupUrl = useLocaleUrl(ROUTES.signup);

  return (
    <Container>
      <H1>
        <FormattedMessage defaultMessage="Login" description="Auth / login / heading" />
      </H1>
      <LoginForm />

      <Link to={resetPasswordUrl}>
        <FormattedMessage defaultMessage="Reset password" description="Auth / login / reset password link" />
      </Link>

      <Link to={signupUrl}>
        <FormattedMessage defaultMessage="Signup" description="Auth / login / signup link" />
      </Link>
    </Container>
  );
};
