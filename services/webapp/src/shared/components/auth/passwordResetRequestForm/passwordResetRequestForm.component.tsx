import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useAsyncDispatch } from '../../../utils/reduxSagaPromise';
import { useApiForm } from '../../../hooks/useApiForm';
import { requestPasswordReset } from '../../../../modules/auth/auth.actions';
import { Input } from '../../input';
import { Button } from '../../button';
import { Container, ErrorMessage } from './passwordResetRequestForm.styles';

interface ResetPasswordFormFields {
  email: string;
}

export const PasswordResetRequestForm = () => {
  const intl = useIntl();
  const dispatch = useAsyncDispatch();
  const {
    register,
    handleSubmit,
    errors,
    setApiResponse,
    genericError,
    formState,
  } = useApiForm<ResetPasswordFormFields>();

  const onSubmit = async (data: ResetPasswordFormFields) => {
    const res = await dispatch(requestPasswordReset(data));
    setApiResponse(res);
  };

  const renderForm = () => (
    <Container onSubmit={handleSubmit(onSubmit)}>
      <Input
        name={'email'}
        type={'email'}
        ref={register({
          required: {
            value: true,
            message: intl.formatMessage({
              defaultMessage: 'Email is required',
              description: 'Auth / Request password reset  / Email required',
            }),
          },
        })}
        placeholder={intl.formatMessage({
          defaultMessage: 'Email',
          description: 'Auth / Request password reset / Email placeholder',
        })}
        error={errors.email?.message}
      />
      {genericError && <ErrorMessage>{genericError}</ErrorMessage>}
      <Button type="submit">
        <FormattedMessage defaultMessage="Reset" description="Auth / Request password reset / Submit button" />
      </Button>
    </Container>
  );

  const renderSuccess = () => (
    <FormattedMessage
      defaultMessage="Reset link has been sent to your email"
      description="Auth / Request password reset / Sucesss message"
    />
  );

  return formState.isSubmitSuccessful ? renderSuccess() : renderForm();
};
