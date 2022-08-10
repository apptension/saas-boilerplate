import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { PasswordResetConfirmForm } from '../../../../shared/components/auth/passwordResetConfirmForm';
import { Routes } from '../../../../app/config/routes';
import { Link } from '../../../../shared/components/link';
import { useGenerateLocalePath } from '../../../../shared/hooks/localePaths';
import { Container, Header, Links, Text } from './passwordResetConfirm.styles';

export const PasswordResetConfirm = () => {
  type Params = {
    token: string;
    user: string;
  }
  const navigate = useNavigate();
  const params = useParams<keyof Params>() as Params;
  const [token] = useState(params.token || '');
  const [user] = useState(params.user || '');
  const generateLocalePath = useGenerateLocalePath();

  const isTokenInUrl = params.token && params.user;
  const isTokenSavedFromUrl = user && token;

  useEffect(() => {
    if (isTokenInUrl) {
      navigate(generateLocalePath(Routes.passwordReset.confirmRoot));
    }

    if (!isTokenInUrl && !isTokenSavedFromUrl) {
      navigate(generateLocalePath(Routes.login));
    }
  }, [navigate, isTokenInUrl, isTokenSavedFromUrl, generateLocalePath]);

  return (
    <Container>
      <Header>
        <FormattedMessage defaultMessage="Change your password" description="Auth / Confirm reset password / heading" />
      </Header>
      <Text>
        <FormattedMessage
          defaultMessage="Set your new password."
          description="Auth / Confirm reset password / description"
        />
      </Text>

      <PasswordResetConfirmForm user={user} token={token} />

      <Links>
        <Link to={generateLocalePath(Routes.login)}>
          <FormattedMessage
            defaultMessage="Go back to log in"
            description="Auth / Confirm reset password / login link"
          />
        </Link>
      </Links>
    </Container>
  );
};
