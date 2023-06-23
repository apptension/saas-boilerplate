import { Button } from '@sb/webapp-core/components/buttons';
import { Input } from '@sb/webapp-core/components/forms';
import { Small } from '@sb/webapp-core/components/typography';
import { FormattedMessage, useIntl } from 'react-intl';

import { usePasswordResetConfirmForm } from './passwordResetConfirmForm.hooks';

export type PasswordResetConfirmFormProps = {
  user: string;
  token: string;
};

export const PasswordResetConfirmForm = ({ user, token }: PasswordResetConfirmFormProps) => {
  const intl = useIntl();

  const {
    form: {
      formState: { errors },
      register,
      getValues,
    },
    genericError,
    hasGenericErrorOnly,
    loading,
    handlePasswordResetConfirm,
  } = usePasswordResetConfirmForm(user, token);

  return (
    <form noValidate className="flex w-full flex-col gap-6" onSubmit={handlePasswordResetConfirm}>
      <Input
        {...register('newPassword', {
          required: {
            value: true,
            message: intl.formatMessage({
              defaultMessage: 'Password is required',
              id: 'Auth / Reset password confirm / Old password required',
            }),
          },
          minLength: {
            value: 8,
            message: intl.formatMessage({
              defaultMessage: 'Password is too short. It must contain at least 8 characters.',
              id: 'Auth / Reset password confirm / Password too short',
            }),
          },
        })}
        type="password"
        required
        label={intl.formatMessage({
          defaultMessage: 'New password',
          id: 'Auth / Reset password confirm / Password label',
        })}
        placeholder={intl.formatMessage({
          defaultMessage: 'Write new password here...',
          id: 'Auth / Reset password confirm / Password placeholder',
        })}
        error={errors.newPassword?.message}
      />

      <Input
        {...register('confirmPassword', {
          validate: {
            required: (value) =>
              value?.length > 0 ||
              intl.formatMessage({
                defaultMessage: 'Repeat new password is required',
                id: 'Auth / Reset password confirm / Password required',
              }),
            mustMatch: (value) =>
              getValues().newPassword === value ||
              intl.formatMessage({
                defaultMessage: 'Passwords must match',
                id: 'Auth / Reset password confirm / Password must match',
              }),
          },
        })}
        type="password"
        required
        label={intl.formatMessage({
          defaultMessage: 'Repeat new password',
          id: 'Auth / Login / Confirm password label',
        })}
        placeholder={intl.formatMessage({
          defaultMessage: 'Confirm your new password here...',
          id: 'Auth / Login / Confirm password placeholder',
        })}
        error={errors.confirmPassword?.message}
      />

      {hasGenericErrorOnly ? <Small className="text-red-500">{genericError}</Small> : null}

      <Button type="submit" disabled={loading}>
        <FormattedMessage defaultMessage="Confirm the change" id="Auth / Reset password confirm / Submit button" />
      </Button>
    </form>
  );
};
