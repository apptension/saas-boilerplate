import { FormattedMessage, useIntl } from 'react-intl';
import { Input } from '../../forms/input';
import { FormFieldsRow } from '../../../../theme/size';
import { Container, ErrorMessage, SubmitButton } from './loginForm.styles';
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
    handleLogin,
  } = useLoginForm();

  return (
    <Container onSubmit={handleLogin}>
      <FormFieldsRow>
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
              value: /^\S+@\S+\.\S+$/,
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
      </FormFieldsRow>

      <FormFieldsRow>
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
      </FormFieldsRow>

      {hasGenericErrorOnly && <ErrorMessage>{genericError}</ErrorMessage>}

      <SubmitButton>
        <FormattedMessage defaultMessage="Log in" id="Auth / login button" />
      </SubmitButton>
    </Container>
  );
};
