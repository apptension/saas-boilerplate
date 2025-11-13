import { Button } from '@sb/webapp-core/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';

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
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-semibold tracking-tight">
            <FormattedMessage defaultMessage="Create new password" id="Auth / Confirm reset password / heading" />
          </CardTitle>
          <CardDescription>
            <FormattedMessage
              defaultMessage="Please enter your new password below. Make sure it's strong and secure."
              id="Auth / Confirm reset password / description"
            />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <PasswordResetConfirmForm user={params.user} token={params.token} />

          <div className="flex w-full flex-row justify-center text-sm">
            <Button variant="link" className="h-auto p-0 text-sm" asChild>
              <Link to={generateLocalePath(RoutesConfig.login)}>
                <FormattedMessage defaultMessage="Back to sign in" id="Auth / Confirm reset password / login link" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
