import { FormattedMessage, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import { BackButton } from '../../../shared/components/backButton';
import { RoutesConfig } from '../../../app/config/routes';
import { CrudDemoItemFormFields } from '../crudDemoItemForm/crudDemoItemForm.component';
import { CrudDemoItemForm } from '../crudDemoItemForm';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { gql } from '../../../shared/services/graphqlApi/__generated/gql';
import { useSnackbar } from '../../../modules/snackbar';
import { CRUD_DEMO_ITEM_LIST_ITEM_FRAGMENT } from '../crudDemoItemList/crudDemoItemListItem';

import { Container, Header } from './addCrudDemoItem.styles';

export const ADD_CRUD_DEMO_ITEM_MUTATION = gql(/* GraphQL */ `
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
  const { showMessage } = useSnackbar();
  const intl = useIntl();

  const successMessage = intl.formatMessage({
    id: 'CrudDemoItem form / Success message',
    defaultMessage: '🎉 Changes saved successfully!',
  });

  const [commitCrudDemoItemFormMutation, { error, loading: loadingMutation }] = useMutation(
    ADD_CRUD_DEMO_ITEM_MUTATION,
    {
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
                  fragment: CRUD_DEMO_ITEM_LIST_ITEM_FRAGMENT,
                }),
                __typename: 'CrudDemoItemEdge',
              };
              return { ...existingConnection, edges: [...existingConnection.edges, newItem] };
            },
          },
        });
      },
      onCompleted: () => showMessage(successMessage),
    }
  );

  const onFormSubmit = (formData: CrudDemoItemFormFields) => {
    commitCrudDemoItemFormMutation({
      variables: {
        input: { name: formData.name },
      },
    });
  };

  return (
    <Container>
      <BackButton to={generateLocalePath(RoutesConfig.crudDemoItem.list)} />
      <Header>
        <FormattedMessage defaultMessage="Add CRUD Example Item" id="AddCrudDemoItem / Header" />
      </Header>
      <CrudDemoItemForm onSubmit={onFormSubmit} error={error} loading={loadingMutation} />
    </Container>
  );
};
