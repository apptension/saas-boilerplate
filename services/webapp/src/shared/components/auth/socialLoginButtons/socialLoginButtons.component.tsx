import React, { HTMLAttributes } from 'react';

import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { oAuthLogin } from '../../../../modules/auth/auth.actions';
import { OAuthProvider } from '../../../../modules/auth/auth.types';
import { Container, FacebookButton, GoogleButton } from './socialLoginButtons.styles';

export enum SignupButtonsVariant {
  LOGIN,
  SIGNUP,
}

export interface SocialLoginButtonsProps extends HTMLAttributes<HTMLDivElement> {
  variant: SignupButtonsVariant;
}

export const SocialLoginButtons = ({ variant, ...props }: SocialLoginButtonsProps) => {
  const dispatch = useDispatch();
  const handleGoogleLogin = () => dispatch(oAuthLogin(OAuthProvider.Google));
  const handleFacebookLogin = () => dispatch(oAuthLogin(OAuthProvider.Facebook));

  return (
    <Container {...props}>
      <FacebookButton onClick={handleFacebookLogin}>
        {variant === SignupButtonsVariant.LOGIN ? (
          <FormattedMessage defaultMessage="Log in with Facebook" description="Auth / Login / Facebook login button" />
        ) : (
          <FormattedMessage
            defaultMessage="Sign up with Facebook"
            description="Auth / Signup / Facebook signup button"
          />
        )}
      </FacebookButton>

      <GoogleButton onClick={handleGoogleLogin}>
        {variant === SignupButtonsVariant.LOGIN ? (
          <FormattedMessage defaultMessage="Log in with Google" description="Auth / Login / Google login button" />
        ) : (
          <FormattedMessage defaultMessage="Sign up with Google" description="Auth / Signup / Google signup button" />
        )}
      </GoogleButton>
    </Container>
  );
};
