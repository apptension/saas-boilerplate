import { useMutation, useQuery } from '@apollo/client';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { FormattedMessage, useIntl } from 'react-intl';
import { Navigate, useParams } from 'react-router';

import { RoutesConfig } from '../../../config/routes';
import { CrudDemoItemForm } from '../crudDemoItemForm';
import { CrudDemoItemFormFields } from '../crudDemoItemForm/crudDemoItemForm.component';
import { editCrudDemoItemMutation, editCrudDemoItemQuery } from './editCrudDemoItem.graphql';

type Params = { id: string };

export const EditCrudDemoItem = () => {
  const { id } = useParams<Params>();
  const { data, loading } = useQuery(editCrudDemoItemQuery, { variables: { id: id ?? '' } });
  const crudDemoItem = data?.crudDemoItem;

  const { toast } = useToast();
  const intl = useIntl();

  const successMessage = intl.formatMessage({
    id: 'CrudDemoItem form / Success message',
    defaultMessage: '🎉 Changes saved successfully!',
  });

  const generateLocalePath = useGenerateLocalePath();
  const [commitEditCrudDemoItemMutation, { error, loading: loadingMutation }] = useMutation(editCrudDemoItemMutation, {
    onCompleted: (data) => {
      const id = data?.updateCrudDemoItem?.crudDemoItem?.id;

      trackEvent('crud', 'edit', id);

      toast({ description: successMessage });
    },
  });

  if (loading)
    return (
      <PageLayout>
        <FormattedMessage defaultMessage="Loading ..." id="Loading message" />
      </PageLayout>
    );
  if (!crudDemoItem) return <Navigate to={generateLocalePath(RoutesConfig.crudDemoItem.index)} />;

  const onFormSubmit = (formData: CrudDemoItemFormFields) => {
    commitEditCrudDemoItemMutation({ variables: { input: { id: crudDemoItem.id, name: formData.name } } });
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
