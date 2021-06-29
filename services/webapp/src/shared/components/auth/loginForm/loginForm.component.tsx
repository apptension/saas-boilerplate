import { FormattedMessage, useIntl } from 'react-intl';
import { useApiForm } from '../../../hooks/useApiForm';
import { useAsyncDispatch } from '../../../utils/reduxSagaPromise';
import { Input } from '../../input';
import { login } from '../../../../modules/auth/auth.actions';
import { FormFieldsRow } from '../../../../theme/size';
import { Container, ErrorMessage, SubmitButton } from './loginForm.styles';

type LoginFormFields = {
  password: string;
  email: string;
};

export const LoginForm = () => {
  const intl = useIntl();
  const dispatch = useAsyncDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setApiResponse,
    hasGenericErrorOnly,
    genericError,
  } = useApiForm<LoginFormFields>({
    errorMessages: {
      nonFieldErrors: {
        no_active_account: intl.formatMessage({
          defaultMessage: 'Incorrect authentication credentials.',
          description: 'Login form / error / no active account',
        }),
        authentication_failed: intl.formatMessage({
          defaultMessage: 'Incorrect authentication credentials.',
          description: 'Login form / error / authentication failed',
        }),
      },
    },
  });

  const onLogin = async (data: LoginFormFields) => {
    try {
      const res = await dispatch(login(data));
      setApiResponse(res);
    } catch {}
  };

  return (
    <Container onSubmit={handleSubmit(onLogin)}>
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
