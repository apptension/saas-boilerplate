import { useMutation } from '@apollo/client';
import { gql } from '@sb/webapp-api-client/graphql';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { Building2 } from 'lucide-react';
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
    defaultMessage: 'Organization added successfully!',
  });

  const [commitTenantFormMutation, { error, loading: loadingMutation }] = useMutation(addTenantMutation, {
    onCompleted: (data) => {
      const id = data?.createTenant?.tenantEdge?.node?.id;
      reloadCommonQuery();

      trackEvent('tenant', 'add', id);

      toast({ description: successMessage, variant: 'success' });

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <FormattedMessage
              defaultMessage="Add Organization"
              id="Tenant form / AddTenant / Card title"
            />
          </CardTitle>
          <CardDescription>
            <FormattedMessage
              defaultMessage="Enter the details for your new organization"
              id="Tenant form / AddTenant / Card description"
            />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TenantForm
            onSubmit={onFormSubmit}
            loading={loadingMutation}
            error={error}
            hideCancel
            submitLabel={
              <FormattedMessage
                defaultMessage="Create organization"
                id="Tenant form / AddTenant / Submit button"
              />
            }
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};
