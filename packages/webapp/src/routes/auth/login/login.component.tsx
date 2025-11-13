import { Button } from '@sb/webapp-core/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Separator } from '@sb/webapp-core/components/ui/separator';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { RoutesConfig } from '../../../app/config/routes';
import { AuthLogo } from '../../../shared/components/auth/authLogo';
import { FloatingThemeToggle } from '../../../shared/components/auth/floatingThemeToggle';
import { LoginForm } from '../../../shared/components/auth/loginForm';
import { SocialLoginButtons } from '../../../shared/components/auth/socialLoginButtons';
import { SignupButtonsVariant } from '../../../shared/components/auth/socialLoginButtons/socialLoginButtons.component';

export const Login = () => {
  const generateLocalePath = useGenerateLocalePath();

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
              <FormattedMessage defaultMessage="Welcome back" id="Auth / Login / heading" />
            </CardTitle>
          <CardDescription>
            <FormattedMessage defaultMessage="Sign in to your account to continue" id="Auth / Login / description" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SocialLoginButtons variant={SignupButtonsVariant.LOGIN} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                <FormattedMessage defaultMessage="Or continue with email" id="Auth / Login / or" />
              </span>
            </div>
          </div>

          <LoginForm />

          <div className="flex flex-col gap-2 text-center text-sm">
            <div className="flex flex-row items-center justify-center gap-4">
              <Button variant="link" className="h-auto p-0 text-sm" asChild>
                <Link to={generateLocalePath(RoutesConfig.passwordReset.index)}>
                  <FormattedMessage defaultMessage="Forgot your password?" id="Auth / login / reset password link" />
                </Link>
              </Button>
            </div>
            <div className="text-muted-foreground">
              <FormattedMessage
                defaultMessage="Don't have an account? {signupLink}"
                id="Auth / Login / signup prompt"
                values={{
                  signupLink: (
                    <Button variant="link" className="h-auto p-0 text-sm font-semibold" asChild>
                      <Link to={generateLocalePath(RoutesConfig.signup)}>
                        <FormattedMessage defaultMessage="Sign up" id="Auth / Login / signup link" />
                      </Link>
                    </Button>
                  ),
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};
