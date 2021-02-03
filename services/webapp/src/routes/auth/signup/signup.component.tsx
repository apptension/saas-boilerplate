import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { SignupForm } from '../../../shared/components/auth/signupForm';
import { H1 } from '../../../theme/typography';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { Container } from './signup.styles';

export const Signup = () => {
  const loginUrl = useLocaleUrl(ROUTES.login);

  return (
    <Container>
      <H1>
        <FormattedMessage defaultMessage="Register" description="Auth / register / heading" />
      </H1>
      <SignupForm />

      <Link to={loginUrl}>
        <FormattedMessage defaultMessage="Login" description="Auth / register / login link" />
      </Link>
    </Container>
  );
};
