import React from 'react';

import { FormattedMessage } from 'react-intl';
import { LoginForm } from '../../../shared/components/auth/loginForm';
import { H1 } from '../../../theme/typography';
import { Container } from './login.styles';

export const Login = () => {
  return (
    <Container>
      <H1>
        <FormattedMessage defaultMessage="Login" description="Auth / login / heading" />
      </H1>
      <LoginForm />
    </Container>
  );
};
