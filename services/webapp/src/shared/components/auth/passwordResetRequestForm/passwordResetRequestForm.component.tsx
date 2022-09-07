import { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import throttle from 'lodash.throttle';
import { useAsyncDispatch } from '../../../utils/reduxSagaPromise';
import { useApiForm } from '../../../hooks/useApiForm';
import { requestPasswordReset } from '../../../../modules/auth/auth.actions';
import { Input } from '../../forms/input';
import { Container, ErrorMessage, SubmitButton } from './passwordResetRequestForm.styles';
import { SUBMIT_THROTTLE } from './passwordResetRequestForm.constants';
import { ResetPasswordFormFields } from './passwordResetRequestForm.types';

type PasswordResetRequestFormProps = {
  onSubmitted?: () => void;
};

export const PasswordResetRequestForm = ({ onSubmitted }: PasswordResetRequestFormProps) => {
  const intl = useIntl();
  const dispatch = useAsyncDispatch();
  const [isSubmitted, setSubmitted] = useState(false);

  const {
    form: {
      register,
      handleSubmit,
      formState: { errors },
    },
    setApiResponse,
    hasGenericErrorOnly,
    genericError,
  } = useApiForm<ResetPasswordFormFields>({
    errorMessages: {
      email: {
        user_not_found: intl.formatMessage({
          defaultMessage: 'The user with specified email does not exist',
          id: 'Auth / Request password reset / User not found',
        }),
      },
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        {...register('email', {
          required: {
            value: true,
            message: intl.formatMessage({
              defaultMessage: 'Email is required',
              id: 'Auth / Request password reset  / Email required',
            }),
          },
          pattern: {
            value: /^\S+@\S+\.\S+$/,
            message: intl.formatMessage({
              defaultMessage: 'Email format is invalid',
              id: 'Auth / Request password reset / Email format error',
            }),
          },
        })}
        type="email"
        required
        label={intl.formatMessage({
          defaultMessage: 'Email',
          id: 'Auth / Request password reset / Email label',
        })}
        placeholder={intl.formatMessage({
          defaultMessage: 'Write your email here...',
          id: 'Auth / Request password reset / Email placeholder',
        })}
        error={errors.email?.message}
      />

      {hasGenericErrorOnly && <ErrorMessage>{genericError}</ErrorMessage>}

      <SubmitButton>
        {isSubmitted ? (
          <FormattedMessage
            defaultMessage="Send the link again"
            id="Auth / Request password reset / Resend button"
          />
        ) : (
          <FormattedMessage
            defaultMessage="Send the link"
            id="Auth / Request password reset / Submit button"
          />
        )}
      </SubmitButton>
    </Container>
  );
};
