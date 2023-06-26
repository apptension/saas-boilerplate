import { Button, Link } from '@sb/webapp-core/components/buttons';
import { Checkbox, Form, FormControl, FormField, FormItem, Input } from '@sb/webapp-core/components/forms';
import { Small } from '@sb/webapp-core/components/typography';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { reportError } from '@sb/webapp-core/utils/reportError';
import { FormattedMessage, useIntl } from 'react-intl';

import { RoutesConfig } from '../../../../app/config/routes';
import { emailPattern } from '../../../constants';
import { useSignupForm } from './signupForm.hooks';

export const SignupForm = () => {
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const {
    form: {
      register,
      formState: { errors },
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
              <FormControl>
                <Input
                  {...field}
                  {...register('email', {
                    required: {
                      value: true,
                      message: intl.formatMessage({
                        defaultMessage: 'Email is required',
                        id: 'Auth / Signup / Email required',
                      }),
                    },
                    pattern: {
                      value: emailPattern,
                      message: intl.formatMessage({
                        defaultMessage: 'Email format is invalid',
                        id: 'Auth / Signup / Email format error',
                      }),
                    },
                  })}
                  type="email"
                  required
                  label={intl.formatMessage({
                    defaultMessage: 'Email',
                    id: 'Auth / Signup / Email label',
                  })}
                  placeholder={intl.formatMessage({
                    defaultMessage: 'Write your email here...',
                    id: 'Auth / Signup / Email placeholder',
                  })}
                  error={errors.email?.message}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  {...register('password', {
                    required: {
                      value: true,
                      message: intl.formatMessage({
                        defaultMessage: 'Password is required',
                        id: 'Auth / Signup / Password required',
                      }),
                    },
                    minLength: {
                      value: 8,
                      message: intl.formatMessage({
                        defaultMessage: 'Password is too short. It must contain at least 8 characters.',
                        id: 'Auth / Signup / Password too short',
                      }),
                    },
                  })}
                  required
                  type="password"
                  label={intl.formatMessage({
                    defaultMessage: 'Password',
                    id: 'Auth / Signup / Password label',
                  })}
                  placeholder={intl.formatMessage({
                    defaultMessage: 'Minimum 8 characters',
                    id: 'Auth / Signup / Password placeholder',
                  })}
                  error={errors.password?.message}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  {...register('acceptTerms', {
                    required: {
                      value: true,
                      message: intl.formatMessage({
                        defaultMessage: 'You need to accept terms and conditions',
                        id: 'Auth / Signup / Terms and conditions required',
                      }),
                    },
                  })}
                  label={intl.formatMessage(
                    {
                      defaultMessage: 'You must accept our {termsLink} and {policyLink}.',
                      id: 'Auth / Signup / Accept terms label',
                    },
                    {
                      termsLink: (
                        <Link className="h-fit p-0 text-xs" to={generateLocalePath(RoutesConfig.termsAndConditions)}>
                          <FormattedMessage
                            id="Auth / Signup / Accept checkbox / T&C link"
                            defaultMessage="Terms of Use"
                          />
                        </Link>
                      ),
                      policyLink: (
                        <Link className="h-fit p-0 text-xs" to={generateLocalePath(RoutesConfig.privacyPolicy)}>
                          <FormattedMessage
                            id="Auth / Signup / Accept checkbox / Privacy policy link"
                            defaultMessage="Privacy Policy"
                          />
                        </Link>
                      ),
                    }
                  )}
                  error={errors.acceptTerms?.message}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {hasGenericErrorOnly ? <Small className="text-red-500">{genericError}</Small> : null}

        <Button type="submit" disabled={loading}>
          <FormattedMessage defaultMessage="Sign up" id="Auth / signup button" />
        </Button>
      </form>
    </Form>
  );
};
