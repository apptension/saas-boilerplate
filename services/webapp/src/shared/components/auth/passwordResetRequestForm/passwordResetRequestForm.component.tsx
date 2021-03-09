import React, { useCallback, useState } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import throttle from 'lodash.throttle';
import { useAsyncDispatch } from '../../../utils/reduxSagaPromise';
import { useApiForm } from '../../../hooks/useApiForm';
import { requestPasswordReset } from '../../../../modules/auth/auth.actions';
import { Input } from '../../input';
import { Container, ErrorMessage, SubmitButton } from './passwordResetRequestForm.styles';

const SUBMIT_THROTTLE = 15_000;

interface PasswordResetRequestFormProps {
  onSubmitted?: () => void;
}

interface ResetPasswordFormFields {
  email: string;
}

export const PasswordResetRequestForm = ({ onSubmitted }: PasswordResetRequestFormProps) => {
  const [isSubmitted, setSubmitted] = useState(false);
  const intl = useIntl();
  const dispatch = useAsyncDispatch();
  const { register, handleSubmit, errors, setApiResponse, genericError } = useApiForm<ResetPasswordFormFields>({
    errorMessages: {
      email: {
        user_not_found: intl.formatMessage({
          defaultMessage: 'The user with specified email does not exist',
          description: 'Auth / Request password reset / User not found',
        }),
      },
    },
  });

  const onSubmit = useCallback(
    throttle(
      async (data: ResetPasswordFormFields) => {
        try {
          const res = await dispatch(requestPasswordReset(data));
          setApiResponse(res);
          if (!res.isError) {
            setSubmitted(true);
            onSubmitted?.();
          }
        } catch {}
      },
      SUBMIT_THROTTLE,
      { leading: true, trailing: true }
    ),
    [dispatch, onSubmitted, setApiResponse]
  );

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
          pattern: {
            value: /^\S+@\S+\.\S+$/,
            message: intl.formatMessage({
              defaultMessage: 'Email format is invalid',
              description: 'Auth / Request password reset / Email format error',
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

      {Object.keys(errors).length === 0 && genericError && <ErrorMessage>{genericError}</ErrorMessage>}

      <SubmitButton>
        {isSubmitted ? (
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
