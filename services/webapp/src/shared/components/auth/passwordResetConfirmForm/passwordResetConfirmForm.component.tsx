import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useAsyncDispatch } from '../../../utils/reduxSagaPromise';
import { useApiForm } from '../../../hooks/useApiForm';
import { confirmPasswordReset } from '../../../../modules/auth/auth.actions';
import { Input } from '../../input';
import { Button } from '../../button';
import { renderWhenTrueOtherwise } from '../../../utils/rendering';
import { Container, ErrorMessage } from './passwordResetConfirmForm.styles';

export interface PasswordResetConfirmFormProps {
  user: string;
  token: string;
}

interface ResetPasswordFormFields {
  newPassword: string;
  confirmPassword: string;
}

export const PasswordResetConfirmForm = ({ user, token }: PasswordResetConfirmFormProps) => {
  const intl = useIntl();
  const dispatch = useAsyncDispatch();
  const {
    register,
    handleSubmit,
    errors,
    genericError,
    setApiResponse,
    formState,
    getValues,
  } = useApiForm<ResetPasswordFormFields>();

  const onResetPassword = async (data: ResetPasswordFormFields) => {
    try {
      const res = await dispatch(
        confirmPasswordReset({
          newPassword: data.newPassword,
          user,
          token,
        })
      );
      setApiResponse(res);
    } catch {}
  };

  const renderForm = () => (
    <Container onSubmit={handleSubmit(onResetPassword)}>
      <Input
        name={'newPassword'}
        type={'password'}
        ref={register({
          required: {
            value: true,
            message: intl.formatMessage({
              defaultMessage: 'Password is required',
              description: 'Auth / Reset password confirm / Old password required',
            }),
          },
        })}
        placeholder={intl.formatMessage({
          defaultMessage: 'New password',
          description: 'Auth / Reset password confirm / Password placeholder',
        })}
        error={errors.newPassword?.message}
      />
      <Input
        ref={register({
          validate: {
            required: (value) =>
              value?.length > 0 ||
              intl.formatMessage({
                defaultMessage: 'Confirm password is required',
                description: 'Auth / Reset password confirm / Password required',
              }),
            mustMatch: (value) =>
              getValues().newPassword === value ||
              intl.formatMessage({
                defaultMessage: 'Passwords must match',
                description: 'Auth / Reset password confirm / Password must match',
              }),
          },
        })}
        name={'confirmPassword'}
        type={'password'}
        placeholder={intl.formatMessage({
          defaultMessage: 'Confirm password',
          description: 'Auth / Login / Confirm password placeholder',
        })}
        error={errors.confirmPassword?.message}
      />
      {genericError && <ErrorMessage>{genericError}</ErrorMessage>}
      <Button type="submit">
        <FormattedMessage
          defaultMessage="Change password"
          description="Auth / Reset password confirm / Submit button"
        />
      </Button>
    </Container>
  );

  const renderSuccessMessage = () => (
    <FormattedMessage
      defaultMessage="Password changed successfully"
      description="Auth / Reset password confirm / Success message"
    />
  );

  return renderWhenTrueOtherwise(renderSuccessMessage, renderForm)(formState.isSubmitSuccessful);
};
