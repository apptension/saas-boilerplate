import { useMutation } from '@apollo/client';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';

import { RoutesConfig } from '../../../../app/config/routes';
import { authRequestPasswordResetConfirmMutation } from './passwordResetConfirmForm.graphql';
import { ResetPasswordFormFields } from './passwordResetConfirmForm.types';

export const usePasswordResetConfirmForm = (user: string, token: string) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();
  const intl = useIntl();

  const [commitPasswordResetConfirm, { loading }] = useMutation(authRequestPasswordResetConfirmMutation, {
    onCompleted: () => {
      trackEvent('auth', 'reset-password-confirm');

      navigate(generateLocalePath(RoutesConfig.login));

      toast({
        description: intl.formatMessage({
          defaultMessage: '🎉 Password reset successfully!',
          id: 'Auth / Reset password confirm / Success message',
        }),
      });
    },
    onError: (error) => {
      setApolloGraphQLResponseErrors(error.graphQLErrors);
    },
  });

  const form = useApiForm<ResetPasswordFormFields>({
    errorMessages: {
      nonFieldErrors: {
        invalid_token: intl.formatMessage({
          defaultMessage:
            'The password reset link you have used is either expired, has already been used, or is incorrect',
          id: 'Auth / Reset password confirm / invalid token',
        }),
      },
      newPassword: {
        password_too_common: intl.formatMessage({
          defaultMessage: 'The password is too common.',
          id: 'Auth / Reset password confirm / password too common',
        }),
        password_entirely_numeric: intl.formatMessage({
          defaultMessage: "The password can't be entirely numeric.",
          id: 'Auth / Reset password confirm / password entirely numeric',
        }),
      },
    },
  });
  const { handleSubmit, setApolloGraphQLResponseErrors } = form;
  const handlePasswordResetConfirm = handleSubmit((data: ResetPasswordFormFields) => {
    commitPasswordResetConfirm({
      variables: {
        input: {
          newPassword: data.newPassword,
          user,
          token,
        },
      },
    });
  });

  return { ...form, loading, handlePasswordResetConfirm };
};
