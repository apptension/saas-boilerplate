import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@sb/webapp-core/components/forms';
import { Alert, AlertDescription } from '@sb/webapp-core/components/ui/alert';
import { Button } from '@sb/webapp-core/components/ui/button';
import { Input } from '@sb/webapp-core/components/ui/input';
import { FormattedMessage, useIntl } from 'react-intl';

import { emailPattern } from '../../../constants';
import { useLoginForm } from './loginForm.hooks';

export const LoginForm = () => {
  const intl = useIntl();

  const { form, hasGenericErrorOnly, genericError, loading, handleLogin } = useLoginForm();

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

        {hasGenericErrorOnly && (
          <Alert variant="destructive">
            <AlertDescription>{genericError}</AlertDescription>
          </Alert>
        )}

        <Button disabled={loading} type="submit" className="w-full" size="lg">
          {loading ? (
            <FormattedMessage defaultMessage="Signing in..." id="Auth / login button loading" />
          ) : (
            <FormattedMessage defaultMessage="Sign in" id="Auth / login button" />
          )}
        </Button>
      </form>
    </Form>
  );
};
