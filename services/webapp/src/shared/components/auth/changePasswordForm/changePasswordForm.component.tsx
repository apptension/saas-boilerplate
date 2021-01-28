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
}

export const ChangePasswordForm = () => {
  const intl = useIntl();
  const dispatch = useAsyncDispatch();
  const { register, handleSubmit, errors, genericError, setApiResponse } = useApiForm<ChangePasswordFormFields>();

  const onChangePassword = async (data: ChangePasswordFormFields) => {
    const res = await dispatch(changePassword(data));
    setApiResponse(res);
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
          description: 'Auth / Login / New password placeholder',
        })}
        error={errors.newPassword?.message}
      />
      {genericError && <ErrorMessage>{genericError}</ErrorMessage>}
      <Button type="submit">
        <FormattedMessage defaultMessage="Change password" description="Auth / Change password / Submit button" />
      </Button>
    </Container>
  );
};
