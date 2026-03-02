import {
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@sb/webapp-core/components/forms';
import {
  PasswordRequirements,
  PasswordStrengthIndicator,
  validatePassword,
} from '@sb/webapp-core/components/passwordStrength';
import { Alert, AlertDescription } from '@sb/webapp-core/components/ui/alert';
import { Button } from '@sb/webapp-core/components/ui/button';
import { Input } from '@sb/webapp-core/components/ui/input';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import { emailPattern } from '../../../constants';
import { useSignupForm } from './signupForm.hooks';

export const SignupForm = () => {
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const {
    form,
    genericError,
    loading,
    handleSignup,
  } = useSignupForm({
    defaultValues: {
      acceptTerms: false,
      email: '',
      password: '',
    },
  });

  return (
    <Form {...form}>
      <form
        noValidate
        className="flex w-full flex-col gap-6"
        onSubmit={handleSignup}
      >
        <FormField
          control={form.control}
          name="email"
          rules={{
            required: intl.formatMessage({
              defaultMessage: 'Please enter your email address',
              id: 'Auth / Signup / Email required',
            }),
            pattern: {
              value: emailPattern,
              message: intl.formatMessage({
                defaultMessage: 'Please enter a valid email address',
                id: 'Auth / Signup / Email format error',
              }),
            },
          }}
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
          rules={{
            required: intl.formatMessage({
              defaultMessage: 'Please enter a password',
              id: 'Auth / Signup / Password required',
            }),
            validate: {
              minLength: (value) =>
                value.length >= 8 ||
                intl.formatMessage({
                  defaultMessage: 'Password must be at least 8 characters long',
                  id: 'Auth / Signup / Password too short',
                }),
              notCommon: (value) => {
                const validation = validatePassword(value);
                return (
                  validation.notCommon ||
                  intl.formatMessage({
                    defaultMessage: 'This password is too common. Please choose a more unique password.',
                    id: 'Auth / Signup / Password too common',
                  })
                );
              },
              notNumericOnly: (value) => {
                const validation = validatePassword(value);
                return (
                  validation.notNumericOnly ||
                  intl.formatMessage({
                    defaultMessage: "Password can't be entirely numeric.",
                    id: 'Auth / Signup / Password numeric only',
                  })
                );
              },
            },
          }}
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
              <PasswordStrengthIndicator password={field.value || ''} className="mt-2" />
              <PasswordRequirements password={field.value || ''} className="mt-3" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptTerms"
          rules={{
            required: intl.formatMessage({
              defaultMessage: 'You must accept the terms and conditions to continue',
              id: 'Auth / Signup / Terms and conditions required',
            }),
          }}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1.5 leading-none">
                <FormLabel className="!mt-0 cursor-pointer font-normal">
                  {intl.formatMessage(
                    {
                      defaultMessage: 'I agree to the {termsLink} and {policyLink}',
                      id: 'Auth / Signup / Accept terms label',
                    },
                    {
                      termsLink: (
                        <Button key="terms" variant="link" className="inline h-auto p-0 text-sm underline" asChild>
                          <Link to={generateLocalePath(RoutesConfig.termsAndConditions)}>
                            <FormattedMessage
                              id="Auth / Signup / Accept checkbox / T&C link"
                              defaultMessage="Terms of Use"
                            />
                          </Link>
                        </Button>
                      ),
                      policyLink: (
                        <Button key="policy" variant="link" className="inline h-auto p-0 text-sm underline" asChild>
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

        {genericError && (
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
