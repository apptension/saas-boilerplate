import { Input } from '@saas-boilerplate-app/webapp-core/components/forms';
import { FormattedMessage, useIntl } from 'react-intl';

import { emailPattern } from '../../../constants';
import { usePasswordResetRequestForm } from './passwordResetRequestForm.hooks';
import { Container, ErrorMessage, SubmitButton } from './passwordResetRequestForm.styles';

type PasswordResetRequestFormProps = {
  onSubmitted?: () => void;
};

export const PasswordResetRequestForm = ({ onSubmitted }: PasswordResetRequestFormProps) => {
  const intl = useIntl();

  const {
    form: {
      formState: { errors },
      register,
    },
    genericError,
    hasGenericErrorOnly,
    loading,
    isSubmitted,
    handleResetRequestPassword,
  } = usePasswordResetRequestForm(onSubmitted);

  return (
    <Container onSubmit={handleResetRequestPassword}>
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
            value: emailPattern,
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

      <SubmitButton disabled={loading}>
        {isSubmitted ? (
          <FormattedMessage defaultMessage="Send the link again" id="Auth / Request password reset / Resend button" />
        ) : (
          <FormattedMessage defaultMessage="Send the link" id="Auth / Request password reset / Submit button" />
        )}
      </SubmitButton>
    </Container>
  );
};
