import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LoginForm } from '../../../shared/components/auth/loginForm';
import { H1 } from '../../../theme/typography';
import { ROUTES } from '../../app.constants';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { OAuthProvider } from '../../../modules/auth/auth.types';
import { Button } from '../../../shared/components/button';
import { oAuthLogin } from '../../../modules/auth/auth.actions';
import { Container, Links } from './login.styles';

export const Login = () => {
  const dispatch = useDispatch();
  const resetPasswordUrl = useLocaleUrl(ROUTES.passwordReset.index);
  const signupUrl = useLocaleUrl(ROUTES.signup);
  const handleGoogleLogin = () => dispatch(oAuthLogin(OAuthProvider.Google));
  const handleFacebookLogin = () => dispatch(oAuthLogin(OAuthProvider.Facebook));

  return (
    <Container>
      <H1>
        <FormattedMessage defaultMessage="Login" description="Auth / Login / heading" />
      </H1>
      <LoginForm />

      <Links>
        <Button onClick={handleGoogleLogin}>
          <FormattedMessage defaultMessage="Login with Google" description="Auth / Login / Google login button" />
        </Button>

        <Button onClick={handleFacebookLogin}>
          <FormattedMessage defaultMessage="Login with Facebook" description="Auth / Login / Facebook login button" />
        </Button>

        <Link to={resetPasswordUrl}>
          <FormattedMessage defaultMessage="Reset password" description="Auth / login / reset password link" />
        </Link>

        <Link to={signupUrl}>
          <FormattedMessage defaultMessage="Signup" description="Auth / Login / signup link" />
        </Link>
      </Links>
    </Container>
  );
};
