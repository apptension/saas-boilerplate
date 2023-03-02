import { useMutation } from '@apollo/client';
import { useState } from 'react';

import { useApiForm } from '../../../hooks';
import { authRequestPasswordResetMutation } from './passwordResetRequestForm.graphql';
import { ResetPasswordFormFields } from './passwordResetRequestForm.types';

export const usePasswordResetRequestForm = (onSubmitted) => {
  const [isSubmitted, setSubmitted] = useState(false);

  const form = useApiForm<ResetPasswordFormFields>();
  const { handleSubmit, setApolloGraphQLResponseErrors } = form;

  const [commitRequestPasswordReset, { loading }] = useMutation(authRequestPasswordResetMutation, {
    onCompleted: () => {
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
