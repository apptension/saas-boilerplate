import { FormattedMessage } from 'react-intl';
import { LoginForm } from '../../../shared/components/auth/loginForm';
import { ROUTES } from '../../app.constants';
import { useGenerateLocalePath } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { SocialLoginButtons } from '../../../shared/components/auth/socialLoginButtons';
import { Link } from '../../../shared/components/link';
import { SignupButtonsVariant } from '../../../shared/components/auth/socialLoginButtons/socialLoginButtons.component';
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
        <Link to={generateLocalePath(ROUTES.passwordReset.index)}>
          <FormattedMessage defaultMessage="Forgot password?" description="Auth / login / reset password link" />
        </Link>

        <Link to={generateLocalePath(ROUTES.signup)}>
          <FormattedMessage defaultMessage="Sign up" description="Auth / Login / signup link" />
        </Link>
      </Links>
    </Container>
  );
};
