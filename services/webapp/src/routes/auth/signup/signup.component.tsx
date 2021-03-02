import React from 'react';

import { FormattedMessage } from 'react-intl';
import { SignupForm } from '../../../shared/components/auth/signupForm';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { SocialLoginButtons } from '../../../shared/components/auth/socialLoginButtons';
import { Link } from '../../../shared/components/link';
import { Container, Links, Header, OrDivider } from './signup.styles';

export const Signup = () => {
  const loginUrl = useLocaleUrl(ROUTES.login);

  return (
    <Container>
      <Header>
        <FormattedMessage defaultMessage="Signup" description="Auth / Signup / heading" />
      </Header>

      <SocialLoginButtons />

      <OrDivider>
        <FormattedMessage defaultMessage="or" description="Auth / Signup / or" />
      </OrDivider>

      <SignupForm />

      <Links>
        <Link to={loginUrl}>
          <FormattedMessage defaultMessage="Login" description="Auth / Signup / login link" />
        </Link>
      </Links>
    </Container>
  );
};
