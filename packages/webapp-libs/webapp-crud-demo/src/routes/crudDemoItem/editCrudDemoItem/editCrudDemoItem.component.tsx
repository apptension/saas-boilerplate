import { useMutation, useQuery } from '@apollo/client';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Separator } from '@sb/webapp-core/components/ui/separator';
import { Skeleton } from '@sb/webapp-core/components/ui/skeleton';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { FormattedMessage, useIntl } from 'react-intl';
import { Navigate, useNavigate, useParams } from 'react-router';

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
    defaultMessage: '🎉 Changes saved successfully!',
  });

  const generateLocalePath = useGenerateLocalePath();
  const [commitEditCrudDemoItemMutation, { error, loading: loadingMutation }] = useMutation(editCrudDemoItemMutation, {
    onCompleted: (data) => {
      const id = data?.updateCrudDemoItem?.crudDemoItem?.id;

      trackEvent('crud', 'edit', id);

      toast({ description: successMessage });

      navigate(generateLocalePath(RoutesConfig.crudDemoItem.list));
    },
  });

  if (loading)
    return (
      <PageLayout>
        <div className="flex w-full justify-between items-center">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-8" />
        </div>
        <Separator />
        <div className="flex flex-col">
          <div className="mt-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  if (!crudDemoItem) return <Navigate to={generateLocalePath(RoutesConfig.crudDemoItem.index)} />;

  const onFormSubmit = (formData: CrudDemoItemFormFields) => {
    if (!currentTenant) return;
    commitEditCrudDemoItemMutation({
      variables: { input: { tenantId: currentTenant.id, id: crudDemoItem.id, name: formData.name } },
    });
  };
  return (
    <PageLayout>
      <PageHeadline
        hasBackButton
        header={<FormattedMessage defaultMessage="Edit CRUD Example Item" id="EditCrudDemoItem / Header" />}
      />
      <CrudDemoItemForm onSubmit={onFormSubmit} initialData={crudDemoItem} error={error} loading={loadingMutation} />
    </PageLayout>
  );
};
