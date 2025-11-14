import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@sb/webapp-core/components/forms';
import { Alert, AlertDescription } from '@sb/webapp-core/components/ui/alert';
import { Button } from '@sb/webapp-core/components/ui/button';
import { Input } from '@sb/webapp-core/components/ui/input';
import { FormattedMessage, useIntl } from 'react-intl';

import { usePasswordResetConfirmForm } from './passwordResetConfirmForm.hooks';

export type PasswordResetConfirmFormProps = {
  user: string;
  token: string;
};

export const PasswordResetConfirmForm = ({ user, token }: PasswordResetConfirmFormProps) => {
  const intl = useIntl();

  const {
    form: { register, getValues },
    form,
    genericError,
    hasGenericErrorOnly,
    loading,
    handlePasswordResetConfirm,
  } = usePasswordResetConfirmForm(user, token);

  return (
    <Form {...form}>
      <form noValidate className="flex w-full flex-col gap-6" onSubmit={handlePasswordResetConfirm}>
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {intl.formatMessage({
                  defaultMessage: 'New password',
                  id: 'Auth / Reset password confirm / Password label',
                })}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  {...register('newPassword', {
                    required: {
                      value: true,
                      message: intl.formatMessage({
                        defaultMessage: 'Please enter a new password',
                        id: 'Auth / Reset password confirm / Old password required',
                      }),
                    },
                    minLength: {
                      value: 8,
                      message: intl.formatMessage({
                        defaultMessage: 'Password must be at least 8 characters long',
                        id: 'Auth / Reset password confirm / Password too short',
                      }),
                    },
                  })}
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder={intl.formatMessage({
                    defaultMessage: 'Enter your new password',
                    id: 'Auth / Reset password confirm / Password placeholder',
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
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {intl.formatMessage({
                  defaultMessage: 'Confirm new password',
                  id: 'Auth / Login / Confirm password label',
                })}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  {...register('confirmPassword', {
                    validate: {
                      required: (value) =>
                        value?.length > 0 ||
                        intl.formatMessage({
                          defaultMessage: 'Please confirm your new password',
                          id: 'Auth / Reset password confirm / Password required',
                        }),
                      mustMatch: (value) =>
                        getValues().newPassword === value ||
                        intl.formatMessage({
                          defaultMessage: 'Passwords do not match',
                          id: 'Auth / Reset password confirm / Password must match',
                        }),
                    },
                  })}
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder={intl.formatMessage({
                    defaultMessage: 'Re-enter your new password',
                    id: 'Auth / Login / Confirm password placeholder',
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
            <FormattedMessage
              defaultMessage="Updating password..."
              id="Auth / Reset password confirm / Submit button loading"
            />
          ) : (
            <FormattedMessage defaultMessage="Update password" id="Auth / Reset password confirm / Submit button" />
          )}
        </Button>
      </form>
    </Form>
  );
};
