import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useAsyncDispatch } from '../../../utils/reduxSagaPromise';
import { useApiForm } from '../../../hooks/useApiForm';
import { requestPasswordReset } from '../../../../modules/auth/auth.actions';
import { Input } from '../../input';
import { Container, ErrorMessage, SubmitButton } from './passwordResetRequestForm.styles';

interface PasswordResetRequestFormProps {
  onSubmitted?: () => void;
}

interface ResetPasswordFormFields {
  email: string;
}

export const PasswordResetRequestForm = ({ onSubmitted }: PasswordResetRequestFormProps) => {
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
    try {
      const res = await dispatch(requestPasswordReset(data));
      setApiResponse(res);
      if (!res.isError) {
        onSubmitted?.();
      }
    } catch {}
  };

  return (
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
        required
        label={intl.formatMessage({
          defaultMessage: 'Email',
          description: 'Auth / Request password reset / Email label',
        })}
        placeholder={intl.formatMessage({
          defaultMessage: 'Write your email here...',
          description: 'Auth / Request password reset / Email placeholder',
        })}
        error={errors.email?.message}
      />

      {genericError && <ErrorMessage>{genericError}</ErrorMessage>}

      <SubmitButton>
        {formState.isSubmitSuccessful ? (
          <FormattedMessage
            defaultMessage="Send the link again"
            description="Auth / Request password reset / Resend button"
          />
        ) : (
          <FormattedMessage
            defaultMessage="Send the link"
            description="Auth / Request password reset / Submit button"
          />
        )}
      </SubmitButton>
    </Container>
  );
};
