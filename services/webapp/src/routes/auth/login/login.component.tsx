import { FormattedMessage } from 'react-intl';
import { LoginForm } from '../../../shared/components/auth/loginForm';
import { Routes } from '../../../app/config/routes';
import { SocialLoginButtons } from '../../../shared/components/auth/socialLoginButtons';
import { Link } from '../../../shared/components/link';
import { SignupButtonsVariant } from '../../../shared/components/auth/socialLoginButtons/socialLoginButtons.component';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { Container, Header, Links, OrDivider } from './login.styles';

export const Login = () => {
  const generateLocalePath = useGenerateLocalePath();

  return (
    <Container>
      <Header>
        <FormattedMessage defaultMessage="Log in" description="Auth / Login / heading" />
      </Header>

      <SocialLoginButtons variant={SignupButtonsVariant.LOGIN} />

      <OrDivider>
        <FormattedMessage defaultMessage="or" description="Auth / Login / or" />
      </OrDivider>

      <LoginForm />

      <Links>
        <Link to={generateLocalePath(Routes.passwordReset.index)}>
          <FormattedMessage defaultMessage="Forgot password?" description="Auth / login / reset password link" />
        </Link>

        <Link to={generateLocalePath(Routes.signup)}>
          <FormattedMessage defaultMessage="Sign up" description="Auth / Login / signup link" />
        </Link>
      </Links>
    </Container>
  );
};
