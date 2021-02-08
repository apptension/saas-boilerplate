import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { Input } from '../../input';
import { Button } from '../../button';
import { useAsyncDispatch } from '../../../utils/reduxSagaPromise';
import { useApiForm } from '../../../hooks/useApiForm';
import { changePassword } from '../../../../modules/auth/auth.actions';
import { Container, ErrorMessage } from './changePasswordForm.styles';

interface ChangePasswordFormFields {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const ChangePasswordForm = () => {
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
  } = useApiForm<ChangePasswordFormFields>();

  const onChangePassword = async ({ oldPassword, newPassword }: ChangePasswordFormFields) => {
    try {
      const res = await dispatch(changePassword({ oldPassword, newPassword }));
      setApiResponse(res);
    } catch {}
  };

  return (
    <Container onSubmit={handleSubmit(onChangePassword)}>
      <Input
        name={'oldPassword'}
        type={'password'}
        ref={register({
          required: {
            value: true,
            message: intl.formatMessage({
              defaultMessage: 'Old password is required',
              description: 'Auth / Change password / Old password required',
            }),
          },
        })}
        placeholder={intl.formatMessage({
          defaultMessage: 'Old password',
          description: 'Auth / Change password / Old password placeholder',
        })}
        error={errors.oldPassword?.message}
      />
      <Input
        ref={register({
          required: {
            value: true,
            message: intl.formatMessage({
              defaultMessage: 'New password is required',
              description: 'Auth / Change password / Password required',
            }),
          },
        })}
        name={'newPassword'}
        type={'password'}
        placeholder={intl.formatMessage({
          defaultMessage: 'New password',
          description: 'Auth / Change password / New password placeholder',
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
                description: 'Auth / Change password / Confirm password required',
              }),
            mustMatch: (value) =>
              getValues().newPassword === value ||
              intl.formatMessage({
                defaultMessage: 'Passwords must match',
                description: 'Auth / Change password / Password must match',
              }),
          },
        })}
        name={'confirmNewPassword'}
        type={'password'}
        placeholder={intl.formatMessage({
          defaultMessage: 'Confirm new password',
          description: 'Auth / Change password / Confirm new password placeholder',
        })}
        error={errors.confirmNewPassword?.message}
      />
      {genericError && <ErrorMessage>{genericError}</ErrorMessage>}
      <Button type="submit">
        <FormattedMessage defaultMessage="Change password" description="Auth / Change password / Submit button" />
      </Button>

      {formState.isSubmitSuccessful && (
        <FormattedMessage
          defaultMessage="Password changed successfully"
          description="Auth / Change password / Success message"
        />
      )}
    </Container>
  );
};
