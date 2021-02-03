import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useApiForm } from '../../../hooks/useApiForm';
import { useAsyncDispatch } from '../../../utils/reduxSagaPromise';
import { Input } from '../../input';
import { Button } from '../../button';
import { signup } from '../../../../modules/auth/auth.actions';
import { Checkbox } from '../../checkbox';
import { Container, ErrorMessage } from './signupForm.styles';

interface SignupFormFields {
  password: string;
  email: string;
  acceptTerms: boolean;
}

export const SignupForm = () => {
  const intl = useIntl();
  const dispatch = useAsyncDispatch();
  const { register, handleSubmit, errors, setApiResponse, genericError } = useApiForm<SignupFormFields>();

  const onSignup = async (data: SignupFormFields) => {
    const res = await dispatch(
      signup({
        password: data.password,
        email: data.email,
      })
    );
    setApiResponse(res);
  };

  return (
    <Container onSubmit={handleSubmit(onSignup)}>
      <Input
        name={'email'}
        type={'email'}
        ref={register({
          required: {
            value: true,
            message: intl.formatMessage({
              defaultMessage: 'Email is required',
              description: 'Auth / Signup / Email required',
            }),
          },
        })}
        placeholder={intl.formatMessage({
          defaultMessage: 'Email',
          description: 'Auth / Signup / Email placeholder',
        })}
        error={errors.email?.message}
      />
      <Input
        ref={register({
          required: {
            value: true,
            message: intl.formatMessage({
              defaultMessage: 'Password is required',
              description: 'Auth / Signup / Password required',
            }),
          },
        })}
        name={'password'}
        type={'password'}
        placeholder={intl.formatMessage({
          defaultMessage: 'Password',
          description: 'Auth / Signup / Password placeholder',
        })}
        error={errors.password?.message}
      />
      <Checkbox
        label={intl.formatMessage({
          defaultMessage: 'Accept terms and conditions',
          description: 'Auth / Signup / Accept terms label',
        })}
        ref={register({
          required: {
            value: true,
            message: intl.formatMessage({
              defaultMessage: 'You need to accept terms and conditions',
              description: 'Auth / Signup / Password required',
            }),
          },
        })}
        name={'acceptTerms'}
        error={errors.acceptTerms?.message}
      />
      {genericError && <ErrorMessage>{genericError}</ErrorMessage>}
      <Button type="submit">
        <FormattedMessage defaultMessage="Signup" description="Auth / signup button" />
      </Button>
    </Container>
  );
};
