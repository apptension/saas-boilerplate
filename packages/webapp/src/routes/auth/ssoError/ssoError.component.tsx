import { Button } from '@sb/webapp-core/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { AlertTriangle } from 'lucide-react';
import { FormattedMessage } from 'react-intl';
import { Link, useSearchParams } from 'react-router-dom';

import { RoutesConfig } from '../../../app/config/routes';
import { AuthLogo } from '../../../shared/components/auth/authLogo';
import { FloatingThemeToggle } from '../../../shared/components/auth/floatingThemeToggle';

/**
 * SSO Error Page
 * 
 * Displayed when SSO authentication fails. Shows the error message
 * and provides options to retry or use alternative login methods.
 */
export const SSOError = () => {
  const [searchParams] = useSearchParams();
  const generateLocalePath = useGenerateLocalePath();
  
  const errorMessage = searchParams.get('message') || 'An error occurred during authentication.';

  return (
    <>
      <FloatingThemeToggle />
      <div className="container flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <AuthLogo />
            </div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-destructive">
              <FormattedMessage defaultMessage="Sign in failed" id="SSO / Error / heading" />
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <FormattedMessage
                defaultMessage="If this problem persists, please contact your IT administrator or try an alternative sign in method."
                id="SSO / Error / description"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Button variant="default" asChild className="w-full">
                <Link to={generateLocalePath(RoutesConfig.login)}>
                  <FormattedMessage defaultMessage="Try again" id="SSO / Error / try again button" />
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link to={generateLocalePath(RoutesConfig.login)}>
                  <FormattedMessage defaultMessage="Use another sign in method" id="SSO / Error / alternative login" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

