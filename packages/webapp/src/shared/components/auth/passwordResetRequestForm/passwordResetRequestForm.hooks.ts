import { useMutation } from '@apollo/client';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useState } from 'react';

import { authRequestPasswordResetMutation } from './passwordResetRequestForm.graphql';
import { ResetPasswordFormFields } from './passwordResetRequestForm.types';

export const usePasswordResetRequestForm = (onSubmitted?: () => void) => {
  const [isSubmitted, setSubmitted] = useState(false);

  const form = useApiForm<ResetPasswordFormFields>();
  const { handleSubmit, setApolloGraphQLResponseErrors } = form;

  const [commitRequestPasswordReset, { loading }] = useMutation(authRequestPasswordResetMutation, {
    onCompleted: () => {
      trackEvent('auth', 'reset-password');

      setSubmitted(true);
      onSubmitted?.();
    },
    onError: (error) => {
      setApolloGraphQLResponseErrors(error.graphQLErrors);
    },
  });

  const handleResetRequestPassword = handleSubmit((data) => {
    commitRequestPasswordReset({
      variables: {
        input: data,
      },
    });
  });

  return { ...form, loading, isSubmitted, handleResetRequestPassword };
};
