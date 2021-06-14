import React from 'react';

import { FormattedMessage } from 'react-intl';
import { SignupForm } from '../../../shared/components/auth/signupForm';
import { useGenerateLocalePath } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { SocialLoginButtons } from '../../../shared/components/auth/socialLoginButtons';
import { Link } from '../../../shared/components/link';
import { SignupButtonsVariant } from '../../../shared/components/auth/socialLoginButtons/socialLoginButtons.component';
import { Container, Header, Links, OrDivider } from './signup.styles';

export const Signup = () => {
  const generateLocalePath = useGenerateLocalePath();

  return (
    <Container>
      <Header>
        <FormattedMessage defaultMessage="Sign up" description="Auth / Signup / heading" />
      </Header>

      <SocialLoginButtons variant={SignupButtonsVariant.SIGNUP} />

      <OrDivider>
        <FormattedMessage defaultMessage="or" description="Auth / Signup / or" />
      </OrDivider>

      <SignupForm />

      <Links>
        <Link to={generateLocalePath(ROUTES.login)}>
          <FormattedMessage defaultMessage="Log in" description="Auth / Signup / login link" />
        </Link>
      </Links>
    </Container>
  );
};
