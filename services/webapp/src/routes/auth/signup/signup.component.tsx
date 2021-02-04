import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { SignupForm } from '../../../shared/components/auth/signupForm';
import { H1 } from '../../../theme/typography';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { Button } from '../../../shared/components/button';
import { oAuthLogin } from '../../../modules/auth/auth.actions';
import { OAuthProvider } from '../../../modules/auth/auth.types';
import { Container, Links } from './signup.styles';

export const Signup = () => {
  const dispatch = useDispatch();
  const loginUrl = useLocaleUrl(ROUTES.login);
  const handleGoogleLogin = () => dispatch(oAuthLogin(OAuthProvider.Google));
  const handleFacebookLogin = () => dispatch(oAuthLogin(OAuthProvider.Facebook));

  return (
    <Container>
      <H1>
        <FormattedMessage defaultMessage="Signup" description="Auth / Signup / heading" />
      </H1>
      <SignupForm />

      <Links>
        <Button onClick={handleGoogleLogin}>
          <FormattedMessage defaultMessage="Signup with Google" description="Auth / Signup / Google login button" />
        </Button>

        <Button onClick={handleFacebookLogin}>
          <FormattedMessage defaultMessage="Signup with Facebook" description="Auth / Signup / Facebook login button" />
        </Button>

        <Link to={loginUrl}>
          <FormattedMessage defaultMessage="Login" description="Auth / Signup / login link" />
        </Link>
      </Links>
    </Container>
  );
};
