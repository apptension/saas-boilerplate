import { Link } from '@sb/webapp-core/components/buttons';
import { H3, Small } from '@sb/webapp-core/components/typography';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { RoutesConfig } from '../../../../app/config/routes';
import { PasswordResetRequestForm } from '../../../../shared/components/auth/passwordResetRequestForm';

export const PasswordResetRequest = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const generateLocalePath = useGenerateLocalePath();

  const handleSubmit = useCallback(() => setIsSubmitted(true), []);

  return (
    <div className="m-auto flex max-w-xs flex-col items-center justify-center gap-6 2xl:mt-32">
      <H3>
        {isSubmitted ? (
          <FormattedMessage defaultMessage="Done!" id="Auth / reset password / request sent heading" />
        ) : (
          <FormattedMessage defaultMessage="Forgot password?" id="Auth / reset password / heading" />
        )}
      </H3>

      <Small>
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
      </Small>

      <PasswordResetRequestForm onSubmitted={handleSubmit} />

      <div className="flex w-full flex-row justify-center">
        <Link to={generateLocalePath(RoutesConfig.login)}>
          <FormattedMessage defaultMessage="Go back to log in" id="Auth / Reset password / login link" />
        </Link>
      </div>
    </div>
  );
};
