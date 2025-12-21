import { useMutation, useQuery } from '@apollo/client';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Skeleton } from '@sb/webapp-core/components/ui/skeleton';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { ArrowLeft, Database, Edit } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import { RoutesConfig } from '../../../config/routes';
import { CrudDemoItemForm } from '../crudDemoItemForm';
import { CrudDemoItemFormFields } from '../crudDemoItemForm/crudDemoItemForm.component';
import { editCrudDemoItemMutation, editCrudDemoItemQuery } from './editCrudDemoItem.graphql';

type Params = { id: string };

export const EditCrudDemoItem = () => {
  const { data: currentTenant } = useCurrentTenant();
  const navigate = useNavigate();
  const { id } = useParams<Params>();
  const { data, loading } = useQuery(editCrudDemoItemQuery, {
    variables: { id: id ?? '', tenantId: currentTenant?.id ?? '' },
    skip: !id || !currentTenant,
  });
  const crudDemoItem = data?.crudDemoItem;

  const { toast } = useToast();
  const intl = useIntl();

  const successMessage = intl.formatMessage({
    id: 'CrudDemoItem form / EditCrudDemoItem / Success message',
    defaultMessage: 'Changes saved successfully!',
  });

  const generateLocalePath = useGenerateLocalePath();
  const [commitEditCrudDemoItemMutation, { error, loading: loadingMutation }] = useMutation(editCrudDemoItemMutation, {
    onCompleted: (data) => {
      const id = data?.updateCrudDemoItem?.crudDemoItem?.id;

      trackEvent('crud', 'edit', id);

      toast({ description: successMessage, variant: 'success' });

      navigate(generateLocalePath(RoutesConfig.crudDemoItem.list));
    },
  });

  if (loading) {
    return (
      <PageLayout>
        <div className="mx-auto w-full max-w-5xl space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (!crudDemoItem) return <Navigate to={generateLocalePath(RoutesConfig.crudDemoItem.index)} />;

  const onFormSubmit = (formData: CrudDemoItemFormFields) => {
    if (!currentTenant) return;
    commitEditCrudDemoItemMutation({
      variables: { input: { tenantId: currentTenant.id, id: crudDemoItem.id, name: formData.name } },
    });
  };

  return (
    <PageLayout>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Edit CRUD Example Item',
          id: 'EditCrudDemoItem / page title',
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
            <FormattedMessage defaultMessage="Back to items" id="EditCrudDemoItem / Back" />
          </Link>
          <div className="flex items-center gap-2">
            <Edit className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage defaultMessage="Edit CRUD Example Item" id="EditCrudDemoItem / Header" />
            </h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage defaultMessage="Update the item details" id="EditCrudDemoItem / Description" />
          </Paragraph>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <FormattedMessage defaultMessage="Item Details" id="EditCrudDemoItem / Form title" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="Update the details for this item"
                id="EditCrudDemoItem / Form description"
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CrudDemoItemForm
              onSubmit={onFormSubmit}
              initialData={crudDemoItem}
              error={error}
              loading={loadingMutation}
            />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};
