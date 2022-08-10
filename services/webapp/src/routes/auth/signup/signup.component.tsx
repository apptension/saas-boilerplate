import { FormattedMessage } from 'react-intl';
import { SignupForm } from '../../../shared/components/auth/signupForm';
import { Routes } from '../../../app/config/routes';
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
        <FormattedMessage defaultMessage="Sign up" description="Auth / Signup / heading" />
      </Header>

      <SocialLoginButtons variant={SignupButtonsVariant.SIGNUP} />

      <OrDivider>
        <FormattedMessage defaultMessage="or" description="Auth / Signup / or" />
      </OrDivider>

      <SignupForm />

      <Links>
        <Link to={generateLocalePath(Routes.login)}>
          <FormattedMessage defaultMessage="Log in" description="Auth / Signup / login link" />
        </Link>
      </Links>
    </Container>
  );
};
