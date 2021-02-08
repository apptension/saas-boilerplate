import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useApiForm } from '../../../hooks/useApiForm';
import { useAsyncDispatch } from '../../../utils/reduxSagaPromise';
import { Input } from '../../input';
import { Button } from '../../button';
import { login } from '../../../../modules/auth/auth.actions';
import { Container, ErrorMessage } from './loginForm.styles';

interface LoginFormFields {
  password: string;
  email: string;
}

export const LoginForm = () => {
  const intl = useIntl();
  const dispatch = useAsyncDispatch();
  const { register, handleSubmit, errors, setApiResponse, genericError } = useApiForm<LoginFormFields>();

  const onLogin = async (data: LoginFormFields) => {
    try {
      const res = await dispatch(login(data));
      setApiResponse(res);
    } catch {}
  };

  return (
    <Container onSubmit={handleSubmit(onLogin)}>
      <Input
        name={'email'}
        type={'email'}
        ref={register({
          required: {
            value: true,
            message: intl.formatMessage({
              defaultMessage: 'Email is required',
              description: 'Auth / Login / Email required',
            }),
          },
        })}
        placeholder={intl.formatMessage({
          defaultMessage: 'Email',
          description: 'Auth / Login / Email placeholder',
        })}
        error={errors.email?.message}
      />
      <Input
        ref={register({
          required: {
            value: true,
            message: intl.formatMessage({
              defaultMessage: 'Password is required',
              description: 'Auth / Login / Password required',
            }),
          },
        })}
        name={'password'}
        type={'password'}
        placeholder={intl.formatMessage({
          defaultMessage: 'Password',
          description: 'Auth / Login / Password placeholder',
        })}
        error={errors.password?.message}
      />
      {genericError && <ErrorMessage>{genericError}</ErrorMessage>}
      <Button type="submit">
        <FormattedMessage defaultMessage="Login" description="Auth / login button" />
      </Button>
    </Container>
  );
};
