import React from 'react';

import { FormattedMessage } from 'react-intl';
import { PasswordResetRequestForm } from '../../../../shared/components/auth/passwordResetRequestForm';
import { H1 } from '../../../../theme/typography';
import { Container } from './passwordResetRequest.styles';

export const PasswordResetRequest = () => {
  return (
    <Container>
      <H1>
        <FormattedMessage defaultMessage="Reset password" description="Auth / reset password / heading" />
      </H1>
      <PasswordResetRequestForm />
    </Container>
  );
};
