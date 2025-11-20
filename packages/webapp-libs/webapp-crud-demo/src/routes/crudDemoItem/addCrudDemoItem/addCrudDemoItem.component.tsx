import { useMutation } from '@apollo/client';
import { gql } from '@sb/webapp-api-client/graphql';
import { DEFAULT_PAGE_SIZE } from '@sb/webapp-api-client/hooks/usePagedPaginatedQuery';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { ArrowLeft, Database, Plus } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate } from 'react-router-dom';

import { RoutesConfig } from '../../../config/routes';
import { CrudDemoItemForm } from '../crudDemoItemForm';
import { CrudDemoItemFormFields } from '../crudDemoItemForm/crudDemoItemForm.component';
import { crudDemoItemListQuery } from '../crudDemoItemList/crudDemoItemList.component';

export const addCrudDemoItemMutation = gql(/* GraphQL */ `
  mutation addCrudDemoItemMutation($input: CreateCrudDemoItemMutationInput!) {
    createCrudDemoItem(input: $input) {
      crudDemoItemEdge {
        node {
          id
          name
        }
      }
    }
  }
`);

export const AddCrudDemoItem = () => {
  const generateLocalePath = useGenerateLocalePath();
  const { toast } = useToast();
  const intl = useIntl();
  const navigate = useNavigate();
  const { data: currentTenant } = useCurrentTenant();

  const successMessage = intl.formatMessage({
    id: 'CrudDemoItem form / AddCrudDemoItem / Success message',
    defaultMessage: '🎉 Item added successfully!',
  });

  const [commitCrudDemoItemFormMutation, { error, loading: loadingMutation }] = useMutation(addCrudDemoItemMutation, {
    refetchQueries: () => [
      {
        query: crudDemoItemListQuery,
        variables: {
          tenantId: currentTenant?.id,
          first: DEFAULT_PAGE_SIZE,
        },
      },
    ],
    onCompleted: (data) => {
      const id = data?.createCrudDemoItem?.crudDemoItemEdge?.node?.id;

      trackEvent('crud', 'add', id);

      toast({ description: successMessage });

      navigate(generateLocalePath(RoutesConfig.crudDemoItem.list));
    },
  });

  const onFormSubmit = (formData: CrudDemoItemFormFields) => {
    if (!currentTenant) return;

    commitCrudDemoItemFormMutation({
      variables: {
        input: { name: formData.name, tenantId: currentTenant?.id },
      },
    });
  };

  return (
    <PageLayout>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Add CRUD Example Item',
          id: 'AddCrudDemoItem / page title',
        })}
      />

      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <Link
            to={generateLocalePath(RoutesConfig.crudDemoItem.list)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <FormattedMessage defaultMessage="Back to items" id="AddCrudDemoItem / Back" />
          </Link>
          <div className="flex items-center gap-2">
            <Plus className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage defaultMessage="Add CRUD Example Item" id="AddCrudDemoItem / Header" />
            </h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage defaultMessage="Create a new CRUD example item" id="AddCrudDemoItem / Description" />
          </Paragraph>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <FormattedMessage defaultMessage="Item Details" id="AddCrudDemoItem / Form title" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="Fill in the details to create a new item"
                id="AddCrudDemoItem / Form description"
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CrudDemoItemForm onSubmit={onFormSubmit} error={error} loading={loadingMutation} />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};
