import React, { HTMLAttributes } from 'react';

import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { oAuthLogin } from '../../../../modules/auth/auth.actions';
import { OAuthProvider } from '../../../../modules/auth/auth.types';
import { Container, FacebookButton, GoogleButton } from './socialLoginButtons.styles';

export const SocialLoginButtons = (props: HTMLAttributes<HTMLDivElement>) => {
  const dispatch = useDispatch();
  const handleGoogleLogin = () => dispatch(oAuthLogin(OAuthProvider.Google));
  const handleFacebookLogin = () => dispatch(oAuthLogin(OAuthProvider.Facebook));

  return (
    <Container {...props}>
      <GoogleButton onClick={handleGoogleLogin}>
        <FormattedMessage defaultMessage="Login with Google" description="Auth / Login / Google login button" />
      </GoogleButton>

      <FacebookButton onClick={handleFacebookLogin}>
        <FormattedMessage defaultMessage="Login with Facebook" description="Auth / Login / Facebook login button" />
      </FacebookButton>
    </Container>
  );
};
