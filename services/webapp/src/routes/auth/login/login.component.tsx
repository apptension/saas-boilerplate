import React from 'react';

import { FormattedMessage } from 'react-intl';
import { LoginForm } from '../../../shared/components/auth/loginForm';
import { ROUTES } from '../../app.constants';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { SocialLoginButtons } from '../../../shared/components/auth/socialLoginButtons';
import { Link } from '../../../shared/components/link';
import { Container, Header, Links, OrDivider } from './login.styles';

export const Login = () => {
  const resetPasswordUrl = useLocaleUrl(ROUTES.passwordReset.index);
  const signupUrl = useLocaleUrl(ROUTES.signup);

  return (
    <Container>
      <Header>
        <FormattedMessage defaultMessage="Login" description="Auth / Login / heading" />
      </Header>

      <SocialLoginButtons />

      <OrDivider>
        <FormattedMessage defaultMessage="or" description="Auth / Login / or" />
      </OrDivider>

      <LoginForm />

      <Links>
        <Link to={resetPasswordUrl}>
          <FormattedMessage defaultMessage="Forgot password?" description="Auth / login / reset password link" />
        </Link>

        <Link to={signupUrl}>
          <FormattedMessage defaultMessage="Sign up" description="Auth / Login / signup link" />
        </Link>
      </Links>
    </Container>
  );
};
