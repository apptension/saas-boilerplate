import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { useApiForm } from '../../../hooks/useApiForm';
import { useAsyncDispatch } from '../../../utils/reduxSagaPromise';
import { Input } from '../../input';
import { signup } from '../../../../modules/auth/auth.actions';
import { useLocaleUrl } from '../../../../routes/useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../../../routes/app.constants';
import { FormFieldsRow } from '../../../../theme/size';
import { Container, ErrorMessage, SubmitButton, Checkbox } from './signupForm.styles';

interface SignupFormFields {
  password: string;
  email: string;
  acceptTerms: boolean;
}

export const SignupForm = () => {
  const intl = useIntl();
  const termsUrl = useLocaleUrl(ROUTES.termsAndConditions);
  const privacyUrl = useLocaleUrl(ROUTES.privacyPolicy);
  const dispatch = useAsyncDispatch();
  const { register, handleSubmit, errors, setApiResponse, genericError } = useApiForm<SignupFormFields>();

  const onSignup = async (data: SignupFormFields) => {
    try {
      const res = await dispatch(
        signup({
          password: data.password,
          email: data.email,
        })
      );
      setApiResponse(res);
    } catch {}
  };

  return (
    <Container onSubmit={handleSubmit(onSignup)}>
      <FormFieldsRow>
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
      </FormFieldsRow>

      <FormFieldsRow>
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
      </FormFieldsRow>

      <Checkbox
        label={intl.formatMessage(
          {
            defaultMessage: 'You must accept our {termsLink} and {policyLink}',
            description: 'Auth / Signup / Accept terms label',
          },
          {
            termsLink: (
              <Link to={termsUrl}>
                <FormattedMessage
                  description={'Auth / Signup / Accept checkbox / T&C link'}
                  defaultMessage="Terms of Use"
                />
              </Link>
            ),
            policyLink: (
              <Link to={privacyUrl}>
                <FormattedMessage
                  description={'Auth / Signup / Accept checkbox / Privacy policy link'}
                  defaultMessage="Privacy Policy"
                />
              </Link>
            ),
          }
        )}
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

      <SubmitButton>
        <FormattedMessage defaultMessage="Signup" description="Auth / signup button" />
      </SubmitButton>
    </Container>
  );
};
