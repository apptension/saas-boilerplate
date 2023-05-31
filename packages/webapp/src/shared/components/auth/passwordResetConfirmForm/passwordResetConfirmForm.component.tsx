import { Button } from '@sb/webapp-core/components/buttons';
import { Input } from '@sb/webapp-core/components/forms';
import { size } from '@sb/webapp-core/theme';
import { FormattedMessage, useIntl } from 'react-intl';

import { usePasswordResetConfirmForm } from './passwordResetConfirmForm.hooks';
import { Container, ErrorMessage } from './passwordResetConfirmForm.styles';

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
    <Container onSubmit={handlePasswordResetConfirm}>
      <size.FormFieldsRow>
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
      </size.FormFieldsRow>
      <size.FormFieldsRow>
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
      </size.FormFieldsRow>

      {hasGenericErrorOnly && <ErrorMessage>{genericError}</ErrorMessage>}

      <Button type="submit" disabled={loading} className="mt-2">
        <FormattedMessage defaultMessage="Confirm the change" id="Auth / Reset password confirm / Submit button" />
      </Button>
    </Container>
  );
};
