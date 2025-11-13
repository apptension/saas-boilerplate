import { Button } from '@sb/webapp-core/components/ui/button';
import { Input } from '@sb/webapp-core/components/ui/input';
import { Alert, AlertDescription } from '@sb/webapp-core/components/ui/alert';
import { Checkbox, Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@sb/webapp-core/components/forms';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { reportError } from '@sb/webapp-core/utils/reportError';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import { emailPattern } from '../../../constants';
import { useSignupForm } from './signupForm.hooks';

export const SignupForm = () => {
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const {
    form: {
      register,
    },
    form,
    hasGenericErrorOnly,
    genericError,
    loading,
    handleSignup,
  } = useSignupForm({
    defaultValues: {
      acceptTerms: false,
    },
  });

  return (
    <Form {...form}>
      <form
        noValidate
        className="flex w-full flex-col gap-6"
        onSubmit={(e) => {
          handleSignup(e).catch(reportError);
        }}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {intl.formatMessage({
                  defaultMessage: 'Email address',
                  id: 'Auth / Signup / Email label',
                })}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  {...register('email', {
                    required: {
                      value: true,
                      message: intl.formatMessage({
                        defaultMessage: 'Please enter your email address',
                        id: 'Auth / Signup / Email required',
                      }),
                    },
                    pattern: {
                      value: emailPattern,
                      message: intl.formatMessage({
                        defaultMessage: 'Please enter a valid email address',
                        id: 'Auth / Signup / Email format error',
                      }),
                    },
                  })}
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={intl.formatMessage({
                    defaultMessage: 'name@example.com',
                    id: 'Auth / Signup / Email placeholder',
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
                  id: 'Auth / Signup / Password label',
                })}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  {...register('password', {
                    required: {
                      value: true,
                      message: intl.formatMessage({
                        defaultMessage: 'Please enter a password',
                        id: 'Auth / Signup / Password required',
                      }),
                    },
                    minLength: {
                      value: 8,
                      message: intl.formatMessage({
                        defaultMessage: 'Password must be at least 8 characters long',
                        id: 'Auth / Signup / Password too short',
                      }),
                    },
                  })}
                  required
                  type="password"
                  autoComplete="new-password"
                  placeholder={intl.formatMessage({
                    defaultMessage: 'Create a strong password',
                    id: 'Auth / Signup / Password placeholder',
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
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  {...register('acceptTerms', {
                    required: {
                      value: true,
                      message: intl.formatMessage({
                        defaultMessage: 'You must accept the terms and conditions to continue',
                        id: 'Auth / Signup / Terms and conditions required',
                      }),
                    },
                  })}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal cursor-pointer">
                  {intl.formatMessage(
                    {
                      defaultMessage: 'I agree to the {termsLink} and {policyLink}',
                      id: 'Auth / Signup / Accept terms label',
                    },
                    {
                      termsLink: (
                        <Button variant="link" className="h-auto p-0 text-xs underline" asChild>
                          <Link to={generateLocalePath(RoutesConfig.termsAndConditions)}>
                            <FormattedMessage
                              id="Auth / Signup / Accept checkbox / T&C link"
                              defaultMessage="Terms of Use"
                            />
                          </Link>
                        </Button>
                      ),
                      policyLink: (
                        <Button variant="link" className="h-auto p-0 text-xs underline" asChild>
                          <Link to={generateLocalePath(RoutesConfig.privacyPolicy)}>
                            <FormattedMessage
                              id="Auth / Signup / Accept checkbox / Privacy policy link"
                              defaultMessage="Privacy Policy"
                            />
                          </Link>
                        </Button>
                      ),
                    }
                  )}
                </FormLabel>
                <FormMessage />
              </div>
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
            <FormattedMessage defaultMessage="Creating account..." id="Auth / signup button loading" />
          ) : (
            <FormattedMessage defaultMessage="Create account" id="Auth / signup button" />
          )}
        </Button>
      </form>
    </Form>
  );
};
