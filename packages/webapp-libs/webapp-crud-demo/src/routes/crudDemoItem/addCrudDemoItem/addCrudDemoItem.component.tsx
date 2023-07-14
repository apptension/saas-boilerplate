import { useMutation } from '@apollo/client';
import { gql } from '@sb/webapp-api-client/graphql';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router';

import { RoutesConfig } from '../../../config/routes';
import { CrudDemoItemForm } from '../crudDemoItemForm';
import { CrudDemoItemFormFields } from '../crudDemoItemForm/crudDemoItemForm.component';
import { crudDemoItemListItemFragment } from '../crudDemoItemList/crudDemoItemListItem';

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

  const successMessage = intl.formatMessage({
    id: 'CrudDemoItem form / AddCrudDemoItem / Success message',
    defaultMessage: '🎉 Item added successfully!',
  });

  const [commitCrudDemoItemFormMutation, { error, loading: loadingMutation }] = useMutation(addCrudDemoItemMutation, {
    update(cache, { data }) {
      cache.modify({
        fields: {
          allCrudDemoItems(existingConnection = { edges: [] }) {
            const node = data?.createCrudDemoItem?.crudDemoItemEdge?.node;
            if (!node) {
              return existingConnection;
            }
            const newItem = {
              node: cache.writeFragment({
                data: node,
                fragment: crudDemoItemListItemFragment,
              }),
              __typename: 'CrudDemoItemEdge',
            };
            return { ...existingConnection, edges: [...existingConnection.edges, newItem] };
          },
        },
      });
    },
    onCompleted: (data) => {
      const id = data?.createCrudDemoItem?.crudDemoItemEdge?.node?.id;

      trackEvent('crud', 'add', id);

      toast({ description: successMessage });

      navigate(generateLocalePath(RoutesConfig.crudDemoItem.list));
    },
  });

  const onFormSubmit = (formData: CrudDemoItemFormFields) => {
    commitCrudDemoItemFormMutation({
      variables: {
        input: { name: formData.name },
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
