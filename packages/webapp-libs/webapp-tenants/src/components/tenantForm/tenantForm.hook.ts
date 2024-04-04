import { useApiForm } from '@sb/webapp-api-client/hooks';
import { useEffect } from 'react';

import { TenantFormFields, TenantFormProps } from './tenantForm.component';

type UseTenantFormProps = Omit<TenantFormProps, 'loading'>;

export const useTenantForm = ({ error, onSubmit, initialData }: UseTenantFormProps) => {
  const form = useApiForm<TenantFormFields>({
    defaultValues: {
      name: initialData?.name,
    },
  });

  const { handleSubmit, setApolloGraphQLResponseErrors } = form;

  useEffect(() => {
    if (error) setApolloGraphQLResponseErrors(error.graphQLErrors);
  }, [error, setApolloGraphQLResponseErrors]);

  const handleFormSubmit = handleSubmit((formData: TenantFormFields) => onSubmit(formData));

  return { ...form, handleFormSubmit };
};
