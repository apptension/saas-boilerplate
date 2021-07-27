import { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { PasswordResetRequestForm } from '../../../../shared/components/auth/passwordResetRequestForm';
import { Link } from '../../../../shared/components/link';
import { ROUTES } from '../../../../app/config/routes';
import { useGenerateLocalePath } from '../../../../shared/hooks/localePaths';
import { Container, Header, Text, Links } from './passwordResetRequest.styles';

export const PasswordResetRequest = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const generateLocalePath = useGenerateLocalePath();

  const handleSubmit = useCallback(() => setIsSubmitted(true), []);

  return (
    <Container>
      <Header>
        {isSubmitted ? (
          <FormattedMessage defaultMessage="Done!" description="Auth / reset password / request sent heading" />
        ) : (
          <FormattedMessage defaultMessage="Forgot password?" description="Auth / reset password / heading" />
        )}
      </Header>
      <Text>
        {isSubmitted ? (
          <FormattedMessage
            defaultMessage="We’ve sent a link to the given email address. You should receive it soon."
            description="Auth / Reset password / request sent description"
          />
        ) : (
          <FormattedMessage
            defaultMessage="Write down your email and we will send you link to reset your password."
            description="Auth / Reset password / description"
          />
        )}
      </Text>

      <PasswordResetRequestForm onSubmitted={handleSubmit} />

      <Links>
        <Link to={generateLocalePath(ROUTES.login)}>
          <FormattedMessage defaultMessage="Go back to log in" description="Auth / Reset password / login link" />
        </Link>
      </Links>
    </Container>
  );
};
