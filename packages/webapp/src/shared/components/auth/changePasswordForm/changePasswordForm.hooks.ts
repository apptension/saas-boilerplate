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
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    errorMessages: {
      oldPassword: {
        wrong_password: intl.formatMessage({
          defaultMessage: 'The current password is incorrect.',
          id: 'Auth / Change password / wrong old password',
        }),
      },
      newPassword: {
        password_too_common: intl.formatMessage({
          defaultMessage: 'This password is too common. Please choose a more unique password.',
          id: 'Auth / Change password / password too common',
        }),
        password_entirely_numeric: intl.formatMessage({
          defaultMessage: "The password can't be entirely numeric.",
          id: 'Auth / Change password / password entirely numeric',
        }),
        password_too_short: intl.formatMessage({
          defaultMessage: 'Password must be at least 8 characters long.',
          id: 'Auth / Change password / password too short backend',
        }),
        password_too_similar: intl.formatMessage({
          defaultMessage: 'The password is too similar to your personal information.',
          id: 'Auth / Change password / password too similar',
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
