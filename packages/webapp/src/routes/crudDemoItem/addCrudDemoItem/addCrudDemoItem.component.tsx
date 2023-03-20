import { useMutation } from '@apollo/client';
import { gql } from '@sb/webapp-api-client/graphql';
import { BackButton } from '@sb/webapp-core/components/buttons';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { useSnackbar } from '@sb/webapp-core/snackbar';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router';

import { RoutesConfig } from '../../../app/config/routes';
import { CrudDemoItemForm } from '../crudDemoItemForm';
import { CrudDemoItemFormFields } from '../crudDemoItemForm/crudDemoItemForm.component';
import { crudDemoItemListItemFragment } from '../crudDemoItemList/crudDemoItemListItem';
import { Container, Header } from './addCrudDemoItem.styles';

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
  const { showMessage } = useSnackbar();
  const intl = useIntl();
  const navigate = useNavigate();

  const successMessage = intl.formatMessage({
    id: 'CrudDemoItem form / Success message',
    defaultMessage: '🎉 Changes saved successfully!',
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

      showMessage(successMessage);
      if (id) navigate(generateLocalePath(RoutesConfig.crudDemoItem.details, { id }));
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
    <Container>
      <BackButton to={generateLocalePath(RoutesConfig.crudDemoItem.list)} />
      <Header>
        <FormattedMessage defaultMessage="Add CRUD Example Item" id="AddCrudDemoItem / Header" />
      </Header>
      <CrudDemoItemForm onSubmit={onFormSubmit} error={error} loading={loadingMutation} />
    </Container>
  );
};
