import { useMutation } from '@apollo/client';
import { ButtonSize } from '@sb/webapp-core/components/buttons';
import { Input } from '@sb/webapp-core/components/forms';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import { useCommonQuery } from '../../../../app/providers/commonQuery';
import { useApiForm, useGenerateLocalePath } from '../../../hooks';
import { validateOtpMutation } from '../twoFactorAuthForm/twoFactorAuthForm.graphql';
import { Container, ErrorMessage, Header, SubmitButton } from './validateOtpForm.styles';

export type ValidateOtpFormFields = {
  token: string;
};

export const ValidateOtpForm = () => {
  const form = useApiForm<ValidateOtpFormFields>();
  const generateLocalePath = useGenerateLocalePath();
  const intl = useIntl();
  const navigate = useNavigate();
  const {
    handleSubmit,
    hasGenericErrorOnly,
    genericError,
    setApolloGraphQLResponseErrors,
    form: {
      register,
      formState: { errors },
    },
  } = form;
  const { reload: reloadCommonQuery } = useCommonQuery();
  const [commitValidateOtpMutation] = useMutation(validateOtpMutation, {
    onError: (error) => setApolloGraphQLResponseErrors(error.graphQLErrors),
  });

  const handleFormSubmit = async (values: { token: string }) => {
    const { data } = await commitValidateOtpMutation({ variables: { input: { otpToken: values.token } } });
    if (data?.validateOtp?.access) {
      reloadCommonQuery();
      navigate(generateLocalePath(RoutesConfig.home));
    }
  };

  return (
    <Container>
      <Header>
        <FormattedMessage
          defaultMessage="Please enter the authentication code from your OTP provider app to sign in."
          id="Auth / Validate OTP / Enter code from app"
        />
      </Header>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Input
          {...register('token', {
            required: {
              value: true,
              message: intl.formatMessage({
                defaultMessage: 'The authentication code is required',
                id: 'Auth / Validate OTP / Auth code required',
              }),
            },
            minLength: {
              value: 6,
              message: intl.formatMessage({
                defaultMessage: 'The authentication code must be 6 characters long.',
                id: 'Auth / Validate OTP / Password too short',
              }),
            },
          })}
          pattern="[0-9]*"
          placeholder="Authentication Code"
          maxLength={6}
          autoFocus
          error={errors.token?.message}
          autoComplete="off"
        />
        {hasGenericErrorOnly && <ErrorMessage>{genericError}</ErrorMessage>}
        <SubmitButton type="submit" size={ButtonSize.NORMAL}>
          <FormattedMessage defaultMessage="Submit" id="Auth / Validate OTP / Submit button" />
        </SubmitButton>
      </form>
    </Container>
  );
};
