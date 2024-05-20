import { useMutation } from '@apollo/client';
import { gql } from '@sb/webapp-api-client/graphql';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router';

import { RoutesConfig } from '../../../config/routes';
import { CrudDemoItemForm } from '../crudDemoItemForm';
import { CrudDemoItemFormFields } from '../crudDemoItemForm/crudDemoItemForm.component';
import { ITEMS_PER_PAGE, crudDemoItemListQuery } from '../crudDemoItemList/crudDemoItemList.component';

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
          first: ITEMS_PER_PAGE,
          tenantId: currentTenant?.id,
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
      <PageHeadline
        hasBackButton
        header={<FormattedMessage defaultMessage="Add CRUD Example Item" id="AddCrudDemoItem / Header" />}
      />

      <CrudDemoItemForm onSubmit={onFormSubmit} error={error} loading={loadingMutation} />
    </PageLayout>
  );
};
