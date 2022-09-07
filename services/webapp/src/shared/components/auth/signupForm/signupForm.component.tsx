import { FormattedMessage, useIntl } from 'react-intl';
import { Input } from '../../forms/input';
import { RoutesConfig } from '../../../../app/config/routes';
import { FormFieldsRow } from '../../../../theme/size';
import { useGenerateLocalePath } from '../../../hooks/localePaths';
import { Checkbox, Container, ErrorMessage, InlineLink, SubmitButton } from './signupForm.styles';
import { useSignupForm } from './signupForm.hooks';

export const SignupForm = () => {
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const {
    form: {
      register,
      formState: { errors },
    },
    hasGenericErrorOnly,
    genericError,
    handleSignup,
  } = useSignupForm();

  return (
    <Container onSubmit={handleSignup}>
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
              <InlineLink to={generateLocalePath(RoutesConfig.termsAndConditions)}>
                <FormattedMessage
                  description="Auth / Signup / Accept checkbox / T&C link"
                  defaultMessage="Terms of Use"
                />
              </InlineLink>
            ),
            policyLink: (
              <InlineLink to={generateLocalePath(RoutesConfig.privacyPolicy)}>
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
