import { FormattedMessage, useIntl } from 'react-intl';
import { useApiForm } from '../../../hooks/useApiForm';
import { useAsyncDispatch } from '../../../utils/reduxSagaPromise';
import { Input } from '../../forms/input';
import { signup } from '../../../../modules/auth/auth.actions';
import { ROUTES } from '../../../../app/config/routes';
import { FormFieldsRow } from '../../../../theme/size';
import { useGenerateLocalePath } from '../../../hooks/localePaths';
import { Container, ErrorMessage, SubmitButton, Checkbox, InlineLink } from './signupForm.styles';

type SignupFormFields = {
  password: string;
  email: string;
  acceptTerms: boolean;
  test: { nested: string };
};

export const SignupForm = () => {
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const dispatch = useAsyncDispatch();
  const {
    form: {
      register,
      handleSubmit,
      formState: { errors },
    },
    setApiResponse,
    hasGenericErrorOnly,
    genericError,
  } = useApiForm<SignupFormFields>({
    errorMessages: {
      email: {
        unique: intl.formatMessage({
          defaultMessage: 'The email address is already taken',
          description: 'Auth / Signup / email unique',
        }),
      },
      password: {
        password_too_common: intl.formatMessage({
          defaultMessage: 'The password is too common.',
          description: 'Auth / Signup / password too common',
        }),
        password_entirely_numeric: intl.formatMessage({
          defaultMessage: "The password can't be entirely numeric.",
          description: 'Auth / Signup / password entirely numeric',
        }),
      },
    },
  });

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
          {...register('email', {
            required: {
              value: true,
              message: intl.formatMessage({
                defaultMessage: 'Email is required',
                description: 'Auth / Signup / Email required',
              }),
            },
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: intl.formatMessage({
                defaultMessage: 'Email format is invalid',
                description: 'Auth / Signup / Email format error',
              }),
            },
          })}
          type="email"
          required
          label={intl.formatMessage({
            defaultMessage: 'Email',
            description: 'Auth / Signup / Email label',
          })}
          placeholder={intl.formatMessage({
            defaultMessage: 'Write your email here...',
            description: 'Auth / Signup / Email placeholder',
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
                description: 'Auth / Signup / Password required',
              }),
            },
            minLength: {
              value: 8,
              message: intl.formatMessage({
                defaultMessage: 'Password is too short. It must contain at least 8 characters.',
                description: 'Auth / Signup / Password too short',
              }),
            },
          })}
          required
          type="password"
          label={intl.formatMessage({
            defaultMessage: 'Password',
            description: 'Auth / Signup / Password label',
          })}
          placeholder={intl.formatMessage({
            defaultMessage: 'Minimum 8 characters',
            description: 'Auth / Signup / Password placeholder',
          })}
          error={errors.password?.message}
        />
      </FormFieldsRow>

      <Checkbox
        {...register('acceptTerms', {
          required: {
            value: true,
            message: intl.formatMessage({
              defaultMessage: 'You need to accept terms and conditions',
              description: 'Auth / Signup / Password required',
            }),
          },
        })}
        label={intl.formatMessage(
          {
            defaultMessage: 'You must accept our {termsLink} and {policyLink}.',
            description: 'Auth / Signup / Accept terms label',
          },
          {
            termsLink: (
              <InlineLink to={generateLocalePath(ROUTES.termsAndConditions)}>
                <FormattedMessage
                  description="Auth / Signup / Accept checkbox / T&C link"
                  defaultMessage="Terms of Use"
                />
              </InlineLink>
            ),
            policyLink: (
              <InlineLink to={generateLocalePath(ROUTES.privacyPolicy)}>
                <FormattedMessage
                  description="Auth / Signup / Accept checkbox / Privacy policy link"
                  defaultMessage="Privacy Policy"
                />
              </InlineLink>
            ),
          }
        )}
        error={errors.acceptTerms?.message}
      />

      {hasGenericErrorOnly && <ErrorMessage>{genericError}</ErrorMessage>}

      <SubmitButton>
        <FormattedMessage defaultMessage="Sign up" description="Auth / signup button" />
      </SubmitButton>
    </Container>
  );
};
