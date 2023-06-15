import { Link } from '@sb/webapp-core/components/buttons';
import { H3, Small } from '@sb/webapp-core/components/typography';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate, useParams } from 'react-router';

import { RoutesConfig } from '../../../../app/config/routes';
import { PasswordResetConfirmForm } from '../../../../shared/components/auth/passwordResetConfirmForm';

export const PasswordResetConfirm = () => {
  type Params = {
    token: string;
    user: string;
  };
  const navigate = useNavigate();
  const params = useParams<keyof Params>() as Params;
  const generateLocalePath = useGenerateLocalePath();

  const isTokenInUrl = params.token && params.user;

  useEffect(() => {
    if (!isTokenInUrl) {
      navigate(generateLocalePath(RoutesConfig.login));
    }
  }, [navigate, isTokenInUrl, generateLocalePath]);

  if (!isTokenInUrl) {
    return null;
  }

  return (
    <div className="m-auto flex max-w-xs flex-col items-center justify-center gap-6 2xl:mt-32">
      <H3>
        <FormattedMessage defaultMessage="Change your password" id="Auth / Confirm reset password / heading" />
      </H3>

      <Small>
        <FormattedMessage defaultMessage="Set your new password." id="Auth / Confirm reset password / description" />
      </Small>

      <PasswordResetConfirmForm user={params.user} token={params.token} />

      <div className="mt-8 flex w-full flex-row justify-between">
        <Link to={generateLocalePath(RoutesConfig.login)}>
          <FormattedMessage defaultMessage="Go back to log in" id="Auth / Confirm reset password / login link" />
        </Link>
      </div>
    </div>
  );
};
