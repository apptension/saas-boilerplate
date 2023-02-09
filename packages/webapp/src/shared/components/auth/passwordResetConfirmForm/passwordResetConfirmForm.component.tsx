import { FormattedMessage, useIntl } from 'react-intl';

import { Input } from '../../forms/input';
import { FormFieldsRow } from '../../../../theme/size';

import { Container, ErrorMessage, SubmitButton } from './passwordResetConfirmForm.styles';

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
    <Container onSubmit={handlePasswordResetConfirm}>
      <FormFieldsRow>
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
      </FormFieldsRow>
      <FormFieldsRow>
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
      </FormFieldsRow>

      {hasGenericErrorOnly && <ErrorMessage>{genericError}</ErrorMessage>}

      <SubmitButton disabled={loading}>
        <FormattedMessage defaultMessage="Confirm the change" id="Auth / Reset password confirm / Submit button" />
      </SubmitButton>
    </Container>
  );
};
