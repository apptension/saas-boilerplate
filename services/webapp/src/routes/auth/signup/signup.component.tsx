import React from 'react';

import { FormattedMessage } from 'react-intl';
import { SignupForm } from '../../../shared/components/auth/signupForm';
import { H1 } from '../../../theme/typography';
import { Container } from './signup.styles';

export const Signup = () => {
  return (
    <Container>
      <H1>
        <FormattedMessage defaultMessage="Register" description="Auth / register / heading" />
      </H1>
      <SignupForm />
    </Container>
  );
};
