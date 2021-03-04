import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useApiForm } from '../../../hooks/useApiForm';
import { useAsyncDispatch } from '../../../utils/reduxSagaPromise';
import { Input } from '../../input';
import { login } from '../../../../modules/auth/auth.actions';
import { FormFieldsRow } from '../../../../theme/size';
import { Container, ErrorMessage, SubmitButton } from './loginForm.styles';

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
      <FormFieldsRow>
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
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: intl.formatMessage({
                defaultMessage: 'Email format is invalid',
                description: 'Auth / Login / Email format error',
              }),
            },
          })}
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

      {Object.keys(errors).length === 0 && genericError && <ErrorMessage>{genericError}</ErrorMessage>}

      <SubmitButton>
        <FormattedMessage defaultMessage="Log in" description="Auth / login button" />
      </SubmitButton>
    </Container>
  );
};
