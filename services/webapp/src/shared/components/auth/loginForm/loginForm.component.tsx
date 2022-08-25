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
                description: 'Auth / Login / Email required',
              }),
            },
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: intl.formatMessage({
                defaultMessage: 'Email format is invalid',
                description: 'Auth / Login / Email format error',
              }),
            },
          })}
          type="email"
          required
          label={intl.formatMessage({
            defaultMessage: 'Email',
            description: 'Auth / Login / Email label',
          })}
          placeholder={intl.formatMessage({
            defaultMessage: 'Write your email here...',
            description: 'Auth / Login / Email placeholder',
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
                description: 'Auth / Login / Password required',
              }),
            },
          })}
          type="password"
          required
          label={intl.formatMessage({
            defaultMessage: 'Password',
            description: 'Auth / Login / Password label',
          })}
          placeholder={intl.formatMessage({
            defaultMessage: 'Write your password here...',
            description: 'Auth / Login / Password placeholder',
          })}
          error={errors.password?.message}
        />
      </FormFieldsRow>

      {hasGenericErrorOnly && <ErrorMessage>{genericError}</ErrorMessage>}

      <SubmitButton>
        <FormattedMessage defaultMessage="Log in" description="Auth / login button" />
      </SubmitButton>
    </Container>
  );
};
