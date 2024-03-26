import { useApiForm } from '@sb/webapp-api-client/hooks';
import { useEffect } from 'react';

import { TenantInvitationFormFields } from './tenantInvitationForm.component';

export const useTenantInvitationForm = ({ error, onSubmit, initialData }: any) => {
  const form = useApiForm<TenantInvitationFormFields>({
    defaultValues: {
      email: initialData?.email,
      role: initialData?.role,
    },
  });

  const { handleSubmit, setApolloGraphQLResponseErrors } = form;

  useEffect(() => {
    if (error) setApolloGraphQLResponseErrors(error.graphQLErrors);
  }, [error, setApolloGraphQLResponseErrors]);

  const handleFormSubmit = handleSubmit((formData: TenantInvitationFormFields) => onSubmit(formData));

  return { ...form, handleFormSubmit };
};
