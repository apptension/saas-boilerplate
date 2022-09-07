import { FormattedMessage } from 'react-intl';
import { SignupForm } from '../../../shared/components/auth/signupForm';
import { RoutesConfig } from '../../../app/config/routes';
import { SocialLoginButtons } from '../../../shared/components/auth/socialLoginButtons';
import { Link } from '../../../shared/components/link';
import { SignupButtonsVariant } from '../../../shared/components/auth/socialLoginButtons/socialLoginButtons.component';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { Container, Header, Links, OrDivider } from './signup.styles';

export const Signup = () => {
  const generateLocalePath = useGenerateLocalePath();

  return (
    <Container>
      <Header>
        <FormattedMessage defaultMessage="Sign up" id="Auth / Signup / heading" />
      </Header>

      <SocialLoginButtons variant={SignupButtonsVariant.SIGNUP} />

      <OrDivider>
        <FormattedMessage defaultMessage="or" id="Auth / Signup / or" />
      </OrDivider>

      <SignupForm />

      <Links>
        <Link to={generateLocalePath(RoutesConfig.login)}>
          <FormattedMessage defaultMessage="Log in" id="Auth / Signup / login link" />
        </Link>
      </Links>
    </Container>
  );
};
