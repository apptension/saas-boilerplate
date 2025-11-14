import { Button } from '@sb/webapp-core/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Separator } from '@sb/webapp-core/components/ui/separator';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { RoutesConfig } from '../../../app/config/routes';
import { AuthLogo } from '../../../shared/components/auth/authLogo';
import { FloatingThemeToggle } from '../../../shared/components/auth/floatingThemeToggle';
import { SignupForm } from '../../../shared/components/auth/signupForm';
import { SocialLoginButtons } from '../../../shared/components/auth/socialLoginButtons';
import { SignupButtonsVariant } from '../../../shared/components/auth/socialLoginButtons/socialLoginButtons.component';

export const Signup = () => {
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
              <FormattedMessage defaultMessage="Create your account" id="Auth / Signup / heading" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="Get started with your free account today"
                id="Auth / Signup / description"
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SocialLoginButtons variant={SignupButtonsVariant.SIGNUP} />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  <FormattedMessage defaultMessage="Or continue with email" id="Auth / Signup / or" />
                </span>
              </div>
            </div>

            <SignupForm />

            <div className="text-center text-sm text-muted-foreground">
              <FormattedMessage
                defaultMessage="Already have an account? {loginLink}"
                id="Auth / Signup / login prompt"
                values={{
                  loginLink: (
                    <Button variant="link" className="h-auto p-0 text-sm font-semibold" asChild>
                      <Link to={generateLocalePath(RoutesConfig.login)}>
                        <FormattedMessage defaultMessage="Sign in" id="Auth / Signup / login link" />
                      </Link>
                    </Button>
                  ),
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
