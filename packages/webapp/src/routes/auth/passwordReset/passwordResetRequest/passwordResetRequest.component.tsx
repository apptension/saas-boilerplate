import { Link } from '@sb/webapp-core/components/buttons';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { RoutesConfig } from '../../../../app/config/routes';
import { PasswordResetRequestForm } from '../../../../shared/components/auth/passwordResetRequestForm';
import { Container, Header, Links, Text } from './passwordResetRequest.styles';

export const PasswordResetRequest = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const generateLocalePath = useGenerateLocalePath();

  const handleSubmit = useCallback(() => setIsSubmitted(true), []);

  return (
    <Container>
      <Header>
        {isSubmitted ? (
          <FormattedMessage defaultMessage="Done!" id="Auth / reset password / request sent heading" />
        ) : (
          <FormattedMessage defaultMessage="Forgot password?" id="Auth / reset password / heading" />
        )}
      </Header>
      <Text>
        {isSubmitted ? (
          <FormattedMessage
            defaultMessage="We’ve sent a link to the given email address. You should receive it soon."
            id="Auth / Reset password / request sent description"
          />
        ) : (
          <FormattedMessage
            defaultMessage="Write down your email and we will send you link to reset your password."
            id="Auth / Reset password / description"
          />
        )}
      </Text>

      <PasswordResetRequestForm onSubmitted={handleSubmit} />

      <Links>
        <Link to={generateLocalePath(RoutesConfig.login)}>
          <FormattedMessage defaultMessage="Go back to log in" id="Auth / Reset password / login link" />
        </Link>
      </Links>
    </Container>
  );
};
