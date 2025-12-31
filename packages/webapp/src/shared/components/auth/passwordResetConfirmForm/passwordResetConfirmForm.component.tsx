import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@sb/webapp-core/components/forms';
import {
  PasswordRequirements,
  PasswordStrengthIndicator,
  validatePassword,
} from '@sb/webapp-core/components/passwordStrength';
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
          rules={{
            required: intl.formatMessage({
              defaultMessage: 'Please enter a new password',
              id: 'Auth / Reset password confirm / Old password required',
            }),
            validate: {
              minLength: (value) =>
                value.length >= 8 ||
                intl.formatMessage({
                  defaultMessage: 'Password must be at least 8 characters long',
                  id: 'Auth / Reset password confirm / Password too short',
                }),
              notCommon: (value) => {
                const validation = validatePassword(value);
                return (
                  validation.notCommon ||
                  intl.formatMessage({
                    defaultMessage: 'This password is too common. Please choose a more unique password.',
                    id: 'Auth / Reset password confirm / Password too common',
                  })
                );
              },
              notNumericOnly: (value) => {
                const validation = validatePassword(value);
                return (
                  validation.notNumericOnly ||
                  intl.formatMessage({
                    defaultMessage: "Password can't be entirely numeric.",
                    id: 'Auth / Reset password confirm / Password numeric only',
                  })
                );
              },
            },
          }}
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
              <PasswordStrengthIndicator password={field.value || ''} className="mt-2" />
              <PasswordRequirements password={field.value || ''} className="mt-3" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          rules={{
            required: intl.formatMessage({
              defaultMessage: 'Please confirm your new password',
              id: 'Auth / Reset password confirm / Password required',
            }),
            validate: {
              mustMatch: (value) =>
                form.getValues().newPassword === value ||
                intl.formatMessage({
                  defaultMessage: 'Passwords do not match',
                  id: 'Auth / Reset password confirm / Password must match',
                }),
            },
          }}
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
