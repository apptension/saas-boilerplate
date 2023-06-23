import { Button } from '@sb/webapp-core/components/buttons';
import { Input } from '@sb/webapp-core/components/forms';
import { Small } from '@sb/webapp-core/components/typography';
import { FormattedMessage, useIntl } from 'react-intl';

import { emailPattern } from '../../../constants';
import { useLoginForm } from './loginForm.hooks';

export const LoginForm = () => {
  const intl = useIntl();

  const {
    form: {
      register,
      formState: { errors },
    },
    hasGenericErrorOnly,
    genericError,
    loading,
    handleLogin,
  } = useLoginForm();

  return (
    <form noValidate className="flex w-full flex-col gap-6" onSubmit={handleLogin}>
      <Input
        {...register('email', {
          required: {
            value: true,
            message: intl.formatMessage({
              defaultMessage: 'Email is required',
              id: 'Auth / Login / Email required',
            }),
          },
          pattern: {
            value: emailPattern,
            message: intl.formatMessage({
              defaultMessage: 'Email format is invalid',
              id: 'Auth / Login / Email format error',
            }),
          },
        })}
        type="email"
        required
        label={intl.formatMessage({
          defaultMessage: 'Email',
          id: 'Auth / Login / Email label',
        })}
        placeholder={intl.formatMessage({
          defaultMessage: 'Write your email here...',
          id: 'Auth / Login / Email placeholder',
        })}
        error={errors.email?.message}
      />

      <Input
        {...register('password', {
          required: {
            value: true,
            message: intl.formatMessage({
              defaultMessage: 'Password is required',
              id: 'Auth / Login / Password required',
            }),
          },
        })}
        type="password"
        required
        label={intl.formatMessage({
          defaultMessage: 'Password',
          id: 'Auth / Login / Password label',
        })}
        placeholder={intl.formatMessage({
          defaultMessage: 'Write your password here...',
          id: 'Auth / Login / Password placeholder',
        })}
        error={errors.password?.message}
      />

      {hasGenericErrorOnly ? <Small className="text-red-500">{genericError}</Small> : null}

      <Button disabled={loading} type="submit">
        <FormattedMessage defaultMessage="Log in" id="Auth / login button" />
      </Button>
    </form>
  );
};
