import { Link } from '@sb/webapp-core/components/buttons';
import { H3, Small } from '@sb/webapp-core/components/typography';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { FormattedMessage } from 'react-intl';

import { RoutesConfig } from '../../../app/config/routes';
import { SignupForm } from '../../../shared/components/auth/signupForm';
import { SocialLoginButtons } from '../../../shared/components/auth/socialLoginButtons';
import { SignupButtonsVariant } from '../../../shared/components/auth/socialLoginButtons/socialLoginButtons.component';

export const Signup = () => {
  const generateLocalePath = useGenerateLocalePath();

  return (
    <div className="m-auto flex max-w-xs flex-col items-center justify-center 2xl:mt-32">
      <H3 className="mb-8">
        <FormattedMessage defaultMessage="Sign up" id="Auth / Signup / heading" />
      </H3>

      <SocialLoginButtons variant={SignupButtonsVariant.SIGNUP} />

      <Small className="my-4">
        <FormattedMessage defaultMessage="or" id="Auth / Signup / or" />
      </Small>

      <SignupForm />

      <div className="mt-8 flex w-full flex-row justify-center">
        <Link to={generateLocalePath(RoutesConfig.login)}>
          <FormattedMessage defaultMessage="Log in" id="Auth / Signup / login link" />
        </Link>
      </div>
    </div>
  );
};
