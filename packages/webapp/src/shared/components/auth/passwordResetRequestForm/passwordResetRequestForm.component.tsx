import { Button } from '@sb/webapp-core/components/ui/button';
import { Input } from '@sb/webapp-core/components/ui/input';
import { Alert, AlertDescription } from '@sb/webapp-core/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@sb/webapp-core/components/forms';
import { FormattedMessage, useIntl } from 'react-intl';

import { emailPattern } from '../../../constants';
import { usePasswordResetRequestForm } from './passwordResetRequestForm.hooks';

type PasswordResetRequestFormProps = {
  onSubmitted?: () => void;
};

export const PasswordResetRequestForm = ({ onSubmitted }: PasswordResetRequestFormProps) => {
  const intl = useIntl();

  const {
    form: {
      register,
    },
    form,
    genericError,
    hasGenericErrorOnly,
    loading,
    isSubmitted,
    handleResetRequestPassword,
  } = usePasswordResetRequestForm(onSubmitted);

  return (
    <Form {...form}>
      <form noValidate className="flex w-full flex-col gap-6" onSubmit={handleResetRequestPassword}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {intl.formatMessage({
                  defaultMessage: 'Email address',
                  id: 'Auth / Request password reset / Email label',
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
                        id: 'Auth / Request password reset  / Email required',
                      }),
                    },
                    pattern: {
                      value: emailPattern,
                      message: intl.formatMessage({
                        defaultMessage: 'Please enter a valid email address',
                        id: 'Auth / Request password reset / Email format error',
                      }),
                    },
                  })}
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={intl.formatMessage({
                    defaultMessage: 'name@example.com',
                    id: 'Auth / Request password reset / Email placeholder',
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

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? (
            <FormattedMessage defaultMessage="Sending..." id="Auth / Request password reset / Submit button loading" />
          ) : isSubmitted ? (
            <FormattedMessage defaultMessage="Resend reset link" id="Auth / Request password reset / Resend button" />
          ) : (
            <FormattedMessage defaultMessage="Send reset link" id="Auth / Request password reset / Submit button" />
          )}
        </Button>
      </form>
    </Form>
  );
};
