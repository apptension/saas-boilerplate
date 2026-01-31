import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@sb/webapp-core/components/forms';
import { Alert, AlertDescription } from '@sb/webapp-core/components/ui/alert';
import { Button } from '@sb/webapp-core/components/ui/button';
import { Input } from '@sb/webapp-core/components/ui/input';
import { ENV } from '@sb/webapp-core/config/env';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { emailPattern } from '../../../constants';
import { SSODiscovery } from '../ssoDiscovery';
import { useLoginForm } from './loginForm.hooks';

export const LoginForm = () => {
  const intl = useIntl();
  const [ssoRequired, setSSORequired] = useState(false);

  const { form, genericError, loading, handleLogin } = useLoginForm();

  // Watch email field for SSO discovery
  const email = form.watch('email');

  // Check if password login is enabled
  const showPasswordField = ENV.ENABLE_PASSWORD_LOGIN && !ssoRequired;

  return (
    <Form {...form}>
      <form noValidate className="flex w-full flex-col gap-6" onSubmit={handleLogin}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {intl.formatMessage({
                  defaultMessage: 'Email address',
                  id: 'Auth / Login / Email label',
                })}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  {...form.register('email', {
                    required: {
                      value: true,
                      message: intl.formatMessage({
                        defaultMessage: 'Please enter your email address',
                        id: 'Auth / Login / Email required',
                      }),
                    },
                    pattern: {
                      value: emailPattern,
                      message: intl.formatMessage({
                        defaultMessage: 'Please enter a valid email address',
                        id: 'Auth / Login / Email format error',
                      }),
                    },
                  })}
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={intl.formatMessage({
                    defaultMessage: 'name@example.com',
                    id: 'Auth / Login / Email placeholder',
                  })}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SSO Discovery - shows when email domain has SSO configured */}
        <SSODiscovery email={email} onSSORequired={setSSORequired} />

        {showPasswordField && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {intl.formatMessage({
                    defaultMessage: 'Password',
                    id: 'Auth / Login / Password label',
                  })}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    {...form.register('password', {
                      required: {
                        value: true,
                        message: intl.formatMessage({
                          defaultMessage: 'Please enter your password',
                          id: 'Auth / Login / Password required',
                        }),
                      },
                    })}
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder={intl.formatMessage({
                      defaultMessage: 'Enter your password',
                      id: 'Auth / Login / Password placeholder',
                    })}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {genericError && (
          <Alert variant="destructive">
            <AlertDescription>{genericError}</AlertDescription>
          </Alert>
        )}

        {showPasswordField && (
          <Button disabled={loading} type="submit" className="w-full" size="lg">
            {loading ? (
              <FormattedMessage defaultMessage="Signing in..." id="Auth / login button loading" />
            ) : (
              <FormattedMessage defaultMessage="Sign in" id="Auth / login button" />
            )}
          </Button>
        )}
      </form>
    </Form>
  );
};
