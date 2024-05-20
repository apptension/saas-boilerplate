import { useMutation } from '@apollo/client';
import { gql } from '@sb/webapp-api-client/graphql';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router';

import { TenantForm } from '../../components/tenantForm';
import { TenantFormFields } from '../../components/tenantForm/tenantForm.component';
import { useGenerateTenantPath } from '../../hooks';

export const addTenantMutation = gql(/* GraphQL */ `
  mutation addTenantMutation($input: CreateTenantMutationInput!) {
    createTenant(input: $input) {
      tenantEdge {
        node {
          id
          name
        }
      }
    }
  }
`);

export const AddTenantForm = () => {
  const generateTenantPath = useGenerateTenantPath();
  const { toast } = useToast();
  const intl = useIntl();
  const navigate = useNavigate();
  const { reload: reloadCommonQuery } = useCommonQuery();

  const successMessage = intl.formatMessage({
    id: 'Tenant form / AddTenant / Success message',
    defaultMessage: '🎉 Organization added successfully!',
  });

  const [commitTenantFormMutation, { error, loading: loadingMutation }] = useMutation(addTenantMutation, {
    onCompleted: (data) => {
      const id = data?.createTenant?.tenantEdge?.node?.id;
      reloadCommonQuery();

      trackEvent('tenant', 'add', id);

      toast({ description: successMessage });

      navigate(generateTenantPath(RoutesConfig.home, { tenantId: id! }));
    },
  });

  const onFormSubmit = (formData: TenantFormFields) => {
    commitTenantFormMutation({
      variables: {
        input: {
          name: formData.name,
        },
      },
    });
  };

  return (
    <PageLayout>
      <PageHeadline
        hasBackButton
        header={<FormattedMessage defaultMessage="Add Tenant" id="Tenant form / AddTenant / Page headline" />}
      />

      <TenantForm onSubmit={onFormSubmit} loading={loadingMutation} error={error} />
    </PageLayout>
  );
};
