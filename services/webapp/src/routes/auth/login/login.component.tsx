import { FormattedMessage } from 'react-intl';
import { LoginForm } from '../../../shared/components/auth/loginForm';
import { RoutesConfig } from '../../../app/config/routes';
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
        <FormattedMessage defaultMessage="Log in" id="Auth / Login / heading" />
      </Header>

      <SocialLoginButtons variant={SignupButtonsVariant.LOGIN} />

      <OrDivider>
        <FormattedMessage defaultMessage="or" id="Auth / Login / or" />
      </OrDivider>

      <LoginForm />

      <Links>
        <Link to={generateLocalePath(RoutesConfig.passwordReset.index)}>
          <FormattedMessage defaultMessage="Forgot password?" id="Auth / login / reset password link" />
        </Link>

        <Link to={generateLocalePath(RoutesConfig.signup)}>
          <FormattedMessage defaultMessage="Sign up" id="Auth / Login / signup link" />
        </Link>
      </Links>
    </Container>
  );
};
