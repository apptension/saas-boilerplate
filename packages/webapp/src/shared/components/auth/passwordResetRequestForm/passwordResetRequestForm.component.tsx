import { Button } from '@sb/webapp-core/components/buttons';
import { Input } from '@sb/webapp-core/components/forms';
import { Small } from '@sb/webapp-core/components/typography';
import { FormattedMessage, useIntl } from 'react-intl';

import { emailPattern } from '../../../constants';
import { usePasswordResetRequestForm } from './passwordResetRequestForm.hooks';

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
    <form noValidate className="flex w-full flex-col gap-6" onSubmit={handleResetRequestPassword}>
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

      {hasGenericErrorOnly ? <Small className="text-red-500">{genericError}</Small> : null}

      <Button type="submit" disabled={loading}>
        {isSubmitted ? (
          <FormattedMessage defaultMessage="Send the link again" id="Auth / Request password reset / Resend button" />
        ) : (
          <FormattedMessage defaultMessage="Send the link" id="Auth / Request password reset / Submit button" />
        )}
      </Button>
    </form>
  );
};
