import { useMutation } from '@apollo/client';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { Button, ButtonSize } from '@sb/webapp-core/components/buttons';
import { Input } from '@sb/webapp-core/components/forms';
import { H3, Small } from '@sb/webapp-core/components/typography';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { FormattedMessage, useIntl } from 'react-intl';

import { validateOtpMutation } from '../twoFactorAuthForm/twoFactorAuthForm.graphql';

export type ValidateOtpFormFields = {
  token: string;
};

export const ValidateOtpForm = () => {
  const intl = useIntl();
  const form = useApiForm<ValidateOtpFormFields>();
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
    onCompleted: () => {
      trackEvent('auth', 'otp-validate');
    },
  });

  const handleFormSubmit = async (values: { token: string }) => {
    const { data } = await commitValidateOtpMutation({ variables: { input: { otpToken: values.token } } });
    if (data?.validateOtp?.access) {
      reloadCommonQuery();
    }
  };

  return (
    <div className="m-auto flex max-w-sm flex-col items-center justify-center text-center align-middle lg:mt-32">
      <H3 className="mb-8">
        <FormattedMessage
          defaultMessage="Please enter the authentication code from your OTP provider app to sign in."
          id="Auth / Validate OTP / Enter code from app"
        />
      </H3>

      <form className="flex w-full max-w-xs flex-col gap-6" onSubmit={handleSubmit(handleFormSubmit)}>
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

        {hasGenericErrorOnly ? <Small className="text-red-500">{genericError}</Small> : null}

        <Button type="submit" size={ButtonSize.NORMAL} className="mt-2">
          <FormattedMessage defaultMessage="Submit" id="Auth / Validate OTP / Submit button" />
        </Button>
      </form>
    </div>
  );
};
