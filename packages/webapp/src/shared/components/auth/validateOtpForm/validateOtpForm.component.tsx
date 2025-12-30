import { useMutation } from '@apollo/client/react';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@sb/webapp-core/components/forms';
import { Alert, AlertDescription } from '@sb/webapp-core/components/ui/alert';
import { Button } from '@sb/webapp-core/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Input } from '@sb/webapp-core/components/ui/input';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { FormattedMessage, useIntl } from 'react-intl';

import { AuthLogo } from '../authLogo';
import { FloatingThemeToggle } from '../floatingThemeToggle';
import { validateOtpMutation } from '../twoFactorAuthForm/twoFactorAuthForm.graphql';

export type ValidateOtpFormFields = {
  token: string;
};

export const ValidateOtpForm = () => {
  const intl = useIntl();
  const form = useApiForm<ValidateOtpFormFields>({
    defaultValues: {
      token: '',
    },
  });
  const {
    handleSubmit,
    hasGenericErrorOnly,
    genericError,
    setApolloGraphQLResponseErrors,
    form: { register },
  } = form;
  const { reload: reloadCommonQuery } = useCommonQuery();

  const [commitValidateOtpMutation, { loading }] = useMutation(validateOtpMutation, {
    onError: (error: any) => {
      if (error?.graphQLErrors) {
        setApolloGraphQLResponseErrors(error.graphQLErrors);
      }
    },
    onCompleted: () => {
      trackEvent('auth', 'otp-validate');
    },
  });

  const handleFormSubmit = async (values: { token: string }) => {
    try {
      const { data } = await commitValidateOtpMutation({ variables: { input: { otpToken: values.token } } });
      if (data?.validateOtp?.access) {
        reloadCommonQuery();
      }
    } catch (error) {
      // Error is handled by onError callback
      // This catch prevents unhandled promise rejection
    }
  };

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
              <FormattedMessage defaultMessage="Two-Factor Authentication" id="Auth / Validate OTP / Heading" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="Enter the 6-digit code from your authenticator app to complete sign in."
                id="Auth / Validate OTP / Enter code from app"
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form.form}>
              <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit(handleFormSubmit)}>
                <FormField
                  control={form.form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <FormattedMessage defaultMessage="Authentication Code" id="Auth / Validate OTP / Code label" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          {...register('token', {
                            required: {
                              value: true,
                              message: intl.formatMessage({
                                defaultMessage: 'Please enter the authentication code',
                                id: 'Auth / Validate OTP / Auth code required',
                              }),
                            },
                            minLength: {
                              value: 6,
                              message: intl.formatMessage({
                                defaultMessage: 'The code must be 6 digits',
                                id: 'Auth / Validate OTP / Password too short',
                              }),
                            },
                          })}
                          pattern="[0-9]*"
                          inputMode="numeric"
                          placeholder="000000"
                          maxLength={6}
                          autoFocus
                          autoComplete="one-time-code"
                          disabled={loading}
                          className="text-center text-2xl tracking-widest"
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

                <Button type="submit" disabled={loading} className="w-full" size="lg">
                  {loading ? (
                    <FormattedMessage defaultMessage="Verifying..." id="Auth / Validate OTP / Submit button loading" />
                  ) : (
                    <FormattedMessage defaultMessage="Verify code" id="Auth / Validate OTP / Submit button" />
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
