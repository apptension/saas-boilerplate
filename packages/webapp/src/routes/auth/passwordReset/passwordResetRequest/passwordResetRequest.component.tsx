import { Button } from '@sb/webapp-core/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import { AuthLogo } from '../../../../shared/components/auth/authLogo';
import { FloatingThemeToggle } from '../../../../shared/components/auth/floatingThemeToggle';
import { PasswordResetRequestForm } from '../../../../shared/components/auth/passwordResetRequestForm';

export const PasswordResetRequest = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const generateLocalePath = useGenerateLocalePath();

  const handleSubmit = useCallback(() => setIsSubmitted(true), []);

  return (
    <>
      <FloatingThemeToggle />
      <div className="container flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <AuthLogo />
            </div>
            <CardTitle className="text-3xl font-semibold tracking-tight">
              {isSubmitted ? (
                <FormattedMessage defaultMessage="Check your email" id="Auth / reset password / request sent heading" />
              ) : (
                <FormattedMessage defaultMessage="Reset your password" id="Auth / reset password / heading" />
              )}
            </CardTitle>
            <CardDescription>
              {isSubmitted ? (
                <FormattedMessage
                  defaultMessage="We've sent a password reset link to your email address. Please check your inbox and follow the instructions."
                  id="Auth / Reset password / request sent description"
                />
              ) : (
                <FormattedMessage
                  defaultMessage="Enter your email address and we'll send you a link to reset your password."
                  id="Auth / Reset password / description"
                />
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isSubmitted && <PasswordResetRequestForm onSubmitted={handleSubmit} />}

            <div className="flex w-full flex-row justify-center text-sm">
              <Button variant="link" className="h-auto p-0 text-sm" asChild>
                <Link to={generateLocalePath(RoutesConfig.login)}>
                  <FormattedMessage defaultMessage="Back to sign in" id="Auth / Reset password / login link" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
