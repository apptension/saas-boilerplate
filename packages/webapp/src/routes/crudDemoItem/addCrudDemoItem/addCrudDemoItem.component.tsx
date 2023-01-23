import { FormattedMessage } from 'react-intl';
import { ConnectionHandler } from 'relay-runtime';
import graphql from 'babel-plugin-relay/macro';
import { PreloadedQuery } from 'react-relay';
import { BackButton } from '../../../shared/components/backButton';
import { usePromiseMutation } from '../../../shared/services/graphqlApi/usePromiseMutation';
import { RoutesConfig } from '../../../app/config/routes';
import { CrudDemoItemFormFields } from '../crudDemoItemForm/crudDemoItemForm.component';
import { CrudDemoItemForm } from '../crudDemoItemForm';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { crudDemoItemListQuery } from '../crudDemoItemList/__generated__/crudDemoItemListQuery.graphql';
import { addCrudDemoItemMutation } from './__generated__/addCrudDemoItemMutation.graphql';
import { Container, Header } from './addCrudDemoItem.styles';

export type AddCrudDemoItemProps = () => {
  listQueryRef?: PreloadedQuery<crudDemoItemListQuery> | null;
};

export const AddCrudDemoItem = () => {
  const generateLocalePath = useGenerateLocalePath();
  const [commitCrudDemoItemFormMutation] = usePromiseMutation<addCrudDemoItemMutation>(graphql`
    mutation addCrudDemoItemMutation($input: CreateCrudDemoItemMutationInput!, $connections: [ID!]!) {
      createCrudDemoItem(input: $input) {
        crudDemoItemEdge @appendEdge(connections: $connections) {
          node {
            id
            name
          }
        }
      }
    }
  `);

  const onFormSubmit = async (formData: CrudDemoItemFormFields) => {
    return await commitCrudDemoItemFormMutation({
      variables: {
        input: { name: formData.name },
        connections: [ConnectionHandler.getConnectionID('root', 'crudDemoItemList_allCrudDemoItems')],
      },
    });
  };

  return (
    <Container>
      <BackButton to={generateLocalePath(RoutesConfig.crudDemoItem.list)} />
      <Header>
        <FormattedMessage defaultMessage="Add CRUD Example Item" id="AddCrudDemoItem / Header" />
      </Header>
      <CrudDemoItemForm onSubmit={onFormSubmit} />
    </Container>
  );
};
