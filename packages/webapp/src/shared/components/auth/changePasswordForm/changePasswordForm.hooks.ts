import { useMutation } from '@apollo/client/react';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { useIntl } from 'react-intl';

import { authChangePasswordMutation } from './changePasswordForm.graphql';
import { ChangePasswordFormFields } from './changePasswordForm.types';

export const useChangePasswordForm = () => {
  const intl = useIntl();
  const { toast } = useToast();

  const form = useApiForm<ChangePasswordFormFields>({
    errorMessages: {
      oldPassword: {
        wrong_password: intl.formatMessage({
          defaultMessage: 'The password is invalid.',
          id: 'Auth / Change password / wrong old password',
        }),
      },
      newPassword: {
        password_too_common: intl.formatMessage({
          defaultMessage: 'The password is too common.',
          id: 'Auth / Change password / password too common',
        }),
        password_entirely_numeric: intl.formatMessage({
          defaultMessage: "The password can't be entirely numeric.",
          id: 'Auth / Change password / password entirely numeric',
        }),
      },
    },
  });

  const {
    handleSubmit,
    setApolloGraphQLResponseErrors,
    form: { reset },
  } = form;

  const [commitChangePasswordMutation, { loading }] = useMutation(authChangePasswordMutation, {
    onCompleted: () => {
      trackEvent('profile', 'password-update');

      reset();

      toast({
        description: intl.formatMessage({
          defaultMessage: 'Password successfully changed.',
          id: 'Auth / Change password / Success message',
        }),
        variant: 'success',
      });
    },
    onError: (error: any) => {
      if (error?.graphQLErrors) {
        setApolloGraphQLResponseErrors(error.graphQLErrors);
      }
    },
  });

  const handleChangePassword = handleSubmit(async ({ newPassword, oldPassword }: ChangePasswordFormFields) => {
    try {
      await commitChangePasswordMutation({
        variables: {
          input: {
            newPassword,
            oldPassword,
          },
        },
      });
    } catch (error) {
      // Error is handled by onError callback
      // This catch prevents unhandled promise rejection
    }
  });
  return { ...form, loading, handleChangePassword };
};
