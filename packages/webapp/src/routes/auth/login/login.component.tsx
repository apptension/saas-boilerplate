import { Button } from '@sb/webapp-core/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Separator } from '@sb/webapp-core/components/ui/separator';
import { ENV } from '@sb/webapp-core/config/env';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { Building2 } from 'lucide-react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { RoutesConfig } from '../../../app/config/routes';
import { AuthLogo } from '../../../shared/components/auth/authLogo';
import { FloatingThemeToggle } from '../../../shared/components/auth/floatingThemeToggle';
import { LoginForm } from '../../../shared/components/auth/loginForm';
import { PasskeyLoginButton } from '../../../shared/components/auth/passkeyLoginButton';
import { SocialLoginButtons } from '../../../shared/components/auth/socialLoginButtons';
import { SignupButtonsVariant } from '../../../shared/components/auth/socialLoginButtons/socialLoginButtons.component';

export const Login = () => {
  const generateLocalePath = useGenerateLocalePath();

  const showSocialLogin = ENV.ENABLE_SOCIAL_LOGIN;
  const showPasskeyLogin = ENV.ENABLE_PASSKEYS;
  const showPasswordLogin = ENV.ENABLE_PASSWORD_LOGIN;
  const showSSO = ENV.ENABLE_SSO;
  const hasMultipleAuthMethods =
    [showSocialLogin, showPasskeyLogin, showPasswordLogin, showSSO].filter(Boolean).length > 1;

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
            {/* Passkey Login - top priority for enterprise users */}
            {showPasskeyLogin && <PasskeyLoginButton />}

            {/* Social Login Buttons */}
            {showSocialLogin && <SocialLoginButtons variant={SignupButtonsVariant.LOGIN} />}

            {/* SSO Login Button */}
            {showSSO && (
              <Button variant="outline" className="w-full" size="lg" asChild>
                <Link to={generateLocalePath(RoutesConfig.ssoLogin)}>
                  <Building2 className="mr-2 h-4 w-4" />
                  <FormattedMessage defaultMessage="Log in with SSO" id="Auth / Login / SSO button" />
                </Link>
              </Button>
            )}

            {/* Separator - only show if we have multiple auth methods */}
            {hasMultipleAuthMethods && showPasswordLogin && (
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
            )}

            {/* Email/Password Login Form (includes SSO discovery) */}
            {showPasswordLogin && <LoginForm />}

            <div className="flex flex-col gap-2 text-center text-sm">
              {showPasswordLogin && (
                <div className="flex flex-row items-center justify-center gap-4">
                  <Button variant="link" className="h-auto p-0 text-sm" asChild>
                    <Link to={generateLocalePath(RoutesConfig.passwordReset.index)}>
                      <FormattedMessage defaultMessage="Forgot your password?" id="Auth / login / reset password link" />
                    </Link>
                  </Button>
                </div>
              )}
              <div className="text-muted-foreground">
                <FormattedMessage defaultMessage="Don't have an account?" id="Auth / Login / signup prompt" />{' '}
                <Button variant="link" className="h-auto p-0 text-sm font-semibold" asChild>
                  <Link to={generateLocalePath(RoutesConfig.signup)}>
                    <FormattedMessage defaultMessage="Sign up" id="Auth / Login / signup link" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
