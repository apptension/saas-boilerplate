import { Input } from '@saas-boilerplate-app/webapp-core/components/forms';
import { size } from '@saas-boilerplate-app/webapp-core/theme';
import { FormattedMessage, useIntl } from 'react-intl';

import { emailPattern } from '../../../constants';
import { useLoginForm } from './loginForm.hooks';
import { Container, ErrorMessage, SubmitButton } from './loginForm.styles';

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
    <Container onSubmit={handleLogin}>
      <size.FormFieldsRow>
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
      </size.FormFieldsRow>

      <size.FormFieldsRow>
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
      </size.FormFieldsRow>

      {hasGenericErrorOnly && <ErrorMessage>{genericError}</ErrorMessage>}

      <SubmitButton disabled={loading}>
        <FormattedMessage defaultMessage="Log in" id="Auth / login button" />
      </SubmitButton>
    </Container>
  );
};
